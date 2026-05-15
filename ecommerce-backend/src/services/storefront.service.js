const { Category, Product, SubCategory, User } = require('../models/index');

const HERO_THEMES = [
  {
    gradient: 'linear-gradient(135deg, #0f7b5f 0%, #18a37f 52%, #8fe8c0 100%)',
    badge: 'Fresh picks',
  },
  {
    gradient: 'linear-gradient(135deg, #1c3faa 0%, #3a63e6 50%, #7ac9ff 100%)',
    badge: 'Hot deals',
  },
  {
    gradient: 'linear-gradient(135deg, #8a4d16 0%, #d7771e 48%, #ffd071 100%)',
    badge: 'Top rated',
  },
];

const SECTION_TITLES = [
  'Popular in this category',
  'Trending this week',
  'Best value picks',
  'Shop more top products',
];

const toPlain = (value) => {
  if (!value) {
    return value;
  }

  if (typeof value.toJSON === 'function') {
    return value.toJSON();
  }

  return { ...value };
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDiscountPercent = (product) => {
  const mrp = toNumber(product?.mrp);
  const price = toNumber(product?.price);

  if (!mrp || !price || mrp <= price) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
};

const buildRootResolver = (categories = []) => {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const cache = new Map();

  const resolve = (categoryId) => {
    if (!categoryId) {
      return null;
    }

    if (cache.has(categoryId)) {
      return cache.get(categoryId);
    }

    let cursor = byId.get(categoryId) || null;
    let root = cursor;

    while (cursor?.parent_category_id) {
      cursor = byId.get(cursor.parent_category_id) || null;
      if (cursor) {
        root = cursor;
      }
    }

    cache.set(categoryId, root || null);
    return root || null;
  };

  return resolve;
};

const pickLeadProduct = (products = []) => {
  if (products.length === 0) {
    return null;
  }

  const withStock = products.find((product) => toNumber(product.stock) > 0);
  return withStock || products[0];
};

const getStorefrontHome = async () => {
  const [categories, subCategories, products] = await Promise.all([
    Category.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'name',
        'slug',
        'description',
        'image_url',
        'parent_category_id',
      ],
      order: [['name', 'ASC']],
      raw: true,
    }),
    SubCategory.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug', 'image_url', 'category_id'],
      order: [['name', 'ASC']],
      raw: true,
    }),
    Product.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'name',
        'slug',
        'price',
        'mrp',
        'stock',
        'brand',
        'thumbnail_url',
        'created_at',
      ],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: SubCategory,
          as: 'subCategory',
          attributes: ['id', 'name', 'slug', 'category_id'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug', 'parent_category_id'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    }),
  ]);

  const rootCategories = categories.filter(
    (category) => !category.parent_category_id
  );
  const resolvedRootCategories = rootCategories.length > 0
    ? rootCategories
    : categories;

  const rootResolver = buildRootResolver(categories);
  const categoryBuckets = new Map(
    resolvedRootCategories.map((category) => [
      category.id,
      {
        category,
        products: [],
        subCategories: new Map(),
        brands: new Map(),
      },
    ])
  );

  subCategories.forEach((subCategory) => {
    const rootCategory = rootResolver(subCategory.category_id);
    const bucket = rootCategory
      ? categoryBuckets.get(rootCategory.id)
      : null;

    if (bucket) {
      bucket.subCategories.set(subCategory.id, subCategory);
    }
  });

  const plainProducts = products.map((product) => toPlain(product));

  plainProducts.forEach((product) => {
    const categoryId = product?.subCategory?.category?.id;
    const rootCategory = rootResolver(categoryId);
    const bucket = rootCategory
      ? categoryBuckets.get(rootCategory.id)
      : null;

    if (!bucket) {
      return;
    }

    bucket.products.push(product);

    if (product.subCategory?.id) {
      bucket.subCategories.set(product.subCategory.id, {
        id: product.subCategory.id,
        name: product.subCategory.name,
        slug: product.subCategory.slug,
        category_id: product.subCategory.category_id,
      });
    }

    if (product.brand) {
      bucket.brands.set(
        product.brand,
        (bucket.brands.get(product.brand) || 0) + 1
      );
    }
  });

  const rankedBuckets = [...categoryBuckets.values()]
    .filter((bucket) => bucket.products.length > 0)
    .sort((left, right) => {
      if (right.products.length !== left.products.length) {
        return right.products.length - left.products.length;
      }

      return left.category.name.localeCompare(right.category.name);
    });

  const navigation = rankedBuckets.slice(0, 8).map((bucket) => ({
    id: bucket.category.id,
    name: bucket.category.name,
    slug: bucket.category.slug,
    image_url: bucket.category.image_url || null,
    productCount: bucket.products.length,
  }));

  const featuredCategories = rankedBuckets.slice(0, 8).map((bucket) => ({
    id: bucket.category.id,
    name: bucket.category.name,
    slug: bucket.category.slug,
    description:
      bucket.category.description ||
      `Explore top products in ${bucket.category.name}.`,
    image_url: bucket.category.image_url || null,
    productCount: bucket.products.length,
    subCategoryCount: bucket.subCategories.size,
    topBrands: [...bucket.brands.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([brand]) => brand),
  }));

  const heroSlides = rankedBuckets.slice(0, 3).map((bucket, index) => {
    const theme = HERO_THEMES[index % HERO_THEMES.length];
    const leadProduct = pickLeadProduct(bucket.products);
    const maxDiscount = bucket.products.reduce((highest, product) => {
      return Math.max(highest, getDiscountPercent(product));
    }, 0);

    return {
      id: bucket.category.id,
      categoryId: bucket.category.id,
      categorySlug: bucket.category.slug,
      eyebrow: theme.badge,
      title: maxDiscount > 0
        ? `Up to ${maxDiscount}% off in ${bucket.category.name}`
        : `Fresh arrivals in ${bucket.category.name}`,
      subtitle:
        bucket.category.description ||
        `Browse ${bucket.products.length} products across ${bucket.subCategories.size} collections.`,
      actionLabel: `Explore ${bucket.category.name}`,
      gradient: theme.gradient,
      imageUrl: leadProduct?.thumbnail_url || bucket.category.image_url || null,
      topBrands: [...bucket.brands.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([brand]) => brand),
    };
  });

  const dealSections = rankedBuckets.slice(0, 4).map((bucket, index) => ({
    id: `section-${bucket.category.id}`,
    title: SECTION_TITLES[index % SECTION_TITLES.length],
    subtitle:
      bucket.category.description ||
      `Hand-picked products from ${bucket.category.name}.`,
    categoryId: bucket.category.id,
    categorySlug: bucket.category.slug,
    categoryName: bucket.category.name,
    items: bucket.products.slice(0, 8),
  }));

  const discountedProducts = [...plainProducts]
    .filter((product) => getDiscountPercent(product) > 0)
    .sort((left, right) => {
      const discountDifference =
        getDiscountPercent(right) - getDiscountPercent(left);

      if (discountDifference !== 0) {
        return discountDifference;
      }

      return new Date(right.created_at) - new Date(left.created_at);
    });

  const dealOfDay = discountedProducts[0] || plainProducts[0] || null;

  const budgetFinds = [...plainProducts]
    .sort((left, right) => toNumber(left.price) - toNumber(right.price))
    .slice(0, 4);

  const trendingProducts = plainProducts.slice(0, 8);

  const brandFrequency = new Map();
  plainProducts.forEach((product) => {
    if (!product.brand) {
      return;
    }

    brandFrequency.set(
      product.brand,
      (brandFrequency.get(product.brand) || 0) + 1
    );
  });

  const featuredBrands = [...brandFrequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([name, productCount]) => ({
      name,
      productCount,
    }));

  return {
    navigation,
    heroSlides,
    featuredCategories,
    dealSections,
    dealOfDay,
    budgetFinds,
    trendingProducts,
    featuredBrands,
    stats: {
      totalProducts: plainProducts.length,
      totalCategories: resolvedRootCategories.length,
      totalBrands: brandFrequency.size,
    },
  };
};

class StorefrontService {
  constructor() {
    this.getStorefrontHome = getStorefrontHome;
  }
}

module.exports = new StorefrontService();
