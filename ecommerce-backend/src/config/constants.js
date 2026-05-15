module.exports = {
  ROLES: {
    ADMIN: 'admin',
    SELLER: 'seller',
    USER: 'user',
  },

  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },

  PAYMENT_METHOD: {
    COD: 'cod',
    ONLINE: 'online',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  FILTER_TYPE: {
    CHECKBOX: 'checkbox',
    RANGE: 'range',
    RADIO: 'radio',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};