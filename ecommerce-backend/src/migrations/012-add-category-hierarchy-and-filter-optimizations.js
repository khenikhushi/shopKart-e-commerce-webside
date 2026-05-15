'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'parent_category_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('filters', 'category_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('filters', 'subcategory_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: {
        model: 'subcategories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex(
      'categories',
      ['parent_category_id', 'is_active'],
      { name: 'idx_categories_parent_active' }
    );

    await queryInterface.addIndex(
      'subcategories',
      ['category_id', 'is_active', 'slug'],
      { name: 'idx_subcategories_category_active_slug' }
    );

    await queryInterface.addIndex(
      'filters',
      ['category_id', 'subcategory_id', 'is_active'],
      { name: 'idx_filters_category_subcategory_active' }
    );

    await queryInterface.addIndex('filters', ['name'], {
      name: 'idx_filters_name',
    });

    await queryInterface.addIndex('filter_values', ['filter_id', 'value'], {
      name: 'idx_filter_values_filter_value',
    });

    await queryInterface.addIndex('products', ['subcategory_id', 'is_active'], {
      name: 'idx_products_subcategory_active',
    });

    await queryInterface.addIndex('products', ['brand'], {
      name: 'idx_products_brand',
    });

    await queryInterface.addIndex('products', ['price'], {
      name: 'idx_products_price',
    });

    await queryInterface.addIndex('products', ['created_at'], {
      name: 'idx_products_created_at',
    });

    await queryInterface.addIndex('product_filters', ['product_id'], {
      name: 'idx_product_filters_product_id',
    });

    await queryInterface.addIndex('product_filters', ['filter_id'], {
      name: 'idx_product_filters_filter_id',
    });

    await queryInterface.addIndex('product_filters', ['filter_value_id'], {
      name: 'idx_product_filters_filter_value_id',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove FK constraints first, then indexes
    await queryInterface.removeColumn('filters', 'category_id');
    await queryInterface.removeColumn('categories', 'parent_category_id');

    await queryInterface.changeColumn('filters', 'subcategory_id', {
      type: Sequelize.CHAR(36),
      allowNull: false,
      references: {
        model: 'subcategories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Now remove indexes after FK constraints are gone
    await queryInterface.removeIndex(
      'product_filters',
      'idx_product_filters_filter_value_id'
    );
    await queryInterface.removeIndex(
      'product_filters',
      'idx_product_filters_filter_id'
    );
    await queryInterface.removeIndex(
      'product_filters',
      'idx_product_filters_product_id'
    );
    await queryInterface.removeIndex('products', 'idx_products_created_at');
    await queryInterface.removeIndex('products', 'idx_products_price');
    await queryInterface.removeIndex('products', 'idx_products_brand');
    await queryInterface.removeIndex(
      'products',
      'idx_products_subcategory_active'
    );
    await queryInterface.removeIndex(
      'filter_values',
      'idx_filter_values_filter_value'
    );
    await queryInterface.removeIndex('filters', 'idx_filters_name');
    await queryInterface.removeIndex(
      'filters',
      'idx_filters_category_subcategory_active'
    );
    await queryInterface.removeIndex(
      'subcategories',
      'idx_subcategories_category_active_slug'
    );
    await queryInterface.removeIndex(
      'categories',
      'idx_categories_parent_active'
    );
  },
};
