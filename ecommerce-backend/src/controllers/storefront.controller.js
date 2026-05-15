const storefrontService = require('../services/storefront.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { sendSuccess } = require('../utils/response.util');
const {
  getApiBaseUrlFromRequest,
  normalizeProductCollection,
  normalizeProductImage,
  toAbsoluteImageUrl,
} = require('../utils/image.util');

const normalizeCategoryImage = (category, baseUrl) => {
  if (!category) {
    return category;
  }

  return {
    ...category,
    image_url: toAbsoluteImageUrl(category.image_url, baseUrl),
  };
};

const normalizeSlide = (slide, baseUrl) => ({
  ...slide,
  imageUrl: toAbsoluteImageUrl(slide.imageUrl, baseUrl),
});

class StorefrontController {
  constructor() {
    this.getStorefrontHome = asyncHandler(async (req, res) => {
      const home = await storefrontService.getStorefrontHome();
      const baseUrl = getApiBaseUrlFromRequest(req);

      return sendSuccess(res, 'Storefront data fetched successfully', {
        navigation: home.navigation.map((item) =>
          normalizeCategoryImage(item, baseUrl)
        ),
        heroSlides: home.heroSlides.map((slide) => normalizeSlide(slide, baseUrl)),
        featuredCategories: home.featuredCategories.map((item) =>
          normalizeCategoryImage(item, baseUrl)
        ),
        dealSections: home.dealSections.map((section) => ({
          ...section,
          items: normalizeProductCollection(section.items, baseUrl),
        })),
        dealOfDay: normalizeProductImage(home.dealOfDay, baseUrl),
        budgetFinds: normalizeProductCollection(home.budgetFinds, baseUrl),
        trendingProducts: normalizeProductCollection(
          home.trendingProducts,
          baseUrl
        ),
        featuredBrands: home.featuredBrands,
        stats: home.stats,
      });
    });
  }
}

module.exports = new StorefrontController();
