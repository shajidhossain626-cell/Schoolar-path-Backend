const bcrypt = require('bcryptjs')
const { body } = require('express-validator')
const prisma = require('../config/database')
const { generateToken } = require('../utils/jwt')
const { sendEmail, templates } = require('../utils/email')
const { success, error } = require('../utils/response')

// Validation rules
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

// POST /api/auth/register
const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return error(res, 'An account with this email already exists.', 409)

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: { firstName, lastName, email, password: hashedPassword, phone: phone || null },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, plan: true, createdAt: true },
  })

  // Send welcome email (async, don't await)
  sendEmail({ to: email, ...templates.welcome(firstName) })

  // Create welcome notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Welcome to ScholarPath! 🎓',
      message: 'Your account is ready. Start browsing 500+ scholarships.',
      type: 'success',
    },
  })

  const token = generateToken(user.id, user.role)
  return success(res, { user, token }, 'Account created successfully', 201)
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return error(res, 'Invalid email or password.', 401)

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return error(res, 'Invalid email or password.', 401)

  const { password: _, ...userWithoutPassword } = user
  const token = generateToken(user.id, user.role)

  return success(res, { user: userWithoutPassword, token }, 'Logged in successfully')
}

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, avatar: true, plan: true, role: true,
      isVerified: true, createdAt: true,
      _count: {
        select: {
          applications: true,
          savedScholarships: true,
          documents: true,
        },
      },
    },
  })
  return success(res, user)
}

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, plan: true },
  })
  return success(res, user, 'Profile updated successfully')
}

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) return error(res, 'Current password is incorrect.', 400)

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })

  return success(res, null, 'Password changed successfully')
}

module.exports = { register, login, getMe, updateProfile, changePassword, registerRules, loginRules }
