const prisma = require('../config/database')
const { success, error, paginated } = require('../utils/response')

// GET /api/scholarships
const getAll = async (req, res) => {
  const {
    country, funding, field, degree,
    search, sort = 'latest',
    page = 1, limit = 12,
    deadline,
  } = req.query

  const where = { isActive: true }

  // Filters
  if (country) where.country = { in: country.split(',') }
  if (funding) where.funding = { in: funding.toUpperCase().split(',') }
  if (field)   where.field   = { in: field.toUpperCase().split(',') }
  if (degree)  where.degree  = { hasSome: degree.toUpperCase().split(',') }

  if (search) {
    where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { country:     { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (deadline) {
    const now = new Date()
    const windows = { month: 30, '3month': 90, '6month': 180 }
    if (windows[deadline]) {
      where.deadline = { lte: new Date(now.getTime() + windows[deadline] * 86400000), gte: now }
    }
  }

  const orderBy = sort === 'deadline' ? { deadline: 'asc' } : { createdAt: 'desc' }

  const skip = (Number(page) - 1) * Number(limit)
  const [scholarships, total] = await Promise.all([
    prisma.scholarship.findMany({ where, orderBy, skip, take: Number(limit) }),
    prisma.scholarship.count({ where }),
  ])

  return paginated(res, scholarships, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  })
}

// GET /api/scholarships/:id
const getOne = async (req, res) => {
  const scholarship = await prisma.scholarship.findFirst({
    where: {
      OR: [{ id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    },
  })
  if (!scholarship) return error(res, 'Scholarship not found.', 404)
  return success(res, scholarship)
}

// POST /api/scholarships/:id/save  (toggle)
const toggleSave = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const scholarship = await prisma.scholarship.findUnique({ where: { id } })
  if (!scholarship) return error(res, 'Scholarship not found.', 404)

  const existing = await prisma.savedScholarship.findUnique({
    where: { userId_scholarshipId: { userId, scholarshipId: id } },
  })

  if (existing) {
    await prisma.savedScholarship.delete({ where: { id: existing.id } })
    return success(res, { saved: false }, 'Removed from saved')
  } else {
    await prisma.savedScholarship.create({ data: { userId, scholarshipId: id } })
    return success(res, { saved: true }, 'Saved successfully')
  }
}

// GET /api/scholarships/saved
const getSaved = async (req, res) => {
  const saved = await prisma.savedScholarship.findMany({
    where: { userId: req.user.id },
    include: { scholarship: true },
    orderBy: { createdAt: 'desc' },
  })
  return success(res, saved.map(s => ({ ...s.scholarship, savedAt: s.createdAt })))
}

// POST /api/scholarships  (admin only)
const create = async (req, res) => {
  const scholarship = await prisma.scholarship.create({ data: req.body })
  return success(res, scholarship, 'Scholarship created', 201)
}

// PUT /api/scholarships/:id  (admin only)
const update = async (req, res) => {
  const scholarship = await prisma.scholarship.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return success(res, scholarship, 'Scholarship updated')
}

// DELETE /api/scholarships/:id  (admin only)
const remove = async (req, res) => {
  await prisma.scholarship.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  return success(res, null, 'Scholarship removed')
}

module.exports = { getAll, getOne, toggleSave, getSaved, create, update, remove }
