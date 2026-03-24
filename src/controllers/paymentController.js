const axios = require('axios')
const prisma = require('../config/database')
const { sendEmail, templates } = require('../utils/email')
const { success, error } = require('../utils/response')

const PLAN_PRICES = { BASIC: 2500, STANDARD: 5000, PREMIUM: 8000 }
const SSLC_API = process.env.SSLC_IS_LIVE === 'true'
  ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

// POST /api/payments/initiate
const initiate = async (req, res) => {
  const { plan } = req.body
  if (!PLAN_PRICES[plan]) return error(res, 'Invalid plan selected.', 400)

  const amount = PLAN_PRICES[plan]
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      userId:   req.user.id,
      plan,
      amount,
      method:   'sslcommerz',
      status:   'PENDING',
    },
  })

  try {
    const sslcData = {
      store_id:       process.env.SSLC_STORE_ID,
      store_passwd:   process.env.SSLC_STORE_PASS,
      total_amount:   amount,
      currency:       'BDT',
      tran_id:        payment.id,
      success_url:    `${process.env.FRONTEND_URL}/payment/success?paymentId=${payment.id}`,
      fail_url:       `${process.env.FRONTEND_URL}/payment/failed?paymentId=${payment.id}`,
      cancel_url:     `${process.env.FRONTEND_URL}/payment/cancelled?paymentId=${payment.id}`,
      ipn_url:        `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      cus_name:       `${user.firstName} ${user.lastName}`,
      cus_email:      user.email,
      cus_phone:      user.phone || '01700000000',
      cus_add1:       'Dhaka, Bangladesh',
      cus_city:       'Dhaka',
      cus_country:    'Bangladesh',
      shipping_method:'NO',
      product_name:   `ScholarPath ${plan} Package`,
      product_category:'Service',
      product_profile:'general',
    }

    const response = await axios.post(SSLC_API, new URLSearchParams(sslcData))
    const sslcResponse = response.data

    if (sslcResponse.status === 'SUCCESS') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { sessionKey: sslcResponse.sessionkey },
      })
      return success(res, { redirectUrl: sslcResponse.GatewayPageURL, paymentId: payment.id })
    }

    return error(res, 'Could not initiate payment. Try again.', 500)

  } catch (e) {
    console.error('SSLCommerz error:', e.message)
    // Fallback: return mock redirect for development
    if (process.env.NODE_ENV === 'development') {
      return success(res, {
        redirectUrl: `${process.env.FRONTEND_URL}/payment/success?paymentId=${payment.id}&mock=true`,
        paymentId: payment.id,
        devNote: 'Mock payment - SSLCommerz not configured yet',
      })
    }
    return error(res, 'Payment gateway error. Please try again.', 500)
  }
}

// POST /api/payments/webhook  (SSLCommerz IPN)
const webhook = async (req, res) => {
  const { tran_id, status, val_id, store_id } = req.body

  if (store_id !== process.env.SSLC_STORE_ID) {
    return res.status(403).send('Forbidden')
  }

  const payment = await prisma.payment.findUnique({ where: { id: tran_id } })
  if (!payment) return res.status(404).send('Payment not found')

  if (status === 'VALID' || status === 'VALIDATED') {
    await handleSuccess(payment, val_id)
  } else if (status === 'FAILED') {
    await prisma.payment.update({ where: { id: tran_id }, data: { status: 'FAILED' } })
  }

  res.send('IPN_RECEIVED')
}

// POST /api/payments/success  (frontend calls after redirect)
const confirmSuccess = async (req, res) => {
  const { paymentId, mock } = req.body

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: req.user.id },
  })
  if (!payment) return error(res, 'Payment not found.', 404)
  if (payment.status === 'SUCCESS') return success(res, payment, 'Payment already confirmed')

  // In dev/mock mode, confirm immediately
  if (mock === 'true' || process.env.NODE_ENV === 'development') {
    await handleSuccess(payment, `MOCK_${Date.now()}`)
    const updated = await prisma.payment.findUnique({ where: { id: paymentId } })
    return success(res, updated, 'Payment confirmed')
  }

  return error(res, 'Payment not yet confirmed by gateway.', 400)
}

// Internal: handle successful payment
const handleSuccess = async (payment, transactionId) => {
  // Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCESS', transactionId, method: 'sslcommerz' },
  })

  // Upgrade user plan
  await prisma.user.update({
    where: { id: payment.userId },
    data: { plan: payment.plan },
  })

  // Notification + email
  const user = await prisma.user.findUnique({ where: { id: payment.userId } })

  await prisma.notification.create({
    data: {
      userId:  payment.userId,
      title:   'Payment Confirmed ✅',
      message: `Your ${payment.plan} package is now active. Our team will contact you within 24 hours.`,
      type:    'success',
    },
  })

  sendEmail({ to: user.email, ...templates.paymentSuccess(user.firstName, payment.plan, payment.amount) })
}

// GET /api/payments/me
const getMyPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return success(res, payments)
}

// GET /api/payments  (admin only)
const getAll = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const where = status ? { status } : {}
  const skip = (Number(page) - 1) * Number(limit)

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: Number(limit),
    }),
    prisma.payment.count({ where }),
  ])
  return success(res, { payments, total })
}

module.exports = { initiate, webhook, confirmSuccess, getMyPayments, getAll }
