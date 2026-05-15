'use strict';

const { generateUUID } = require('../utils/uuid.util');

const normalize = (value) => String(value || '').trim();

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      `SELECT p.id, p.brand, p.subcategory_id, sc.category_id
       FROM products p
       JOIN subcategories sc ON sc.id = p.subcategory_id
       WHERE p.brand IS NOT NULL
         AND TRIM(p.brand) <> ''`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (products.length === 0) {
      return;
    }

    const categoryIds = [...new Set(products.map((product) => product.category_id))];

    const brandFilters = await queryInterface.sequelize.query(
      `SELECT id, category_id, subcategory_id
       FROM filters
       WHERE name = 'brand'
         AND category_id IN (:categoryIds)`,
      {
        replacements: { categoryIds },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (brandFilters.length === 0) {
      return;
    }

    const filterBySubcategory = new Map(
      brandFilters
        .filter((filter) => Boolean(filter.subcategory_id))
        .map((filter) => [filter.subcategory_id, filter])
    );

    const filterByCategory = new Map(
      brandFilters
        .filter((filter) => !filter.subcategory_id)
        .map((filter) => [filter.category_id, filter])
    );

    const existingValues = await queryInterface.sequelize.query(
      `SELECT fv.id, fv.filter_id, fv.value
       FROM filter_values fv
       WHERE fv.filter_id IN (:filterIds)`,
      {
        replacements: {
          filterIds: brandFilters.map((item) => item.id),
        },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const valueMap = new Map(
      existingValues.map((valueRow) => [
        `${valueRow.filter_id}:${normalize(valueRow.value)}`,
        valueRow.id,
      ])
    );

    const now = new Date();
    const newValues = [];

    products.forEach((product) => {
      const filter =
        filterBySubcategory.get(product.subcategory_id) ||
        filterByCategory.get(product.category_id);
      if (!filter) {
        return;
      }

      const valueKey = `${filter.id}:${normalize(product.brand)}`;
      if (!valueMap.has(valueKey)) {
        const newValueId = generateUUID();
        valueMap.set(valueKey, newValueId);

        newValues.push({
          id: newValueId,
          filter_id: filter.id,
          value: normalize(product.brand),
          created_at: now,
          updated_at: now,
        });
      }
    });

    if (newValues.length > 0) {
      await queryInterface.bulkInsert('filter_values', newValues, {});
    }

    const mappings = [];

    products.forEach((product) => {
      const filter =
        filterBySubcategory.get(product.subcategory_id) ||
        filterByCategory.get(product.category_id);
      if (!filter) {
        return;
      }

      const valueId = valueMap.get(
        `${filter.id}:${normalize(product.brand)}`
      );

      if (!valueId) {
        return;
      }

      mappings.push({
        id: generateUUID(),
        product_id: product.id,
        filter_id: filter.id,
        filter_value_id: valueId,
        created_at: now,
        updated_at: now,
      });
    });

    if (mappings.length > 0) {
      const productIds = [...new Set(mappings.map((row) => row.product_id))];
      const filterIds = [...new Set(mappings.map((row) => row.filter_id))];

      await queryInterface.sequelize.query(
        `DELETE FROM product_filters
         WHERE product_id IN (:productIds)
           AND filter_id IN (:filterIds)`,
        {
          replacements: { productIds, filterIds },
          type: Sequelize.QueryTypes.DELETE,
        }
      );

      await queryInterface.bulkInsert('product_filters', mappings, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_filters', null, {});
  },
};
