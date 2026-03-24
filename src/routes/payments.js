const router = require('express').Router()
const ctrl = require('../controllers/paymentController')
const { protect, adminOnly } = require('../middleware/auth')

router.post('/initiate',         protect, ctrl.initiate)
router.post('/webhook',                   ctrl.webhook)       // SSLCommerz IPN (no auth)
router.post('/success',          protect, ctrl.confirmSuccess)
router.get ('/me',               protect, ctrl.getMyPayments)
router.get ('/',                 protect, adminOnly, ctrl.getAll)

module.exports = router
