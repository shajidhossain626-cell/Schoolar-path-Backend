require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')

const { general: generalLimit } = require('./middleware/rateLimit')
const { errorHandler, notFound }  = require('./middleware/errorHandler')

// Import routes
const authRoutes         = require('./routes/auth')
const scholarshipRoutes  = require('./routes/scholarships')
const applicationRoutes  = require('./routes/applications')
const documentRoutes     = require('./routes/documents')
const paymentRoutes      = require('./routes/payments')
const aiRoutes           = require('./routes/ai')
const notificationRoutes = require('./routes/notifications')
const contactRoutes      = require('./routes/contact')
const adminRoutes        = require('./routes/admin')

const app = express()

// ─── SECURITY ───
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://schoolar-path-bd-front-end.vercel.app',
  ],
  credentials: true,
}))

// ─── LOGGING ───
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ─── BODY PARSING ───
// SSLCommerz webhook needs raw body - parse before express.json
app.use('/api/payments/webhook', express.urlencoded({ extended: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── RATE LIMITING ───
app.use('/api', generalLimit)

// ─── HEALTH CHECK ───
app.get('/health', (req, res) => {
  res.json({
    status:      'ok',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    version:     '1.0.0',
  })
})

// ─── API ROUTES ───
app.use('/api/auth',          authRoutes)
app.use('/api/scholarships',  scholarshipRoutes)
app.use('/api/applications',  applicationRoutes)
app.use('/api/documents',     documentRoutes)
app.use('/api/payments',      paymentRoutes)
app.use('/api/ai',            aiRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/contact',       contactRoutes)
app.use('/api/admin',         adminRoutes)

// ─── ERROR HANDLING ───
app.use(notFound)
app.use(errorHandler)

// ─── START ───
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 ScholarPath Backend running`)
  console.log(`   Port:        ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health:      http://localhost:${PORT}/health`)
  console.log(`   API Base:    http://localhost:${PORT}/api\n`)
})

module.exports = app
