'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
      CartItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
      });
    }
  }

  CartItem.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      cart_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
    },
    {
      sequelize,
      modelName: 'CartItem',
      tableName: 'cart_items',
      timestamps: true,
      underscored: true,
    }
  );

  return CartItem;
};