const ABSOLUTE_URL_REGEX = /^[a-z][a-z\d+\-.]*:\/\//i;
const DATA_URL_REGEX = /^data:/i;
const FILE_PROTOCOL_REGEX = /^file:\/\//i;
const WINDOWS_FILE_PATH_REGEX = /^[a-z]:[\\/]/i;
const WINDOWS_FAKE_PATH_REGEX = /^[a-z]:\/fakepath\//i;

const stripWrappingQuotes = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

const isManagedImagePath = (value) => {
  const normalized = String(value || '').replace(/\\/g, '/');

  return (
    normalized.startsWith('/uploads/') ||
    normalized.startsWith('uploads/') ||
    normalized.startsWith('/images/') ||
    normalized.startsWith('images/')
  );
};

const isInvalidLocalImagePath = (value) => {
  const normalized = stripWrappingQuotes(value).replace(/\\/g, '/');

  return (
    FILE_PROTOCOL_REGEX.test(normalized) ||
    WINDOWS_FILE_PATH_REGEX.test(normalized) ||
    WINDOWS_FAKE_PATH_REGEX.test(normalized)
  );
};

const getApiBaseUrlFromRequest = (req) => {
  const configuredBaseUrl = process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL;
  if (configuredBaseUrl) {
    return String(configuredBaseUrl).replace(/\/+$/, '');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto) || req.protocol || 'http';

  return `${protocol}://${req.get('host')}`;
};

const toAbsoluteImageUrl = (imagePath, baseUrl) => {
  if (!imagePath) {
    return imagePath;
  }

  const normalized = stripWrappingQuotes(imagePath).replace(/\\/g, '/');
  if (!normalized) {
    return null;
  }

  if (isInvalidLocalImagePath(normalized)) {
    return null;
  }

  if (DATA_URL_REGEX.test(normalized)) {
    return null;
  }

  if (ABSOLUTE_URL_REGEX.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  const resolvedPath = normalized.startsWith('/')
    ? normalized
    : `/${normalized}`;

  return `${String(baseUrl || '').replace(/\/+$/, '')}${resolvedPath}`;
};

const sanitizeProductImageInput = (imagePath, baseUrl) => {
  if (imagePath === undefined) {
    return undefined;
  }

  const normalized = stripWrappingQuotes(imagePath).replace(/\\/g, '/');
  if (!normalized) {
    return null;
  }

  if (
    isInvalidLocalImagePath(normalized) ||
    DATA_URL_REGEX.test(normalized)
  ) {
    return null;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  if (ABSOLUTE_URL_REGEX.test(normalized)) {
    try {
      const parsedUrl = new URL(normalized);

      if (
        isManagedImagePath(parsedUrl.pathname) &&
        baseUrl &&
        parsedUrl.origin === new URL(baseUrl).origin
      ) {
        return parsedUrl.pathname;
      }

      return parsedUrl.toString();
    } catch {
      return null;
    }
  }

  if (isManagedImagePath(normalized)) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  return null;
};

const sanitizeProductImageCollection = (imagePaths, baseUrl) => {
  if (imagePaths === undefined) {
    return undefined;
  }

  let values = imagePaths;

  if (typeof values === 'string') {
    const trimmed = values.trim();
    if (!trimmed) {
      return [];
    }

    try {
      values = JSON.parse(trimmed);
    } catch {
      values = trimmed.split(',').map((item) => item.trim());
    }
  }

  if (!Array.isArray(values)) {
    return null;
  }

  const sanitized = [];

  for (const value of values) {
    const rawValue = String(value || '').trim();
    if (!rawValue) {
      continue;
    }

    const sanitizedValue = sanitizeProductImageInput(rawValue, baseUrl);
    if (sanitizedValue === null) {
      return null;
    }

    sanitized.push(sanitizedValue);
  }

  return [...new Set(sanitized)];
};

const normalizeImageCollection = (imagePaths, baseUrl) => {
  const values = Array.isArray(imagePaths)
    ? imagePaths
    : [];

  return [...new Set(
    values
      .map((value) => toAbsoluteImageUrl(value, baseUrl))
      .filter(Boolean)
  )];
};

const normalizeProductImage = (product, baseUrl) => {
  if (!product) {
    return product;
  }

  const plain = typeof product.toJSON === 'function'
    ? product.toJSON()
    : { ...product };

  plain.image_urls = normalizeImageCollection(plain.image_urls, baseUrl);
  plain.thumbnail_url = toAbsoluteImageUrl(
    plain.thumbnail_url || plain.image_urls[0],
    baseUrl
  );
  return plain;
};

const normalizeProductCollection = (products, baseUrl) => {
  return (products || []).map((product) =>
    normalizeProductImage(product, baseUrl)
  );
};

const normalizeCartImageData = (payload, baseUrl) => {
  if (!payload?.cart) {
    return payload;
  }

  const plainPayload = typeof payload.toJSON === 'function'
    ? payload.toJSON()
    : { ...payload };
  const cart = plainPayload.cart || {};

  return {
    ...plainPayload,
    cart: {
      ...cart,
      items: (cart.items || []).map((item) => ({
        ...item,
        product: item.product
          ? normalizeProductImage(item.product, baseUrl)
          : item.product,
      })),
    },
  };
};

const normalizeOrderImage = (order, baseUrl) => {
  if (!order) {
    return order;
  }

  const plainOrder = typeof order.toJSON === 'function'
    ? order.toJSON()
    : { ...order };

  return {
    ...plainOrder,
    items: (plainOrder.items || []).map((item) => ({
      ...item,
      product: item.product
        ? normalizeProductImage(item.product, baseUrl)
        : item.product,
    })),
  };
};

const normalizeOrderCollection = (orders, baseUrl) => {
  return (orders || []).map((order) =>
    normalizeOrderImage(order, baseUrl)
  );
};

module.exports = {
  getApiBaseUrlFromRequest,
  toAbsoluteImageUrl,
  sanitizeProductImageInput,
  sanitizeProductImageCollection,
  normalizeProductImage,
  normalizeProductCollection,
  normalizeCartImageData,
  normalizeOrderImage,
  normalizeOrderCollection,
};
