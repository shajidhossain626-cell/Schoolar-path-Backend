const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    console.log(`📧 Email sent to ${to}`)
  } catch (err) {
    console.error('❌ Email send failed:', err.message)
    // Don't throw - email failure shouldn't break the flow
  }
}

// Email templates
const templates = {
  welcome: (firstName) => ({
    subject: 'Welcome to ScholarPath BD! 🎓',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0B2545,#1B3D6E);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">ScholarPath BD</h1>
        </div>
        <div style="padding:32px">
          <h2>Welcome, ${firstName}! 🎉</h2>
          <p>Your account has been created successfully. You can now:</p>
          <ul>
            <li>Browse 500+ international scholarships</li>
            <li>Save scholarships to your dashboard</li>
            <li>Use our AI advisor for instant answers</li>
            <li>Track your applications</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
            Start Browsing Scholarships →
          </a>
        </div>
      </div>
    `,
  }),

  paymentSuccess: (firstName, plan, amount) => ({
    subject: `Payment Confirmed - ${plan} Package | ScholarPath BD`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0B2545,#1B3D6E);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">ScholarPath BD</h1>
        </div>
        <div style="padding:32px">
          <h2>Payment Confirmed ✅</h2>
          <p>Hi ${firstName}, your payment has been received.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0">
            <p style="margin:4px 0"><strong>Package:</strong> ${plan}</p>
            <p style="margin:4px 0"><strong>Amount:</strong> ৳${amount}</p>
            <p style="margin:4px 0"><strong>Status:</strong> <span style="color:#059669">Confirmed</span></p>
          </div>
          <p>Our team will contact you within 24 hours to begin your application.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `,
  }),

  applicationUpdate: (firstName, scholarshipName, status) => ({
    subject: `Application Update: ${scholarshipName} | ScholarPath BD`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0B2545,#1B3D6E);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">ScholarPath BD</h1>
        </div>
        <div style="padding:32px">
          <h2>Application Update</h2>
          <p>Hi ${firstName}, your application status has been updated.</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0">
            <p><strong>Scholarship:</strong> ${scholarshipName}</p>
            <p><strong>New Status:</strong> <span style="color:#059669;font-weight:bold">${status}</span></p>
          </div>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#1A6BF5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">
            View Application →
          </a>
        </div>
      </div>
    `,
  }),
}

module.exports = { sendEmail, templates }
