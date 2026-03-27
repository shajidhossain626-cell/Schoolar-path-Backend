const router = require('express').Router()
const prisma = require('../config/database')
const { protect, adminOnly } = require('../middleware/auth')
const { success } = require('../utils/response')

router.use(protect, adminOnly)

// GET /api/admin/stats  — dashboard overview
router.get('/stats', async (req, res) => {
  const [users, scholarships, applications, payments, contacts] = await Promise.all([
    prisma.user.count(),
    prisma.scholarship.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, plan: true, createdAt: true },
  })

  return success(res, {
    totals: {
      users,
      scholarships,
      applications,
      revenue: payments._sum.amount || 0,
      unreadContacts: contacts,
    },
    recentUsers,
  })
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search } = req.query
  const where = search
    ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { firstName: { contains: search, mode: 'insensitive' } }] }
    : {}
  const users = await prisma.user.findMany({
    where, orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    select: { id: true, firstName: true, lastName: true, email: true, plan: true, role: true, createdAt: true, _count: { select: { applications: true, payments: true } } },
  })
  return success(res, users)
})

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', async (req, res) => {
  const { status, progress } = req.body
  const app = await prisma.application.update({
    where: { id: req.params.id },
    data: { status, ...(progress !== undefined && { progress }) },
    include: { scholarship: true, user: true },
  })
  return success(res, app, 'Status updated')
})

module.exports = router

// GET /api/admin/documents — all documents with user info
router.get('/documents', async (req, res) => {
  const documents = await prisma.document.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    },
    orderBy: { uploadedAt: 'desc' }
  })
  return success(res, documents)
})
