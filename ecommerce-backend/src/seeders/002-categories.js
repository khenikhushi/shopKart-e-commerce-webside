'use strict';

const { generateSlug } = require('../utils/slug.util');
const { generateUUID } = require('../utils/uuid.util');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        id: generateUUID(),
        name: 'Electronics',
        slug: generateSlug('Electronics'),
        description: 'Electronic devices and gadgets',
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: generateUUID(),
        name: 'Clothing',
        slug: generateSlug('Clothing'),
        description: 'Fashion and apparel',
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: generateUUID(),
        name: 'Home & Garden',
        slug: generateSlug('Home & Garden'),
        description: 'Home improvement and garden supplies',
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};