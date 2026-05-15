'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('filters', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      subcategory_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'subcategories',
          key: 'id',
        },
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      filter_type: {
        type: Sequelize.ENUM('checkbox', 'range', 'radio'),
        allowNull: false,
        defaultValue: 'checkbox',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('filters');
  },
};