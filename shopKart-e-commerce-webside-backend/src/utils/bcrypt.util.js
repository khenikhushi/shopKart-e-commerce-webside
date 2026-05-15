const bcrypt = require('bcryptjs');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain password against stored hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored hash from database
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };