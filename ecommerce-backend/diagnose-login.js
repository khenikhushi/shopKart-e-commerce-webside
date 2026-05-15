require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { comparePassword } = require('./src/utils/bcrypt.util');

async function diagnoseLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check all users
    const allUsers = await sequelize.query(
      'SELECT id, name, email, role, is_active, password_hash FROM users',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 Users in Database:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`\n- Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Password Hash: ${user.password_hash.substring(0, 20)}...`);
    });

    // Test login for admin
    const adminEmail = 'admin@ecommerce.com';
    const adminPassword = 'Admin@1234';

    const admin = await sequelize.query(
      'SELECT password_hash FROM users WHERE email = ?',
      { replacements: [adminEmail], type: sequelize.QueryTypes.SELECT }
    );

    if (admin.length === 0) {
      console.log(`\n❌ No user found with email: ${adminEmail}`);
      console.log('\n🔧 Fix: Run npm run db:reset');
      process.exit(1);
    }

    console.log(`\n\n🔐 Testing Password for: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

    const isValid = await comparePassword(adminPassword, admin[0].password_hash);
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      console.log('\n⚠️ Password does not match!');
      console.log('Possible solutions:');
      console.log('1. Check the password_hash in the database');
      console.log('2. Run: npm run db:reset (to reseed with correct password)');
      console.log('3. Make sure you\'re using the exact password from the seeder');
    } else {
      console.log('\n✅ Password is correct!');
      console.log('If login still fails, check:');
      console.log('1. Email format in the request');
      console.log('2. User is_active flag (should be 1/true)');
      console.log('3. Whitespace in email or password');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseLogin();