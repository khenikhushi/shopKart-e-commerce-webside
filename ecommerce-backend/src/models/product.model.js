'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');
const { generateSlug } = require('../utils/slug.util');

const parseImageUrls = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
      Product.belongsTo(models.SubCategory, {
        foreignKey: 'subcategory_id',
        as: 'subCategory',
      });
      Product.belongsToMany(models.Filter, {
        through: models.ProductFilter,
        foreignKey: 'product_id',
        otherKey: 'filter_id',
        as: 'filters',
      });
      Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems',
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      seller_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      subcategory_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(220),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      thumbnail_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_urls: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
          return parseImageUrls(this.getDataValue('image_urls'));
        },
        set(value) {
          const imageUrls = parseImageUrls(value);
          this.setDataValue(
            'image_urls',
            imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
          );
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeValidate: (product) => {
          if (!product.slug && product.name) {
            product.slug = generateSlug(product.name);
          }
        },
        beforeCreate: (product) => {
          if (!product.slug) {
            product.slug = generateSlug(product.name);
          }
        },
      },
    }
  );

  return Product;
};
