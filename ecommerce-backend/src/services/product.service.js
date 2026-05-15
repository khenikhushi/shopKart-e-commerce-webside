const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Product,
  User,
  SubCategory,
  Category,
  Filter,
  FilterValue,
  ProductFilter,
} = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { generateSlug } = require('../utils/slug.util');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

const normalizeFilterValue = (value) => String(value || '').trim();

const syncDynamicBrandFilterForProduct = async (
  productId,
  subcategoryId,
  rawBrand
) => {
  const brand = normalizeFilterValue(rawBrand);

  const subCategory = await SubCategory.findOne({
    where: { id: subcategoryId },
    attributes: ['id', 'category_id'],
  });

  if (!subCategory?.category_id) {
    return;
  }

  const [brandFilter] = await Filter.findOrCreate({
    where: {
      name: 'brand',
      category_id: subCategory.category_id,
      subcategory_id: subcategoryId,
    },
    defaults: {
      display_name: 'Brand',
      filter_type: 'checkbox',
      is_active: true,
    },
  });

  if (!brand) {
    await ProductFilter.destroy({
      where: {
        product_id: productId,
        filter_id: brandFilter.id,
      },
    });
    return;
  }

  const [brandValue] = await FilterValue.findOrCreate({
    where: {
      filter_id: brandFilter.id,
      value: brand,
    },
  });

  await ProductFilter.destroy({
    where: {
      product_id: productId,
      filter_id: brandFilter.id,
    },
  });

  await ProductFilter.create({
    product_id: productId,
    filter_id: brandFilter.id,
    filter_value_id: brandValue.id,
  });
};

/**
 * Build the standard product include array
 * Reused across multiple queries
 */
