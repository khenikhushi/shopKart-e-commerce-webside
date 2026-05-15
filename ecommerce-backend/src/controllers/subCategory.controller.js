const subCategoryService = require('../services/subCategory.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response.util');

class SubCategoryController {
  constructor() {
    /**
     * @group SubCategories — Admin
     * @route POST /api/v1/admin/subcategories
     */
    this.createSubCategory = asyncHandler(async (req, res) => {
      const subCategory = await subCategoryService.createSubCategory(req.body);

      return sendCreated(
        res,
        'SubCategory created successfully',
        { subCategory }
      );
    });

    /**
     * @group SubCategories
     * @route GET /api/v1/subcategories
     */
    this.getAllSubCategories = asyncHandler(async (req, res) => {
      const { subCategories, pagination } =
        await subCategoryService.getAllSubCategories(req.query);

      return sendPaginated(
        res,
        'SubCategories fetched successfully',
        { subCategories },
        pagination
      );
    });

    /**
     * @group SubCategories — Admin
     * @route GET /api/v1/admin/subcategories
     */
    this.getAllSubCategoriesAdmin = asyncHandler(async (req, res) => {
      const { subCategories, pagination } =
        await subCategoryService.getAllSubCategoriesAdmin(req.query);

      return sendPaginated(
        res,
        'All subcategories fetched successfully',
        { subCategories },
        pagination
      );
    });

    /**
     * @group SubCategories
     * @route GET /api/v1/subcategories/:slug
     */
    this.getSubCategoryBySlug = asyncHandler(async (req, res) => {
      const subCategory = await subCategoryService.getSubCategoryBySlug(
        req.params.slug
      );

      return sendSuccess(
        res,
        'SubCategory fetched successfully',
        { subCategory }
      );
    });

    /**
     * @group SubCategories — Admin
     * @route PUT /api/v1/admin/subcategories/:slug
     */
    this.updateSubCategory = asyncHandler(async (req, res) => {
      const subCategory = await subCategoryService.updateSubCategory(
        req.params.slug,
        req.body
      );

      return sendSuccess(
        res,
        'SubCategory updated successfully',
        { subCategory }
      );
    });

    /**
     * @group SubCategories — Admin
     * @route DELETE /api/v1/admin/subcategories/:slug
     */
    this.deleteSubCategory = asyncHandler(async (req, res) => {
      await subCategoryService.deleteSubCategory(req.params.slug);

      return sendSuccess(res, 'SubCategory deleted successfully');
    });
  }
}

module.exports = new SubCategoryController();