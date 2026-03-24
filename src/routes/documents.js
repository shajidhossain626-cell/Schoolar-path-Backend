const router = require('express').Router()
const ctrl = require('../controllers/documentController')
const { protect, adminOnly } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.get ('/',           protect, ctrl.getMyDocuments)
router.post('/upload',     protect, upload.single('file'), ctrl.upload)
router.delete('/:id',      protect, ctrl.remove)
router.put ('/:id/status', protect, adminOnly, ctrl.updateStatus)

module.exports = router
