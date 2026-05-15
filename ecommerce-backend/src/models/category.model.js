'use strict';

const { Model } = require('sequelize');
const { generateUUID } = require('../utils/uuid.util');
const { generateSlug } = require('../utils/slug.util');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Category, {
        foreignKey: 'parent_category_id',
        as: 'parent',
      });
      Category.hasMany(models.Category, {
        foreignKey: 'parent_category_id',
        as: 'children',
      });
      Category.hasMany(models.SubCategory, {
        foreignKey: 'category_id',
        as: 'subCategories',
      });
      Category.hasMany(models.Filter, {
        foreignKey: 'category_id',
        as: 'filters',
      });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => generateUUID(),
      },
      parent_category_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
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
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeValidate: (instance) => {
          if (!instance.slug || instance.slug.trim() === '') {
            if (!instance.name || instance.name.trim() === '') {
              throw new Error('Cannot generate slug: name is empty');
            }
            instance.slug = generateSlug(instance.name);
          }
        },
      },
    }
  );

  return Category;
};
