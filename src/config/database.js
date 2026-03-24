const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  })

module.exports = prisma
