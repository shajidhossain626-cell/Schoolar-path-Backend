const prisma = require('../config/database')
const { sendEmail } = require('../utils/email')
const { success } = require('../utils/response')

// POST /api/contact
const send = async (req, res) => {
  const { firstName, lastName, email, phone, interest, message } = req.body

  await prisma.contactMessage.create({
    data: { firstName, lastName, email, phone, interest, message },
  })

  // Email to admin
  sendEmail({
    to: process.env.EMAIL_USER,
    subject: `New Contact: ${firstName} – ${interest || 'General Inquiry'}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Interest:</strong> ${interest || 'General'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  })

  // Auto-reply to user
  sendEmail({
    to: email,
    subject: 'We received your message — ScholarPath BD',
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Hi ${firstName},</h2>
        <p>Thank you for contacting ScholarPath BD! We've received your message and will reply within 24 hours.</p>
        <p>In the meantime, try our <a href="${process.env.FRONTEND_URL}">AI Advisor</a> for instant answers.</p>
        <p>Best regards,<br/>ScholarPath BD Team</p>
      </div>
    `,
  })

  return success(res, null, 'Message sent successfully', 201)
}

// GET /api/contact  (admin only)
const getAll = async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return success(res, messages)
}

module.exports = { send, getAll }
