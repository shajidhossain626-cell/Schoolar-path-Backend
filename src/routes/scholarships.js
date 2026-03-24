const router = require('express').Router()
const ctrl = require('../controllers/scholarshipController')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

router.get ('/',          optionalAuth, ctrl.getAll)
router.get ('/saved',     protect, ctrl.getSaved)
router.get ('/:id',       optionalAuth, ctrl.getOne)
router.post('/:id/save',  protect, ctrl.toggleSave)
router.post('/',          protect, adminOnly, ctrl.create)
router.put ('/:id',       protect, adminOnly, ctrl.update)
router.delete('/:id',     protect, adminOnly, ctrl.remove)

module.exports = router
