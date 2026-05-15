'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');
const { generateSlug } = require('../utils/slug.util');


module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      SubCategory.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });
      SubCategory.hasMany(models.Product, {
        foreignKey: 'subcategory_id',
        as: 'products',
      });
      SubCategory.hasMany(models.Filter, {
        foreignKey: 'subcategory_id',
        as: 'filters',
      });
    }
  }

  SubCategory.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      category_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        onDelete: 'CASCADE',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'SubCategory',
      tableName: 'subcategories',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeValidate: (subCategory) => {
          if (!subCategory.slug) {
            if (!subCategory.name || subCategory.name.trim() === '') {
              throw new Error('Cannot generate slug: name is empty');
            }
            subCategory.slug = generateSlug(subCategory.name);
          }
        },
      },
    }
  );

  return SubCategory;
};