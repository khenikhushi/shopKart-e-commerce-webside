'use strict';

const { generateUUID } = require('../utils/uuid.util');

const VALUE_BLUEPRINT = {
  Electronics: {
    brand: ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Dell', 'HP'],
    ram: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'],
    storage: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
  },
  Clothing: {
    brand: ['Nike', 'Adidas', 'Puma', 'Levis', 'H&M'],
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    color: ['Black', 'White', 'Blue', 'Red', 'Green'],
  },
  'Home & Garden': {
    brand: ['IKEA', 'Philips', 'Prestige', 'Milton'],
    material: ['Wood', 'Steel', 'Plastic', 'Cotton'],
  },
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const filters = await queryInterface.sequelize.query(
      `SELECT f.id, f.name, c.name AS category_name
       FROM filters f
       JOIN categories c ON c.id = f.category_id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingValues = await queryInterface.sequelize.query(
      'SELECT filter_id, value FROM filter_values',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingKeys = new Set(
      existingValues.map((item) => `${item.filter_id}:${item.value}`)
    );

    const now = new Date();
    const valuesToInsert = [];

    filters.forEach((filter) => {
      const allowedValues =
        VALUE_BLUEPRINT[filter.category_name]?.[filter.name] || [];

      allowedValues.forEach((value) => {
        const key = `${filter.id}:${value}`;
        if (existingKeys.has(key)) {
          return;
        }

        valuesToInsert.push({
          id: generateUUID(),
          filter_id: filter.id,
          value,
          created_at: now,
          updated_at: now,
        });
      });
    });

    if (valuesToInsert.length > 0) {
      await queryInterface.bulkInsert('filter_values', valuesToInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('filter_values', null, {});
  },
};
