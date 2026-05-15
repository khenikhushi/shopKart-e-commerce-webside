'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');

module.exports = (sequelize, DataTypes) => {
  class Filter extends Model {
    static associate(models) {
      Filter.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });
      Filter.belongsTo(models.SubCategory, {
        foreignKey: 'subcategory_id',
        as: 'subCategory',
      });
      Filter.hasMany(models.FilterValue, { foreignKey: 'filter_id', as: 'values' });
      Filter.belongsToMany(models.Product, {
        through: models.ProductFilter,
        foreignKey: 'filter_id',
        otherKey: 'product_id',
        as: 'products',
      });
      Filter.hasMany(models.ProductFilter, {
        foreignKey: 'filter_id',
        as: 'productFilters',
      });
    }
  }

  Filter.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      category_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
      subcategory_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      display_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      filter_type: {
        type: DataTypes.ENUM('checkbox', 'range', 'radio'),
        allowNull: false,
        defaultValue: 'checkbox',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Filter',
      tableName: 'filters',
      timestamps: true,
      underscored: true,
      validate: {
        hasCategoryOrSubCategory() {
          if (!this.category_id && !this.subcategory_id) {
            throw new Error(
              'Either category_id or subcategory_id must be provided'
            );
          }
        },
      },
    }
  );

  return Filter;
};
