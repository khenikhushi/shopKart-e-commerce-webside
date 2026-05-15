'use strict';

const { hashPassword } = require('../utils/bcrypt.util');
const { generateSlug } = require('../utils/slug.util');
const { generateUUID } = require('../utils/uuid.util');

module.exports = {
  async up(queryInterface, Sequelize) {
    const password_hash = await hashPassword('Admin@1234');

    await queryInterface.bulkInsert('users', [
      {
        id: generateUUID(),
        name: 'Super Admin',
        slug: generateSlug('Super Admin'),
        email: 'admin@ecommerce.com',
        password_hash: password_hash,
        role: 'admin',
        phone: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@shopkart-e-commerce-webside.com' }, {});
  },
};
// field	Value
// Email	admin@ecommerce.com
// Password	Admin@1234