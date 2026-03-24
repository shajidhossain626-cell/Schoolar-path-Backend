const prisma = require('../config/database')
const { sendEmail, templates } = require('../utils/email')
const { success, error } = require('../utils/response')

// GET /api/applications/me
const getMyApplications = async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { scholarship: { select: { name: true, flag: true, country: true, shortName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return success(res, applications)
}

// POST /api/applications
const create = async (req, res) => {
  const { scholarshipId, appliedVia = 'self', notes } = req.body

  const scholarship = await prisma.scholarship.findUnique({ where: { id: scholarshipId } })
  if (!scholarship) return error(res, 'Scholarship not found.', 404)

  // Check duplicate
  const existing = await prisma.application.findFirst({
    where: { userId: req.user.id, scholarshipId },
  })
  if (existing) return error(res, 'You have already applied for this scholarship.', 409)

  const application = await prisma.application.create({
    data: { userId: req.user.id, scholarshipId, appliedVia, notes },
    include: { scholarship: { select: { name: true, flag: true, country: true } } },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      title: 'Application Started',
      message: `Your application for ${scholarship.name} has been created.`,
      type: 'info',
    },
  })

  return success(res, application, 'Application created', 201)
}

// PUT /api/applications/:id
const update = async (req, res) => {
  const { status, progress, notes } = req.body

  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { scholarship: true },
  })
  if (!application) return error(res, 'Application not found.', 404)

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      ...(status   && { status }),
      ...(progress !== undefined && { progress }),
      ...(notes    && { notes }),
      ...(status === 'SUBMITTED' && { submittedAt: new Date() }),
    },
  })

  // Send email on status change
  if (status && status !== application.status) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    sendEmail({
      to: user.email,
      ...templates.applicationUpdate(user.firstName, application.scholarship.name, status),
    })

    // Notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: `Application ${status.replace('_', ' ')}`,
        message: `Your ${application.scholarship.name} application is now: ${status.replace('_', ' ')}`,
        type: status === 'ACCEPTED' ? 'success' : 'info',
      },
    })
  }

  return success(res, updated, 'Application updated')
}

// DELETE /api/applications/:id
const remove = async (req, res) => {
  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!application) return error(res, 'Application not found.', 404)
  if (application.status === 'SUBMITTED') {
    return error(res, 'Cannot delete a submitted application.', 400)
  }

  await prisma.application.delete({ where: { id: req.params.id } })
  return success(res, null, 'Application deleted')
}

// GET /api/applications  (admin: all applications)
const getAll = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const where = status ? { status } : {}
  const skip = (Number(page) - 1) * Number(limit)

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        scholarship: { select: { name: true, flag: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: Number(limit),
    }),
    prisma.application.count({ where }),
  ])

  return success(res, { applications, total, page: Number(page) })
}

module.exports = { getMyApplications, create, update, remove, getAll }
