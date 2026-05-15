const { SubCategory, Category, Filter } = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { generateSlug } = require('../utils/slug.util');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

/**
 * Verify parent category exists and is active
 * Reused by create and update
 * @param {string} categoryId
 * @returns {Category}
 */
const validateParentCategory = async (categoryId) => {
  const category = await Category.findOne({
    where: { id: categoryId, is_active: true },
  });

  if (!category) {
    throw new AppError(
      'Parent category not found or is inactive',
      404
    );
  }

  return category;
};

/**
 * Create a new subcategory
 * @param {object} data - { name, category_id, description, image_url }
 * @returns {SubCategory}
 */
const createSubCategory = async (data) => {
  const { name, category_id, description, image_url } = data;

  // Validate parent category exists
  await validateParentCategory(category_id);

  // Check for duplicate name within same category
  const existing = await SubCategory.findOne({
    where: { name, category_id },
  });

  if (existing) {
    throw new AppError(
      `SubCategory "${name}" already exists in this category`,
      409
    );
  }

  const subCategory = await SubCategory.create({
    name,
    category_id,
    description: description || null,
    image_url: image_url || null,
  });

  // Return with parent category included
  const result = await SubCategory.findByPk(subCategory.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  });

  return result;
};

/**
 * Get all active subcategories with pagination
 * Optionally filter by category slug
 * @param {object} query - req.query
 * @returns {{ subCategories, pagination }}
 */
const getAllSubCategories = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const whereClause = { is_active: true };
  const categoryWhere = {};

  if (query.category) {
    categoryWhere.slug = query.category;
  }

  if (query.category_id) {
    categoryWhere.id = query.category_id;
  }

  const { count, rows } = await SubCategory.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        where: categoryWhere,
        required: Object.keys(categoryWhere).length > 0,
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { subCategories: rows, pagination };
};

/**
 * Get all subcategories — admin view (includes inactive)
 * @param {object} query
 * @returns {{ subCategories, pagination }}
 */
const getAllSubCategoriesAdmin = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await SubCategory.findAndCountAll({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { subCategories: rows, pagination };
};

/**
 * Get a single subcategory by slug
 * Includes parent category and filters defined for it
 * @param {string} slug
 * @returns {SubCategory}
 */
const getSubCategoryBySlug = async (slug) => {
  const subCategory = await SubCategory.findOne({
    where: { slug, is_active: true },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Filter,
        as: 'filters',
        where: { is_active: true },
        required: false,
        attributes: [
          'id',
          'name',
          'display_name',
          'filter_type',
        ],
      },
    ],
  });

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  return subCategory;
};

/**
 * Update subcategory by slug
 * @param {string} slug
 * @param {object} data
 * @returns {SubCategory}
 */
const updateSubCategory = async (slug, data) => {
  const subCategory = await SubCategory.findOne({ where: { slug } });

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  const { name, category_id, description, image_url, is_active } = data;

  // Validate new parent category if being changed
  if (category_id && category_id !== subCategory.category_id) {
    await validateParentCategory(category_id);
    subCategory.category_id = category_id;
  }

  // Regenerate slug if name changes
  if (name && name !== subCategory.name) {
    const targetCategoryId = category_id || subCategory.category_id;

    const existing = await SubCategory.findOne({
      where: { name, category_id: targetCategoryId },
    });

    if (existing) {
      throw new AppError(
        `SubCategory "${name}" already exists in this category`,
        409
      );
    }

    subCategory.name = name;
    subCategory.slug = generateSlug(name);
  }

  if (description !== undefined) subCategory.description = description;
  if (image_url !== undefined) subCategory.image_url = image_url;
  if (is_active !== undefined) subCategory.is_active = is_active;

  await subCategory.save();

  // Return updated record with associations
  const result = await SubCategory.findByPk(subCategory.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  });

  return result;
};

/**
 * Delete subcategory by slug
 * @param {string} slug
 */
const deleteSubCategory = async (slug) => {
  const subCategory = await SubCategory.findOne({ where: { slug } });

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  // Prevent deletion if products exist under this subcategory
  const { Product } = require('../models/index');
  const productCount = await Product.count({
    where: { subcategory_id: subCategory.id },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete — this subcategory has ${productCount} product(s). Remove products first.`,
      400
    );
  }

  await subCategory.destroy();
};

class SubCategoryService {
  constructor() {
    this.createSubCategory = createSubCategory;
    this.getAllSubCategories = getAllSubCategories;
    this.getAllSubCategoriesAdmin = getAllSubCategoriesAdmin;
    this.getSubCategoryBySlug = getSubCategoryBySlug;
    this.updateSubCategory = updateSubCategory;
    this.deleteSubCategory = deleteSubCategory;
  }
}

module.exports = new SubCategoryService();
