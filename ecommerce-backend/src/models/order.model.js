'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

const generateOrderSlug = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const suffix = generateUUID().split('-')[0].toUpperCase();

  return `ORD-${dateStr}-${suffix}`;
};

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        defaultValue: generateOrderSlug,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'shipped',
          'out_for_delivery',
          'delivered',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM('cod', 'online'),
        defaultValue: 'cod',
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeValidate: (order) => {
          if (!order.slug || String(order.slug).trim() === '') {
            order.slug = generateOrderSlug();
          }
        },
      },
    }
  );

  return Order;
};
