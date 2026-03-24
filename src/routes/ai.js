const router = require('express').Router()
const ctrl = require('../controllers/aiController')
const { protect } = require('../middleware/auth')
const { ai: aiLimit } = require('../middleware/rateLimit')

router.post('/ask', aiLimit, ctrl.ask)   // Public - no auth needed

module.exports = router
