const router = require('express').Router()
const { register, login, getMe, updateProfile, changePassword, registerRules, loginRules } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { auth: authLimit } = require('../middleware/rateLimit')
const validate = require('../middleware/validate')

router.post('/register', authLimit, registerRules, validate, register)
router.post('/login',    authLimit, loginRules,    validate, login)
router.get ('/me',       protect, getMe)
router.put ('/profile',  protect, updateProfile)
router.put ('/password', protect, changePassword)

module.exports = router
