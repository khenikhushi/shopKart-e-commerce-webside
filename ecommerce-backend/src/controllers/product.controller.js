const productService = require('../services/product.service');
const filterService = require('../services/filter.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { AppError } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response.util');
const {
  getApiBaseUrlFromRequest,
  sanitizeProductImageInput,
  sanitizeProductImageCollection,
  normalizeProductImage,
  normalizeProductCollection,
} = require('../utils/image.util');
const {
  assignProductFiltersValidator,
} = require('../validators/filter.validator');

const MAX_PRODUCT_IMAGES = 6;

const getUploadedProductImages = (req) =>
  (req.processedFiles || [])
    .map((file) => `/uploads/${file.filename}`)
    .filter(Boolean);

const normalizeProductInput = (req) => {
  if (typeof req.body.is_active === 'string') {
    req.body.is_active = req.body.is_active === 'true';
  }

  const uploadedImages = getUploadedProductImages(req);
  const hasImageUrlsInput = req.body.image_urls !== undefined;
  const hasThumbnailInput = req.body.thumbnail_url !== undefined;

  if (
    !hasImageUrlsInput &&
    !hasThumbnailInput &&
    uploadedImages.length === 0
  ) {
    return;
  }

  const baseUrl = getApiBaseUrlFromRequest(req);
  const rawThumbnailUrl = String(req.body.thumbnail_url || '').trim();
  const sanitizedThumbnail = hasThumbnailInput
    ? sanitizeProductImageInput(req.body.thumbnail_url, baseUrl)
    : undefined;

  if (hasThumbnailInput && rawThumbnailUrl && sanitizedThumbnail === null) {
    throw new AppError(
      'Use Upload Image from PC or a valid http(s) image URL',
      400
    );
  }

  const sanitizedImageUrls = hasImageUrlsInput
    ? sanitizeProductImageCollection(req.body.image_urls, baseUrl)
    : undefined;

  if (hasImageUrlsInput && sanitizedImageUrls === null) {
    throw new AppError(
      'One or more existing product images are invalid',
      400
    );
  }

  const mergedImages = [...new Set([
    ...(sanitizedImageUrls || []),
    ...uploadedImages,
    ...(sanitizedThumbnail ? [sanitizedThumbnail] : []),
  ])];

  if (mergedImages.length > MAX_PRODUCT_IMAGES) {
    throw new AppError(
      `You can upload up to ${MAX_PRODUCT_IMAGES} product images`,
      400
    );
  }

  req.body.image_urls = mergedImages;
  req.body.thumbnail_url = mergedImages[0] || null;
};

class ProductController {
  constructor() {
    /**
     * @group Products — Seller
     * @route POST /api/v1/seller/products
     */
    this.createProduct = asyncHandler(async (req, res) => {
      normalizeProductInput(req);

      const product = await productService.createProduct(
        req.body,
        req.user.id
      );
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProduct = normalizeProductImage(product, baseUrl);

      return sendCreated(res, 'Product created successfully', {
        product: normalizedProduct,
      });
    });

    /**
     * @group Products — Seller
     * @route GET /api/v1/seller/products
     */
    this.getSellerProducts = asyncHandler(async (req, res) => {
      const { products, pagination } = await productService.getSellerProducts(
        req.user.id,
        req.query
      );
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProducts = normalizeProductCollection(products, baseUrl);

      return sendPaginated(
        res,
        'Products fetched successfully',
        { products: normalizedProducts },
        pagination
      );
    });

    /**
     * @group Products — Seller
     * @route GET /api/v1/seller/products/:slug
     */
    this.getSellerProductBySlug = asyncHandler(async (req, res) => {
      const product = await productService.getSellerProductBySlug(
        req.params.slug,
        req.user.id
      );
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProduct = normalizeProductImage(product, baseUrl);

      return sendSuccess(res, 'Product fetched successfully', {
        product: normalizedProduct,
      });
    });

    /**
     * @group Products — Seller
     * @route PUT /api/v1/seller/products/:slug
     */
    this.updateProduct = asyncHandler(async (req, res) => {
      normalizeProductInput(req);

      const product = await productService.updateProduct(
        req.params.slug,
        req.body,
        req.user.id
      );
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProduct = normalizeProductImage(product, baseUrl);

      return sendSuccess(res, 'Product updated successfully', {
        product: normalizedProduct,
      });
    });

    /**
     * @group Products — Seller
     * @route DELETE /api/v1/seller/products/:slug
     */
    this.deleteProduct = asyncHandler(async (req, res) => {
      await productService.deleteProduct(req.params.slug, req.user.id);

      return sendSuccess(res, 'Product deleted successfully');
    });

    /**
     * @group Products — Seller
     * @route POST /api/v1/seller/products/:slug/filters
     */
    this.assignFilters = asyncHandler(async (req, res) => {
      // Verify product belongs to this seller first
      const { Product } = require('../models/index');
      const product = await Product.findOne({
        where: { slug: req.params.slug, seller_id: req.user.id },
      });

      if (!product) {
        throw new AppError(
          'Product not found or you do not have permission',
          404
        );
      }

      const productFilters = await filterService.assignFiltersToProduct(
        product.id,
        req.body.filters
      );

      return sendSuccess(
        res,
        'Filters assigned to product successfully',
        { assigned: productFilters.length }
      );
    });

    /**
     * @group Products
     * @route GET /api/v1/products
     */
    this.getAllProducts = asyncHandler(async (req, res) => {
      const { products, pagination } = await productService.getAllProducts(
        req.query
      );
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProducts = normalizeProductCollection(products, baseUrl);

      return sendPaginated(
        res,
        'Products fetched successfully',
        { products: normalizedProducts },
        pagination
      );
    });

    /**
     * @group Products
     * @route GET /api/v1/products/brands
     */
    this.getProductBrands = asyncHandler(async (req, res) => {
      const brands = await productService.getAvailableBrands(req.query);

      return sendSuccess(res, 'Brands fetched successfully', { brands });
    });

    /**
     * @group Products
     * @route GET /api/v1/products/:slug
     */
    this.getProductBySlug = asyncHandler(async (req, res) => {
      const product = await productService.getProductBySlug(req.params.slug);
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProduct = normalizeProductImage(product, baseUrl);

      return sendSuccess(res, 'Product fetched successfully', {
        product: normalizedProduct,
      });
    });

    /**
     * @group Products — Admin
     * @route GET /api/v1/admin/products
     */
    this.getAllProductsAdmin = asyncHandler(async (req, res) => {
      const { products, pagination } =
        await productService.getAllProductsAdmin(req.query);
      const baseUrl = getApiBaseUrlFromRequest(req);
      const normalizedProducts = normalizeProductCollection(products, baseUrl);

      return sendPaginated(
        res,
        'All products fetched successfully',
        { products: normalizedProducts },
        pagination
      );
    });

    /**
     * @group Products — Admin
     * @route PATCH /api/v1/admin/products/:slug/status
     */
    this.updateProductStatus = asyncHandler(async (req, res) => {
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        throw new AppError('is_active must be a boolean value', 400);
      }

      const product = await productService.updateProductStatus(
        req.params.slug,
        is_active
      );

      return sendSuccess(
        res,
        `Product ${is_active ? 'activated' : 'deactivated'} successfully`,
        { product }
      );
    });
  }
}

module.exports = new ProductController();
