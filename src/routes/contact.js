const router = require('express').Router()
const ctrl = require('../controllers/contactController')
const { protect, adminOnly } = require('../middleware/auth')
const { body } = require('express-validator')
const validate = require('../middleware/validate')

const rules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
]

router.post('/',  rules, validate, ctrl.send)
router.get ('/',  protect, adminOnly, ctrl.getAll)

module.exports = router