const getProductIncludes = () => [
  {
    model: User,
    as: 'seller',
    attributes: ['id', 'name', 'slug', 'email'],
  },
  {
    model: SubCategory,
    as: 'subCategory',
    attributes: ['id', 'name', 'slug'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  },
  {
    model: Filter,
    as: 'filters',
    attributes: ['id', 'name', 'display_name', 'filter_type'],
    through: {
      model: ProductFilter,
      attributes: [],
    },
    include: [
      {
        model: FilterValue,
        as: 'values',
        attributes: ['id', 'value'],
      },
    ],
  },
];

const parseQueryValues = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parsePriceRange = (query = {}) => {
  const minPrice = query.min_price !== undefined
    ? parseFloat(query.min_price)
    : null;
  const maxPrice = query.max_price !== undefined
    ? parseFloat(query.max_price)
    : null;

  if (minPrice !== null && Number.isNaN(minPrice)) {
    throw new AppError('min_price must be a valid number', 400);
  }

  if (maxPrice !== null && Number.isNaN(maxPrice)) {
    throw new AppError('max_price must be a valid number', 400);
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new AppError('min_price cannot be greater than max_price', 400);
  }

  return { minPrice, maxPrice };
};

const applyPriceWhere = (where, minPrice, maxPrice) => {
  if (minPrice === null && maxPrice === null) {
    return;
  }

  where.price = {};
  if (minPrice !== null) where.price[Op.gte] = minPrice;
  if (maxPrice !== null) where.price[Op.lte] = maxPrice;
};

const getCategoryAndDescendantIds = async (rootCategoryId) => {
  const ids = new Set([rootCategoryId]);
  let frontier = [rootCategoryId];

  while (frontier.length > 0) {
    const children = await Category.findAll({
      where: { parent_category_id: { [Op.in]: frontier } },
      attributes: ['id'],
      raw: true,
    });

    frontier = children
      .map((row) => row.id)
      .filter((id) => !ids.has(id));

    frontier.forEach((id) => ids.add(id));
  }

  return [...ids];
};

/**
 * Create a new product — seller only
 * @param {object} data
 * @param {string} sellerId - from req.user.id
 * @returns {Product}
 */
const createProduct = async (data, sellerId) => {
  const {
    name,
    subcategory_id,
    price,
    mrp,
    stock,
    description,
    brand,
    thumbnail_url,
    image_urls,
  } = data;

  // Validate subcategory exists
  const subCategory = await SubCategory.findOne({
    where: { id: subcategory_id, is_active: true },
  });

  if (!subCategory) {
    throw new AppError('SubCategory not found or is inactive', 404);
  }

  // Validate MRP >= price if provided
  if (mrp && parseFloat(mrp) < parseFloat(price)) {
    throw new AppError('MRP cannot be less than selling price', 400);
  }

  const product = await Product.create({
    name,
    subcategory_id,
    seller_id: sellerId,
    price,
    mrp: mrp || null,
    stock,
    description: description || null,
    brand: brand || null,
    thumbnail_url: thumbnail_url || null,
    image_urls: Array.isArray(image_urls) && image_urls.length > 0
      ? image_urls
      : null,
  });

  await syncDynamicBrandFilterForProduct(
    product.id,
    product.subcategory_id,
    product.brand
  );

  const result = await Product.findByPk(product.id, {
    include: getProductIncludes(),
  });

  return result;
};

/**
 * Get all active products — public browse with filter support
 * Supports query params: ?Brand=Samsung&RAM=8+GB&page=1&limit=10
 * @param {object} query - req.query
 * @returns {{ products, pagination }}
 */
const getAllProducts = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const reservedKeys = [
    'page',
    'limit',
    'sort',
    'order',
    'search',
    'category',
    'categoryId',
    'category_id',
    'subcategory',
    'subcategoryId',
    'subcategory_id',
    'brand',
    'min_price',
    'max_price',
  ];

  // Extract non-system keys as dynamic filter params
  const filterParams = Object.keys(query)
    .filter((key) => !reservedKeys.includes(key) && query[key] !== undefined)
    .reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  const productWhere = { is_active: true };
  const searchConditions = [];

  if (query.search) {
    const searchTerm = `%${query.search}%`;
    searchConditions.push(
      { name: { [Op.like]: searchTerm } },
      { description: { [Op.like]: searchTerm } },
      { brand: { [Op.like]: searchTerm } },
      sequelize.where(sequelize.col('subCategory.name'), { [Op.like]: searchTerm }),
      sequelize.where(sequelize.col('subCategory.category.name'), { [Op.like]: searchTerm })
    );
  }

  if (query.brand) {
    const brands = parseQueryValues(query.brand);
    if (brands.length > 0) {
      productWhere.brand = { [Op.in]: brands };
    }
  }

  const { minPrice, maxPrice } = parsePriceRange(query);
  applyPriceWhere(productWhere, minPrice, maxPrice);

  const subCategoryWhere = { is_active: true };
  const categoryWhere = { is_active: true };

  const categoryLookup = query.categoryId || query.category_id || query.category;

  if (categoryLookup) {
    const categoryWhereClause = { is_active: true };

    if (query.categoryId || query.category_id) {
      categoryWhereClause.id = query.categoryId || query.category_id;
    } else {
      categoryWhereClause.slug = query.category;
    }

    const category = await Category.findOne({
      where: categoryWhereClause,
      attributes: ['id'],
      raw: true,
    });

    if (!category) {
      return {
        products: [],
        pagination: getPaginationMeta(0, page, limit),
      };
    }

    const categoryIds = await getCategoryAndDescendantIds(category.id);
    categoryWhere.id = { [Op.in]: categoryIds };
  }

  if (query.subcategory) {
    subCategoryWhere.slug = query.subcategory;
  }

  if (query.subcategoryId || query.subcategory_id) {
    subCategoryWhere.id = query.subcategoryId || query.subcategory_id;
  }

  const sortField = query.sort || 'created_at';
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC';
  const validSortFields = ['price', 'created_at', 'name'];
  const orderClause = validSortFields.includes(sortField)
    ? [[sortField, sortOrder]]
    : [['created_at', 'DESC']];

  let filteredProductIds = null;

  if (Object.keys(filterParams).length > 0) {
    const filterCriteria = [];
    for (const [filterName, filterValue] of Object.entries(filterParams)) {
      const values = parseQueryValues(filterValue);
      if (values.length === 0) {
        continue;
      }

      const matchingValues = await FilterValue.findAll({
        include: [
          {
            model: Filter,
            as: 'filter',
            where: { name: filterName, is_active: true },
            attributes: [],
          },
        ],
        where: { value: { [Op.in]: values } },
        attributes: ['id'],
        raw: true,
      });

      if (matchingValues.length === 0) {
        return {
          products: [],
          pagination: getPaginationMeta(0, page, limit),
        };
      }

      filterCriteria.push({
        name: filterName,
        valueIds: matchingValues.map((v) => v.id),
      });
    }

    if (filterCriteria.length > 0) {
      const allValueIds = [...new Set(
        filterCriteria.flatMap((item) => item.valueIds)
      )];
      const filterNames = filterCriteria.map((item) => item.name);

      const productFilterMatches = await ProductFilter.findAll({
        attributes: [
          'product_id',
          [
            sequelize.fn(
              'COUNT',
              sequelize.fn('DISTINCT', sequelize.col('filter.name'))
            ),
            'matched_filter_count',
          ],
        ],
        include: [
          {
            model: Filter,
            as: 'filter',
            attributes: [],
            required: true,
            where: { name: { [Op.in]: filterNames }, is_active: true },
          },
        ],
        where: { filter_value_id: { [Op.in]: allValueIds } },
        group: ['product_id'],
        having: sequelize.literal(
          `COUNT(DISTINCT \`filter\`.\`name\`) = ${filterNames.length}`
        ),
        raw: true,
      });

      filteredProductIds = productFilterMatches.map((row) => row.product_id);

      if (filteredProductIds.length === 0) {
        return {
          products: [],
          pagination: getPaginationMeta(0, page, limit),
        };
      }

      productWhere.id = { [Op.in]: filteredProductIds };
    }
  }

  if (searchConditions.length > 0) {
    productWhere[Op.or] = searchConditions;
  }

  const { count, rows } = await Product.findAndCountAll({
    where: productWhere,
    include: [
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: SubCategory,
        as: 'subCategory',
        where: subCategoryWhere,
        attributes: ['id', 'name', 'slug'],
        include: [
          {
            model: Category,
            as: 'category',
            where: categoryWhere,
            attributes: ['id', 'name', 'slug'],
          },
        ],
      },
    ],
    order: orderClause,
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { products: rows, pagination };
};

/**
 * Get distinct brand names for sidebar filters
 * Supports context filters: category/subcategory/search/price
 * @param {object} query
 * @returns {string[]}
 */
const getAvailableBrands = async (query = {}) => {
  const productWhere = {
    is_active: true,
    brand: { [Op.not]: null },
  };

  if (query.search) {
    productWhere[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { description: { [Op.like]: `%${query.search}%` } },
      { brand: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { minPrice, maxPrice } = parsePriceRange(query);
  applyPriceWhere(productWhere, minPrice, maxPrice);

  const subCategoryWhere = { is_active: true };
  const categoryWhere = { is_active: true };

  const categoryLookup = query.categoryId || query.category_id || query.category;

  if (categoryLookup) {
    const categoryWhereClause = { is_active: true };

    if (query.categoryId || query.category_id) {
      categoryWhereClause.id = query.categoryId || query.category_id;
    } else {
      categoryWhereClause.slug = query.category;
    }

    const category = await Category.findOne({
      where: categoryWhereClause,
      attributes: ['id'],
      raw: true,
    });

    if (!category) {
      return [];
    }

    const categoryIds = await getCategoryAndDescendantIds(category.id);
    categoryWhere.id = { [Op.in]: categoryIds };
  }

  if (query.subcategory) {
    subCategoryWhere.slug = query.subcategory;
  }

  if (query.subcategoryId || query.subcategory_id) {
    subCategoryWhere.id = query.subcategoryId || query.subcategory_id;
  }

  const rows = await Product.findAll({
    attributes: ['brand'],
    where: productWhere,
    include: [
      {
        model: SubCategory,
        as: 'subCategory',
        attributes: [],
        required: true,
        where: subCategoryWhere,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: [],
            required: true,
            where: categoryWhere,
          },
        ],
      },
    ],
    raw: true,
  });

  return [...new Set(
    rows
      .map((row) => String(row.brand || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
};

/**
 * Get a single product by slug — public
 * @param {string} slug
 * @returns {Product}
 */
const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug, is_active: true },
    include: getProductIncludes(),
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Get all products belonging to a specific seller
 * @param {string} sellerId
 * @param {object} query
 * @returns {{ products, pagination }}
 */
const getSellerProducts = async (sellerId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Product.findAndCountAll({
    where: { seller_id: sellerId },
    include: [
      {
        model: SubCategory,
        as: 'subCategory',
        attributes: ['id', 'name', 'slug'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { products: rows, pagination };
};

/**
 * Get one product belonging to a specific seller
 * @param {string} slug
 * @param {string} sellerId
 * @returns {Product}
 */
const getSellerProductBySlug = async (slug, sellerId) => {
  const product = await Product.findOne({
    where: { slug, seller_id: sellerId },
    include: getProductIncludes(),
  });

  if (!product) {
    throw new AppError(
      'Product not found or you do not have permission to view it',
      404
    );
  }

  return product;
};

/**
 * Get all products — admin view
 * @param {object} query
 * @returns {{ products, pagination }}
 */
const getAllProductsAdmin = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Product.findAndCountAll({
    include: [
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'email', 'slug'],
      },
      {
        model: SubCategory,
        as: 'subCategory',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { products: rows, pagination };
};

/**
 * Update a product — seller can only update their own
 * @param {string} slug
 * @param {object} data
 * @param {string} sellerId
 * @returns {Product}
 */
const updateProduct = async (slug, data, sellerId) => {
  const product = await Product.findOne({
    where: { slug, seller_id: sellerId },
  });

  if (!product) {
    throw new AppError(
      'Product not found or you do not have permission to edit it',
      404
    );
  }

  const {
    name,
    price,
    mrp,
    stock,
    description,
    brand,
    thumbnail_url,
    image_urls,
    is_active,
    subcategory_id,
  } = data;

  // Validate subcategory if being changed
  if (subcategory_id && subcategory_id !== product.subcategory_id) {
    const subCategory = await SubCategory.findOne({
      where: { id: subcategory_id, is_active: true },
    });
    if (!subCategory) {
      throw new AppError('SubCategory not found or is inactive', 404);
    }
    product.subcategory_id = subcategory_id;
  }

  // Validate MRP >= price
  const newPrice = price || product.price;
  const newMrp = mrp || product.mrp;
  if (newMrp && parseFloat(newMrp) < parseFloat(newPrice)) {
    throw new AppError('MRP cannot be less than selling price', 400);
  }

  // Regenerate slug if name changes
  if (name && name !== product.name) {
    product.name = name;
    product.slug = generateSlug(name);
  }

  if (price !== undefined) product.price = price;
  if (mrp !== undefined) product.mrp = mrp;
  if (stock !== undefined) product.stock = stock;
  if (description !== undefined) product.description = description;
  if (brand !== undefined) product.brand = brand;
  if (thumbnail_url !== undefined) product.thumbnail_url = thumbnail_url;
  if (image_urls !== undefined) {
    product.image_urls = Array.isArray(image_urls) && image_urls.length > 0
      ? image_urls
      : null;
  }
  if (is_active !== undefined) product.is_active = is_active;

  await product.save();

  await syncDynamicBrandFilterForProduct(
    product.id,
    product.subcategory_id,
    product.brand
  );

  const result = await Product.findByPk(product.id, {
    include: getProductIncludes(),
  });

  return result;
};

/**
 * Delete a product — seller can only delete their own
 * @param {string} slug
 * @param {string} sellerId
 */
const deleteProduct = async (slug, sellerId) => {
  const product = await Product.findOne({
    where: { slug, seller_id: sellerId },
  });

  if (!product) {
    throw new AppError(
      'Product not found or you do not have permission to delete it',
      404
    );
  }

  // Remove filter assignments first
  await ProductFilter.destroy({ where: { product_id: product.id } });

  await product.destroy();
};

/**
 * Update product status — admin only
 * @param {string} slug
 * @param {boolean} is_active
 * @returns {Product}
 */
const updateProductStatus = async (slug, is_active) => {
  const product = await Product.findOne({ where: { slug } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.is_active = is_active;
  await product.save();

  return product;
};

class ProductService {
  constructor() {
    this.createProduct = createProduct;
    this.getAllProducts = getAllProducts;
    this.getAvailableBrands = getAvailableBrands;
    this.getProductBySlug = getProductBySlug;
    this.getSellerProducts = getSellerProducts;
    this.getSellerProductBySlug = getSellerProductBySlug;
    this.getAllProductsAdmin = getAllProductsAdmin;
    this.updateProduct = updateProduct;
    this.deleteProduct = deleteProduct;
    this.updateProductStatus = updateProductStatus;
  }
}

module.exports = new ProductService();
