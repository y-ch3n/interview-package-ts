/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PW || 'password',
    database: process.env.DB_SCHEMA || 'school-administration-system',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 33306,
    dialect: 'mysql',
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PW || 'password',
    database: process.env.DB_SCHEMA || 'school-administration-system',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 33306,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PW || 'password',
    database: process.env.DB_SCHEMA || 'school-administration-system',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 33306,
    dialect: 'mysql',
  },
};
