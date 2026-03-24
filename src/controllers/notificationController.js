const prisma = require('../config/database')
const { success } = require('../utils/response')

// GET /api/notifications
const getAll = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  })
  return success(res, { notifications, unreadCount })
}

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  })
  return success(res, null, 'All notifications marked as read')
}

// PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  })
  return success(res, null, 'Notification marked as read')
}

module.exports = { getAll, markAllRead, markRead }
