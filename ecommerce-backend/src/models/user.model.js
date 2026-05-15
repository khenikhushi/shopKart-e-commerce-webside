'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');
const { generateSlug } = require('../utils/slug.util');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Product, { foreignKey: 'seller_id', as: 'products' });
      User.hasOne(models.Cart, { foreignKey: 'user_id', as: 'cart' });
      User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'seller', 'user'),
        allowNull: false,
        defaultValue: 'user',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeValidate: (user) => {
          if (!user.slug) {
            if (!user.name || user.name.trim() === '') {
              throw new Error('Cannot generate slug: name is empty');
            }
            user.slug = generateSlug(user.name);
          }
        },
      },
      defaultScope: {
        attributes: {
          exclude: ['password_hash'],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: ['password_hash'],
          },
        },
      },
    }
  );

  return User;
};