require('dotenv').config()

/** @type {import('prisma/config').PrismaConfig} */
const config = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
}

module.exports = config
