'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

module.exports = (sequelize, DataTypes) => {
  class ProductFilter extends Model {
    static associate(models) {
      ProductFilter.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
      });
      ProductFilter.belongsTo(models.Filter, { foreignKey: 'filter_id', as: 'filter' });
      ProductFilter.belongsTo(models.FilterValue, {
        foreignKey: 'filter_value_id',
        as: 'filterValue',
      });
    }
  }

  ProductFilter.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      filter_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      filter_value_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductFilter',
      tableName: 'product_filters',
      timestamps: true,
      underscored: true,
    }
  );

  return ProductFilter;
};