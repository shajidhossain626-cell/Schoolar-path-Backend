const router = require('express').Router()
const ctrl = require('../controllers/applicationController')
const { protect, adminOnly } = require('../middleware/auth')

router.get ('/',     protect, adminOnly, ctrl.getAll)
router.get ('/me',   protect, ctrl.getMyApplications)
router.post('/',     protect, ctrl.create)
router.put ('/:id',  protect, ctrl.update)
router.delete('/:id',protect, ctrl.remove)

module.exports = router
