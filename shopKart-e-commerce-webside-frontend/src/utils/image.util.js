const ABSOLUTE_URL_REGEX = /^[a-z][a-z\d+\-.]*:\/\//i;
const DATA_URL_REGEX = /^data:/i;
const FILE_PROTOCOL_REGEX = /^file:\/\//i;
const WINDOWS_FILE_PATH_REGEX = /^[a-z]:[\\/]/i;
const WINDOWS_FAKE_PATH_REGEX = /^[a-z]:\/fakepath\//i;
const MANAGED_IMAGE_PATH_REGEX = /^\/?(uploads|images)\//i;

const stripWrappingQuotes = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

const getApiOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';

  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch {
    return '';
  }
};

const appendCacheBust = (url, cacheKey) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
};

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  const normalized = stripWrappingQuotes(imagePath).replace(/\\/g, '/');
  if (!normalized) {
    return '';
  }

  if (
    FILE_PROTOCOL_REGEX.test(normalized) ||
    WINDOWS_FILE_PATH_REGEX.test(normalized) ||
    WINDOWS_FAKE_PATH_REGEX.test(normalized)
  ) {
    return '';
  }

  if (DATA_URL_REGEX.test(normalized)) {
    return '';
  }

  if (ABSOLUTE_URL_REGEX.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      const apiOrigin = getApiOrigin();

      if (
        apiOrigin &&
        parsed.origin === apiOrigin &&
        MANAGED_IMAGE_PATH_REGEX.test(parsed.pathname)
      ) {
        parsed.searchParams.set('v', parsed.pathname);
        return parsed.toString();
      }
    } catch {
      return normalized;
    }

    return normalized;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  const origin = getApiOrigin();
  if (!origin) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  const normalizedPath = normalized.startsWith('/')
    ? normalized
    : `/${normalized}`;

  const resolvedUrl = `${origin}${normalizedPath}`;

  if (MANAGED_IMAGE_PATH_REGEX.test(normalizedPath)) {
    return appendCacheBust(resolvedUrl, normalizedPath);
  }

  return resolvedUrl;
};

const resolveImageGallery = (imagePaths, fallbackImagePath) => {
  const sources = [];

  if (Array.isArray(imagePaths)) {
    sources.push(...imagePaths);
  }

  if (fallbackImagePath) {
    sources.push(fallbackImagePath);
  }

  return [...new Set(
    sources
      .map((imagePath) => resolveImageUrl(imagePath))
      .filter(Boolean)
  )];
};

export { resolveImageUrl, resolveImageGallery };
