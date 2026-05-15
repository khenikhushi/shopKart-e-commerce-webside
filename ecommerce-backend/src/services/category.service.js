const { Op } = require('sequelize');
const { Category, SubCategory } = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { generateSlug } = require('../utils/slug.util');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

const buildCategoryTree = (categories) => {
  const map = new Map();
  const roots = [];

  categories.forEach((category) => {
    map.set(category.id, {
      ...category,
      children: [],
    });
  });

  map.forEach((category) => {
    if (category.parent_category_id && map.has(category.parent_category_id)) {
      map.get(category.parent_category_id).children.push(category);
    } else {
      roots.push(category);
    }
  });

  return roots;
};

const validateParentCategory = async (parentCategoryId) => {
  if (!parentCategoryId) {
    return null;
  }

  const category = await Category.findByPk(parentCategoryId);

  if (!category) {
    throw new AppError('Parent category not found', 404);
  }

  return category;
};

const ensureNoCircularParent = async (categoryId, nextParentId) => {
  if (!nextParentId) {
    return;
  }

  if (categoryId === nextParentId) {
    throw new AppError('Category cannot be its own parent', 400);
  }

  let cursorId = nextParentId;
  while (cursorId) {
    if (cursorId === categoryId) {
      throw new AppError('Circular category hierarchy is not allowed', 400);
    }

    const cursorCategory = await Category.findByPk(cursorId, {
      attributes: ['id', 'parent_category_id'],
    });

    if (!cursorCategory) {
      break;
    }

    cursorId = cursorCategory.parent_category_id;
  }
};

/**
 * Create a new category
 * @param {object} data - { name, description, image_url, parent_category_id }
 * @returns {Category}
 */
const createCategory = async (data) => {
  const { name, description, image_url, parent_category_id } = data;

  await validateParentCategory(parent_category_id || null);

  const existing = await Category.findOne({
    where: {
      name,
      parent_category_id: parent_category_id || null,
    },
  });

  if (existing) {
    throw new AppError(
      `Category with name "${name}" already exists at this hierarchy level`,
      409
    );
  }

  const category = await Category.create({
    name,
    description: description || null,
    image_url: image_url || null,
    parent_category_id: parent_category_id || null,
  });

  return category;
};

/**
 * Get all active categories with pagination
 * @param {object} query - req.query
 * @returns {{ categories, pagination }}
 */
const getAllCategories = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const whereClause = { is_active: true };

  if (query.parent_id) {
    whereClause.parent_category_id = query.parent_id;
  }

  if (query.parent_slug) {
    const parent = await Category.findOne({
      where: { slug: query.parent_slug, is_active: true },
      attributes: ['id'],
    });

    if (!parent) {
      return {
        categories: [],
        pagination: getPaginationMeta(0, page, limit),
      };
    }

    whereClause.parent_category_id = parent.id;
  }

  const { count, rows } = await Category.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { categories: rows, pagination };
};

/**
 * Get all categories including inactive - admin use
 * @param {object} query - req.query
 * @returns {{ categories, pagination }}
 */
const getAllCategoriesAdmin = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Category.findAndCountAll({
    include: [
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Category,
        as: 'children',
        required: false,
        attributes: ['id', 'name', 'slug', 'is_active'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { categories: rows, pagination };
};

/**
 * Get categories as hierarchy tree
 * @param {object} query
 * @returns {Array}
 */
const getCategoryTree = async (query = {}) => {
  const whereClause = query.include_inactive === 'true'
    ? {}
    : { is_active: true };

  const categories = await Category.findAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      'slug',
      'description',
      'image_url',
      'is_active',
      'parent_category_id',
    ],
    order: [['name', 'ASC']],
    raw: true,
  });

  return buildCategoryTree(categories);
};

/**
 * Get a single category by slug with children + subcategories
 * @param {string} slug
 * @returns {Category}
 */
const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({
    where: { slug, is_active: true },
    include: [
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name', 'slug', 'description', 'image_url'],
      },
      {
        model: SubCategory,
        as: 'subCategories',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name', 'slug', 'description', 'image_url'],
      },
    ],
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

/**
 * Update a category by slug
 * @param {string} slug
 * @param {object} data
 * @returns {Category}
 */
const updateCategory = async (slug, data) => {
  const category = await Category.findOne({ where: { slug } });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const { name, description, image_url, is_active, parent_category_id } = data;
  const originalParentId = category.parent_category_id || null;

  if (parent_category_id !== undefined) {
    const targetParentId = parent_category_id || null;
    await validateParentCategory(targetParentId);
    await ensureNoCircularParent(category.id, targetParentId);
    category.parent_category_id = targetParentId;
  }

  const nextName = name || category.name;
  const nextParentId = category.parent_category_id || null;
  const hierarchyChanged = nextParentId !== originalParentId;

  if ((name && name !== category.name) || hierarchyChanged) {
    const existing = await Category.findOne({
      where: {
        name: nextName,
        parent_category_id: nextParentId,
        id: { [Op.ne]: category.id },
      },
    });

    if (existing) {
      throw new AppError(
        `Category with name "${name}" already exists at this hierarchy level`,
        409
      );
    }
  }

  if (name && name !== category.name) {
    category.name = name;
    category.slug = generateSlug(name);
  }

  if (description !== undefined) category.description = description;
  if (image_url !== undefined) category.image_url = image_url;
  if (is_active !== undefined) category.is_active = is_active;

  await category.save();

  return category;
};

/**
 * Delete a category by slug (hard delete)
 * @param {string} slug
 */
const deleteCategory = async (slug) => {
  const category = await Category.findOne({ where: { slug } });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const childCategoryCount = await Category.count({
    where: { parent_category_id: category.id },
  });

  if (childCategoryCount > 0) {
    throw new AppError(
      `Cannot delete - this category has ${childCategoryCount} child category(s). Delete child categories first.`,
      400
    );
  }

  const subCategoryCount = await SubCategory.count({
    where: { category_id: category.id },
  });

  if (subCategoryCount > 0) {
    throw new AppError(
      `Cannot delete - this category has ${subCategoryCount} subcategory(s). Delete subcategories first.`,
      400
    );
  }

  await category.destroy();
};

class CategoryService {
  constructor() {
    this.createCategory = createCategory;
    this.getAllCategories = getAllCategories;
    this.getAllCategoriesAdmin = getAllCategoriesAdmin;
    this.getCategoryTree = getCategoryTree;
    this.getCategoryBySlug = getCategoryBySlug;
    this.updateCategory = updateCategory;
    this.deleteCategory = deleteCategory;
  }
}

module.exports = new CategoryService();
