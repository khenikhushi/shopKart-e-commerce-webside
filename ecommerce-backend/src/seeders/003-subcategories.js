'use strict';

const { generateSlug } = require('../utils/slug.util');
const { generateUUID } = require('../utils/uuid.util');

module.exports = {
  async up(queryInterface, Sequelize) {
    // First get the category IDs
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories WHERE is_active = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const electronicsId = categories.find(c => c.name === 'Electronics')?.id;
    const clothingId = categories.find(c => c.name === 'Clothing')?.id;
    const homeGardenId = categories.find(c => c.name === 'Home & Garden')?.id;

    const subcategories = [];

    if (electronicsId) {
      subcategories.push(
        {
          id: generateUUID(),
          category_id: electronicsId,
          name: 'Smartphones',
          slug: generateSlug('Smartphones'),
          description: 'Mobile phones and accessories',
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: generateUUID(),
          category_id: electronicsId,
          name: 'Laptops',
          slug: generateSlug('Laptops'),
          description: 'Portable computers',
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
    }

    if (clothingId) {
      subcategories.push(
        {
          id: generateUUID(),
          category_id: clothingId,
          name: 'Men\'s Clothing',
          slug: generateSlug('Men\'s Clothing'),
          description: 'Clothing for men',
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: generateUUID(),
          category_id: clothingId,
          name: 'Women\'s Clothing',
          slug: generateSlug('Women\'s Clothing'),
          description: 'Clothing for women',
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
    }

    if (homeGardenId) {
      subcategories.push(
        {
          id: generateUUID(),
          category_id: homeGardenId,
          name: 'Kitchen Appliances',
          slug: generateSlug('Kitchen Appliances'),
          description: 'Appliances for kitchen use',
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
    }

    if (subcategories.length > 0) {
      await queryInterface.bulkInsert('subcategories', subcategories, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subcategories', null, {});
  },
};