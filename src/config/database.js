const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')

const connectionString = process.env.DATABASE_URL

const adapter = new PrismaNeon({ connectionString })

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  })

module.exports = prisma
