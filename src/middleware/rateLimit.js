const rateLimit = require('express-rate-limit')

const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter for auth endpoints
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
})

const ai = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'AI request limit reached. Please wait a moment.' },
})

module.exports = { general, auth, ai }
