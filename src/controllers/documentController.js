const prisma = require('../config/database')
const { cloudinary } = require('../config/cloudinary')
const { success, error } = require('../utils/response')

// GET /api/documents/me
const getMyDocuments = async (req, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.user.id },
    orderBy: { uploadedAt: 'desc' },
  })
  return success(res, documents)
}

// POST /api/documents/upload
const upload = async (req, res) => {
  if (!req.file) return error(res, 'No file uploaded.', 400)

  const document = await prisma.document.create({
    data: {
      userId:   req.user.id,
      name:     req.file.originalname,
      fileUrl:  req.file.path,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: req.file.mimetype,
      status:   'PENDING',
    },
  })

  return success(res, document, 'Document uploaded successfully', 201)
}

// DELETE /api/documents/:id
const remove = async (req, res) => {
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!doc) return error(res, 'Document not found.', 404)

  // Delete from Cloudinary
  try {
    const publicId = doc.fileUrl.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(`scholarpath/documents/${publicId}`)
  } catch (e) {
    console.warn('Cloudinary delete failed:', e.message)
  }

  await prisma.document.delete({ where: { id: req.params.id } })
  return success(res, null, 'Document deleted')
}

// PUT /api/documents/:id/status  (admin only)
const updateStatus = async (req, res) => {
  const { status } = req.body
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { status },
  })
  return success(res, doc, 'Document status updated')
}

module.exports = { getMyDocuments, upload, remove, updateStatus }
