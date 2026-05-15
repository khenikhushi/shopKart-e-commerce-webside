const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
};

const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

const validateMinLength = (value, min, fieldName) => {
  if (!value || value.toString().trim().length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

const validatePositiveNumber = (value, fieldName) => {
  if (!value && value !== 0) return `${fieldName} is required`;
  if (isNaN(value) || Number(value) <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

const validateNonNegativeInt = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  if (!Number.isInteger(Number(value)) || Number(value) < 0) {
    return `${fieldName} must be a non-negative whole number`;
  }
  return null;
};

const validateProductImageUrl = (value) => {
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const normalized = String(value)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\\/g, '/');

  if (
    /^file:\/\//i.test(normalized) ||
    /^[a-z]:\//i.test(normalized) ||
    /^[a-z]:\/fakepath\//i.test(normalized) ||
    /^data:/i.test(normalized)
  ) {
    return 'Use Upload Image from PC or a public http(s) image URL';
  }

  if (
    normalized.startsWith('/uploads/') ||
    normalized.startsWith('/images/') ||
    normalized.startsWith('//')
  ) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return null;
    }
  } catch {
    return 'Use Upload Image from PC or a public http(s) image URL';
  }

  return 'Use Upload Image from PC or a public http(s) image URL';
};

const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Enter a valid email';
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
};

const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};
  const nameError = validateMinLength(name, 2, 'Name');
  if (nameError) errors.name = nameError;
  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Enter a valid email';
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
};

const validateProductForm = ({
  name,
  subcategory_id,
  price,
  stock,
  thumbnail_url,
}) => {
  const errors = {};
  const nameError = validateMinLength(name, 3, 'Product name');
  if (nameError) errors.name = nameError;
  if (!subcategory_id) errors.subcategory_id = 'SubCategory is required';
  const priceError = validatePositiveNumber(price, 'Price');
  if (priceError) errors.price = priceError;
  const stockError = validateNonNegativeInt(stock, 'Stock');
  if (stockError) errors.stock = stockError;
  const imageUrlError = validateProductImageUrl(thumbnail_url);
  if (imageUrlError) errors.thumbnail_url = imageUrlError;
  return errors;
};

const validateCategoryForm = ({ name }) => {
  const errors = {};
  const nameError = validateMinLength(name, 2, 'Category name');
  if (nameError) errors.name = nameError;
  return errors;
};

const validateCheckoutForm = ({ shipping_address }) => {
  const errors = {};
  const addressError = validateMinLength(
    shipping_address,
    10,
    'Shipping address'
  );
  if (addressError) errors.shipping_address = addressError;
  return errors;
};

export {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLoginForm,
  validateRegisterForm,
  validateProductForm,
  validateCategoryForm,
  validateCheckoutForm,
};
