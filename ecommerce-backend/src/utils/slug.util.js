const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a URL-safe slug from a string
 * Appends a short unique suffix to prevent collisions
 * Example: "My Product Name" → "my-product-name-a1b2c3"
 *
 * @param {string} text - The string to slugify
 * @param {boolean} withSuffix - Append short UUID suffix (default: true)
 * @returns {string} slug
 */
const generateSlug = (text, withSuffix = true) => {
  const base = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!withSuffix) {
    return base;
  }

  const suffix = uuidv4().split('-')[0];
  return `${base}-${suffix}`;
};

module.exports = { generateSlug };