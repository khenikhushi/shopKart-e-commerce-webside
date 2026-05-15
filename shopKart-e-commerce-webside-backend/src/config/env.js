require('dotenv').config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_SALT_ROUNDS',
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`FATAL ERROR: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Validate JWT_SECRET strength (minimum 32 characters)
if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters long for security');
  process.exit(1);
}

// Validate BCRYPT_SALT_ROUNDS
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
if (saltRounds < 10 || saltRounds > 15) {
  console.error('FATAL ERROR: BCRYPT_SALT_ROUNDS must be between 10 and 15');
  process.exit(1);
}

// Validate NODE_ENV
if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
  console.error('FATAL ERROR: NODE_ENV must be development, production, or test');
  process.exit(1);
}

module.exports = {
  app: {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    apiVersion: process.env.API_VERSION || 'v1',
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  },
};