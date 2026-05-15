'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

module.exports = (sequelize, DataTypes) => {
  class FilterValue extends Model {
    static associate(models) {
      FilterValue.belongsTo(models.Filter, { foreignKey: 'filter_id', as: 'filter' });
      FilterValue.hasMany(models.ProductFilter, {
        foreignKey: 'filter_value_id',
        as: 'productFilters',
      });
    }
  }

  FilterValue.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      filter_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'FilterValue',
      tableName: 'filter_values',
      timestamps: true,
      underscored: true,
    }
  );

  return FilterValue;
};