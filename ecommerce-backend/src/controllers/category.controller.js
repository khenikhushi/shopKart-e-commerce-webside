const categoryService = require('../services/category.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response.util');

class CategoryController {
  constructor() {
    /**
     * @group Categories
     * @route POST /api/v1/admin/categories
     */
    this.createCategory = asyncHandler(async (req, res) => {
      const category = await categoryService.createCategory(req.body);

      return sendCreated(res, 'Category created successfully', { category });
    });

    /**
     * @group Categories
     * @route GET /api/v1/categories
     */
    this.getAllCategories = asyncHandler(async (req, res) => {
      const { categories, pagination } = await categoryService.getAllCategories(
        req.query
      );

      return sendPaginated(
        res,
        'Categories fetched successfully',
        { categories },
        pagination
      );
    });

    /**
     * @group Categories
     * @route GET /api/v1/categories/tree
     */
    this.getCategoryTree = asyncHandler(async (req, res) => {
      const categories = await categoryService.getCategoryTree(req.query);

      return sendSuccess(
        res,
        'Category tree fetched successfully',
        { categories }
      );
    });

    /**
     * @group Categories — Admin
     * @route GET /api/v1/admin/categories
     */
    this.getAllCategoriesAdmin = asyncHandler(async (req, res) => {
      const { categories, pagination } =
        await categoryService.getAllCategoriesAdmin(req.query);

      return sendPaginated(
        res,
        'All categories fetched successfully',
        { categories },
        pagination
      );
    });

    /**
     * @group Categories
     * @route GET /api/v1/categories/:slug
     */
    this.getCategoryBySlug = asyncHandler(async (req, res) => {
      const category = await categoryService.getCategoryBySlug(req.params.slug);

      return sendSuccess(res, 'Category fetched successfully', { category });
    });

    /**
     * @group Categories — Admin
     * @route PUT /api/v1/admin/categories/:slug
     */
    this.updateCategory = asyncHandler(async (req, res) => {
      const category = await categoryService.updateCategory(
        req.params.slug,
        req.body
      );

      return sendSuccess(res, 'Category updated successfully', { category });
    });

    /**
     * @group Categories — Admin
     * @route DELETE /api/v1/admin/categories/:slug
     */
    this.deleteCategory = asyncHandler(async (req, res) => {
      await categoryService.deleteCategory(req.params.slug);

      return sendSuccess(res, 'Category deleted successfully');
    });
  }
}

module.exports = new CategoryController();
