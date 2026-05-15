const filterService = require('../services/filter.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response.util');

class FilterController {
  constructor() {
    /**
     * @group Filters — Admin
     * @route POST /api/v1/admin/filters
     */
    this.createFilter = asyncHandler(async (req, res) => {
      const filter = await filterService.createFilter(req.body);

      return sendCreated(res, 'Filter created successfully', { filter });
    });

    /**
     * @group Filters — Admin
     * @route POST /api/v1/admin/filters/:filterId/values
     */
    this.addFilterValue = asyncHandler(async (req, res) => {
      const filterValue = await filterService.addFilterValue(
        req.params.filterId,
        req.body.value
      );

      return sendCreated(
        res,
        'Filter value added successfully',
        { filterValue }
      );
    });

    /**
     * @group Filters — Admin
     * @route GET /api/v1/admin/filters
     */
    this.getAllFiltersAdmin = asyncHandler(async (req, res) => {
      const { filters, pagination } =
        await filterService.getAllFiltersAdmin(req.query);

      return sendPaginated(
        res,
        'Filters fetched successfully',
        { filters },
        pagination
      );
    });

    /**
     * @group Filters
     * @route GET /api/v1/filters/:subCategorySlug
     */
    this.getFiltersBySubCategory = asyncHandler(async (req, res) => {
      const { subCategory, filters } =
        await filterService.getFiltersBySubCategory(req.params.subCategorySlug);

      return sendSuccess(res, 'Filters fetched successfully', {
        subCategory: {
          id: subCategory.id,
          name: subCategory.name,
          slug: subCategory.slug,
        },
        filters,
      });
    });

    /**
     * @group Filters
     * @route GET /api/v1/filters/category/:categorySlug
     */
    this.getFiltersByCategory = asyncHandler(async (req, res) => {
      const { category, filters } =
        await filterService.getFiltersByCategory(req.params.categorySlug);

      return sendSuccess(res, 'Filters fetched successfully', {
        category,
        filters,
      });
    });

    /**
     * @group Filters — Admin
     * @route DELETE /api/v1/admin/filters/:filterId
     */
    this.deleteFilter = asyncHandler(async (req, res) => {
      await filterService.deleteFilter(req.params.filterId);

      return sendSuccess(res, 'Filter deleted successfully');
    });

    /**
     * @group Filters — Admin
     * @route DELETE /api/v1/admin/filters/:filterId/values/:valueId
     */
    this.deleteFilterValue = asyncHandler(async (req, res) => {
      await filterService.deleteFilterValue(
        req.params.filterId,
        req.params.valueId
      );

      return sendSuccess(res, 'Filter value deleted successfully');
    });
  }
}

module.exports = new FilterController();
