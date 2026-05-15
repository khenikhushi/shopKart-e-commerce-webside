const { Op } = require('sequelize');
const {
  Filter,
  FilterValue,
  Product,
  ProductFilter,
  SubCategory,
  Category,
} = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

/**
 * Create a new filter for a category or subcategory
 * @param {object} data - { category_id?, subcategory_id?, name, display_name, filter_type }
 * @returns {Filter}
 */
const createFilter = async (data) => {
  const {
    category_id,
    subcategory_id,
    name,
    display_name,
    filter_type,
  } = data;

  let resolvedCategoryId = category_id || null;
  let resolvedSubCategoryId = subcategory_id || null;

  if (!resolvedCategoryId && !resolvedSubCategoryId) {
    throw new AppError('Either category_id or subcategory_id is required', 400);
  }

  if (resolvedSubCategoryId) {
    const subCategory = await SubCategory.findOne({
      where: { id: resolvedSubCategoryId, is_active: true },
      attributes: ['id', 'category_id'],
    });

    if (!subCategory) {
      throw new AppError('SubCategory not found or is inactive', 404);
    }

    if (resolvedCategoryId && resolvedCategoryId !== subCategory.category_id) {
      throw new AppError(
        'subcategory_id does not belong to the provided category_id',
        400
      );
    }

    resolvedCategoryId = subCategory.category_id;
  } else {
    const category = await Category.findOne({
      where: { id: resolvedCategoryId, is_active: true },
      attributes: ['id'],
    });

    if (!category) {
      throw new AppError('Category not found or is inactive', 404);
    }
  }

  const existing = await Filter.findOne({
    where: {
      name,
      category_id: resolvedCategoryId,
      subcategory_id: resolvedSubCategoryId,
    },
  });

  if (existing) {
    throw new AppError('Filter already exists for this category scope', 409);
  }

  const filter = await Filter.create({
    category_id: resolvedCategoryId,
    subcategory_id: resolvedSubCategoryId,
    name,
    display_name,
    filter_type,
  });

  return filter;
};

/**
 * Add a filter value to a filter
 * @param {string} filterId
 * @param {string} value
 * @returns {FilterValue}
 */
const addFilterValue = async (filterId, value) => {
  const filter = await Filter.findByPk(filterId);
  if (!filter) {
    throw new AppError('Filter not found', 404);
  }

  const existing = await FilterValue.findOne({
    where: { filter_id: filterId, value },
  });

  if (existing) {
    throw new AppError('Filter value already exists', 409);
  }

  const filterValue = await FilterValue.create({
    filter_id: filterId,
    value,
  });

  return filterValue;
};

/**
 * Assign filters to a product
 * @param {string} productId
 * @param {array} filters - array of { filter_value_id }
 * @returns {array} assigned ProductFilter records
 */
