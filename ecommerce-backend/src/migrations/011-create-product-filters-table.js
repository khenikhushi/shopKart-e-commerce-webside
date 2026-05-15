'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_filters', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      filter_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'filters',
          key: 'id',
        },
      },
      filter_value_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'filter_values',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_filters');
  },
};