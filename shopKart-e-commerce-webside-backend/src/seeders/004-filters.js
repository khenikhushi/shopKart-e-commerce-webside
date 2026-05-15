'use strict';

const { generateUUID } = require('../utils/uuid.util');

const CATEGORY_FILTER_BLUEPRINT = {
  Electronics: [
    { name: 'brand', display_name: 'Brand', filter_type: 'checkbox' },
    { name: 'ram', display_name: 'RAM', filter_type: 'checkbox' },
    { name: 'storage', display_name: 'Storage', filter_type: 'checkbox' },
  ],
  Clothing: [
    { name: 'brand', display_name: 'Brand', filter_type: 'checkbox' },
    { name: 'size', display_name: 'Size', filter_type: 'checkbox' },
    { name: 'color', display_name: 'Color', filter_type: 'checkbox' },
  ],
  'Home & Garden': [
    { name: 'brand', display_name: 'Brand', filter_type: 'checkbox' },
    { name: 'material', display_name: 'Material', filter_type: 'checkbox' },
  ],
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const subcategories = await queryInterface.sequelize.query(
      `SELECT sc.id, sc.name, sc.category_id, c.name AS category_name
       FROM subcategories sc
       JOIN categories c ON c.id = sc.category_id
       WHERE sc.is_active = true
         AND c.is_active = true`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingFilters = await queryInterface.sequelize.query(
      'SELECT category_id, subcategory_id, name FROM filters',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingKeys = new Set(
      existingFilters.map(
        (item) => `${item.category_id || ''}:${item.subcategory_id || ''}:${item.name}`
      )
    );

    const now = new Date();
    const filtersToInsert = [];

    subcategories.forEach((subCategory) => {
      const config = CATEGORY_FILTER_BLUEPRINT[subCategory.category_name] || [];

      config.forEach((filter) => {
        const key = `${subCategory.category_id}:${subCategory.id}:${filter.name}`;
        if (existingKeys.has(key)) {
          return;
        }

        filtersToInsert.push({
          id: generateUUID(),
          category_id: subCategory.category_id,
          subcategory_id: subCategory.id,
          name: filter.name,
          display_name: filter.display_name,
          filter_type: filter.filter_type,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      });
    });

    if (filtersToInsert.length > 0) {
      await queryInterface.bulkInsert('filters', filtersToInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE f
       FROM filters f
       JOIN categories c ON c.id = f.category_id
       WHERE (
         (c.name = 'Electronics' AND f.name IN ('brand', 'ram', 'storage')) OR
         (c.name = 'Clothing' AND f.name IN ('brand', 'size', 'color')) OR
         (c.name = 'Home & Garden' AND f.name IN ('brand', 'material'))
       )`
    );
  },
};
