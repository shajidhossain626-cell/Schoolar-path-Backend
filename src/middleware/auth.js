const { verifyToken } = require('../utils/jwt')
const prisma = require('../config/database')
const { error } = require('../utils/response')

// Require valid JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Not authenticated. Please log in.', 401)
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, plan: true, isVerified: true },
    })
    if (!user) return error(res, 'User no longer exists.', 401)
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token.', 401)
    if (err.name === 'TokenExpiredError') return error(res, 'Token expired. Please log in again.', 401)
    next(err)
  }
}

// Require ADMIN role
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return error(res, 'Access denied. Admins only.', 403)
  }
  next()
}

// Optional auth (attach user if token present, but don't block)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, firstName: true, role: true, plan: true },
      })
    }
  } catch {
    // Ignore token errors for optional auth
  }
  next()
}

module.exports = { protect, adminOnly, optionalAuth }