const assignFiltersToProduct = async (productId, filters) => {
  const product = await Product.findByPk(productId, {
    include: [
      {
        model: SubCategory,
        as: 'subCategory',
        attributes: ['id', 'category_id'],
      },
    ],
    attributes: ['id', 'subcategory_id'],
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const filterValueIds = [...new Set(filters.map((f) => f.filter_value_id))];

  if (filterValueIds.length === 0) {
    await ProductFilter.destroy({
      where: { product_id: productId },
    });

    return [];
  }

  const filterValues = await FilterValue.findAll({
    where: { id: filterValueIds },
    include: [
      {
        model: Filter,
        as: 'filter',
        attributes: ['id', 'category_id', 'subcategory_id'],
      },
    ],
  });

  if (filterValues.length !== filterValueIds.length) {
    throw new AppError('One or more filter values not found', 404);
  }

  for (const fv of filterValues) {
    if (!fv.filter) {
      throw new AppError('Invalid filter mapping found for filter value', 400);
    }

    const sameSubCategoryScope =
      fv.filter.subcategory_id &&
      fv.filter.subcategory_id === product.subcategory_id;

    const sameCategoryScope =
      !fv.filter.subcategory_id &&
      fv.filter.category_id &&
      fv.filter.category_id === product.subCategory?.category_id;

    if (!sameSubCategoryScope && !sameCategoryScope) {
      throw new AppError(
        'Filter does not belong to this product category/subcategory scope',
        400
      );
    }
  }

  await ProductFilter.destroy({
    where: { product_id: productId },
  });

  const data = filterValues.map((fv) => ({
      product_id: productId,
      filter_id: fv.filter.id,
      filter_value_id: fv.id,
    }));

  const uniqueData = data.filter(
    (v, i, self) =>
      i === self.findIndex(
        t =>
          t.product_id === v.product_id &&
          t.filter_id === v.filter_id &&
          t.filter_value_id === v.filter_value_id
      )
  );
  const productFilters = await ProductFilter.bulkCreate(uniqueData
  );

  return productFilters;
};

/**
 * Get all filters for admin
 * @param {object} query
 * @returns {{ filters, pagination }}
 */
const getAllFiltersAdmin = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const whereClause = {};

  if (query.category_id) {
    whereClause.category_id = query.category_id;
  }

  if (query.subcategory_id) {
    whereClause.subcategory_id = query.subcategory_id;
  }

  if (query.is_active !== undefined) {
    whereClause.is_active = query.is_active === 'true';
  }

  const { count, rows } = await Filter.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: SubCategory,
        as: 'subCategory',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: FilterValue,
        as: 'values',
        attributes: ['id', 'value'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { filters: rows, pagination };
};

/**
 * Get filters for a subcategory (subcategory-level + category-level)
 * @param {string} subCategorySlug
 * @returns {{ subCategory, filters }}
 */
const getFiltersBySubCategory = async (subCategorySlug) => {
  const subCategory = await SubCategory.findOne({
    where: { slug: subCategorySlug, is_active: true },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    attributes: ['id', 'name', 'slug', 'category_id'],
  });

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  const filters = await Filter.findAll({
    where: {
      is_active: true,
      [Op.or]: [
        { subcategory_id: subCategory.id },
        {
          subcategory_id: null,
          category_id: subCategory.category_id,
        },
      ],
    },
    include: [
      {
        model: FilterValue,
        as: 'values',
        attributes: ['id', 'value'],
      },
    ],
    order: [['display_name', 'ASC']],
  });

  return { subCategory, filters };
};

/**
 * Get category-level filters for a category
 * @param {string} categorySlug
 * @returns {{ category, filters }}
 */
const getFiltersByCategory = async (categorySlug) => {
  const category = await Category.findOne({
    where: { slug: categorySlug, is_active: true },
    attributes: ['id', 'name', 'slug'],
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const filters = await Filter.findAll({
    where: {
      is_active: true,
      category_id: category.id,
      subcategory_id: null,
    },
    include: [
      {
        model: FilterValue,
        as: 'values',
        attributes: ['id', 'value'],
      },
    ],
    order: [['display_name', 'ASC']],
  });

  return { category, filters };
};

/**
 * Delete a filter and related filter values/product mappings
 * @param {string} filterId
 */
const deleteFilter = async (filterId) => {
  const filter = await Filter.findByPk(filterId);

  if (!filter) {
    throw new AppError('Filter not found', 404);
  }

  const valueIds = (await FilterValue.findAll({
    where: { filter_id: filterId },
    attributes: ['id'],
    raw: true,
  })).map((item) => item.id);

  if (valueIds.length > 0) {
    await ProductFilter.destroy({
      where: { filter_value_id: valueIds },
    });
  }

  await ProductFilter.destroy({
    where: { filter_id: filterId },
  });

  await FilterValue.destroy({
    where: { filter_id: filterId },
  });

  await filter.destroy();
};

/**
 * Delete a single filter value
 * @param {string} filterId
 * @param {string} valueId
 */
const deleteFilterValue = async (filterId, valueId) => {
  const filterValue = await FilterValue.findOne({
    where: {
      id: valueId,
      filter_id: filterId,
    },
  });

  if (!filterValue) {
    throw new AppError('Filter value not found', 404);
  }

  await ProductFilter.destroy({
    where: { filter_value_id: valueId },
  });

  await filterValue.destroy();
};

class FilterService {
  constructor() {
    this.createFilter = createFilter;
    this.addFilterValue = addFilterValue;
    this.assignFiltersToProduct = assignFiltersToProduct;
    this.getAllFiltersAdmin = getAllFiltersAdmin;
    this.getFiltersBySubCategory = getFiltersBySubCategory;
    this.getFiltersByCategory = getFiltersByCategory;
    this.deleteFilter = deleteFilter;
    this.deleteFilterValue = deleteFilterValue;
  }
}

module.exports = new FilterService();
