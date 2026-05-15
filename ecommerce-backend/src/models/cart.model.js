'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'items' });
    }
  }

  Cart.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Cart',
      tableName: 'carts',
      timestamps: true,
      underscored: true,
    }
  );

  return Cart;
};