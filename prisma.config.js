/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path')
require('dotenv').config()

module.exports = {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
}