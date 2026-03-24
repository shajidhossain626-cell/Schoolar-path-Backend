const { error } = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)

  // Prisma errors
  if (err.code === 'P2002') {
    return error(res, 'A record with this value already exists.', 409)
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found.', 404)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token.', 401)
  if (err.name === 'TokenExpiredError') return error(res, 'Token expired.', 401)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') return error(res, 'File too large. Max 10MB.', 400)

  // Default
  return error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    err.statusCode || 500
  )
}

const notFound = (req, res) => {
  error(res, `Route ${req.originalUrl} not found`, 404)
}

module.exports = { errorHandler, notFound }
