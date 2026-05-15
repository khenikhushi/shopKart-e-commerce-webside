const { Router } = require('express');
const categoryController = require('../../controllers/category.controller');
const subCategoryController = require('../../controllers/subCategory.controller');
const filterController = require('../../controllers/filter.controller');
const productController = require('../../controllers/product.controller');
const storefrontController = require('../../controllers/storefront.controller');

const router = Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all product categories
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get('/categories', categoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/tree:
 *   get:
 *     summary: Get category tree structure
 *     description: Retrieve hierarchical category tree with subcategories
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get('/categories/tree', categoryController.getCategoryTree);

/**
 * @swagger
 * /api/v1/categories/{slug}:
 *   get:
 *     summary: Get category by slug
 *     description: Retrieve specific category details by slug
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get('/categories/:slug', categoryController.getCategoryBySlug);

/**
 * @swagger
 * /api/v1/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     description: Retrieve a list of all product subcategories
 *     tags:
 *       - SubCategories
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get('/subcategories', subCategoryController.getAllSubCategories);

/**
 * @swagger
 * /api/v1/subcategories/{slug}:
 *   get:
 *     summary: Get subcategory by slug
 *     description: Retrieve specific subcategory details by slug
 *     tags:
 *       - SubCategories
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: laptops
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get(
  '/subcategories/:slug',
  subCategoryController.getSubCategoryBySlug
);

/**
 * @swagger
 * /api/v1/filters/{subCategorySlug}:
 *   get:
 *     summary: Get filters for subcategory
 *     description: Retrieve available filters for a specific subcategory
 *     tags:
 *       - Filters
 *     parameters:
 *       - in: path
 *         name: subCategorySlug
 *         required: true
 *         schema:
 *           type: string
 *         example: laptops
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get(
  '/filters/:subCategorySlug',
  filterController.getFiltersBySubCategory
);

/**
 * @swagger
 * /api/v1/filters/category/{categorySlug}:
 *   get:
 *     summary: Get filters for category
 *     description: Retrieve available filters for a specific category
 *     tags:
 *       - Filters
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get(
  '/filters/category/:categorySlug',
  filterController.getFiltersByCategory
);

/**
 * @swagger
 * /api/v1/storefront/home:
 *   get:
 *     summary: Get storefront home data
 *     description: Retrieve featured products and promotional data for homepage
 *     tags:
 *       - Storefront
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get('/storefront/home', storefrontController.getStorefrontHome);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve paginated list of all available products with optional filtering
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/PaginatedResponse'
 */
router.get('/products', productController.getAllProducts);

/**
 * @swagger
 * /api/v1/products/brands:
 *   get:
 *     summary: Get all product brands
 *     description: Retrieve list of all available product brands
 *     tags:
 *       - Products
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 */
router.get('/products/brands', productController.getProductBrands);

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     summary: Get product details by slug
 *     description: Retrieve complete product information including price, description, and reviews
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: iphone-15-pro
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get('/products/:slug', productController.getProductBySlug);

module.exports = router;
