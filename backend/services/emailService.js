const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const templates = {
  'verify-email': (data) => ({
    subject: 'Verify Your TMS Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#1F4E79;padding:20px;border-radius:6px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">✈️ Travel Management System</h1>
        </div>
        <div style="padding:24px">
          <h2>Hello, ${data.name}!</h2>
          <p>Thank you for registering. Please verify your email address to get started.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${data.verificationUrl}" style="background:#2E75B6;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px">
              Verify Email Address
            </a>
          </div>
          <p style="color:#666;font-size:14px">This link expires in 24 hours. If you didn't register, please ignore this email.</p>
        </div>
      </div>
    `
  }),
  'booking-confirmation': (data) => ({
    subject: `Booking Confirmed ✅ - ${data.booking.bookingRef}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#1F4E79;padding:20px;border-radius:6px;text-align:center">
          <h1 style="color:#fff;margin:0">✈️ Booking Confirmed!</h1>
        </div>
        <div style="padding:24px">
          <h2>Hi ${data.name},</h2>
          <p>Your booking has been confirmed. Here are your details:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f0f7ff"><td style="padding:10px;font-weight:bold;width:40%">Booking Reference</td><td style="padding:10px">${data.booking.bookingRef}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Type</td><td style="padding:10px">${data.booking.bookingType.toUpperCase()}</td></tr>
            <tr style="background:#f0f7ff"><td style="padding:10px;font-weight:bold">Travel Date</td><td style="padding:10px">${new Date(data.booking.travelDate).toDateString()}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Amount Paid</td><td style="padding:10px">₹${data.booking.totalAmount}</td></tr>
          </table>
          ${data.ticketUrl ? `<div style="text-align:center;margin:24px 0"><a href="${data.ticketUrl}" style="background:#2E75B6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Download E-Ticket</a></div>` : ''}
          <p style="color:#666;font-size:13px">For support, contact us at support@travelms.com</p>
        </div>
      </div>
    `
  }),
  'booking-cancellation': (data) => ({
    subject: `Booking Cancelled - ${data.bookingRef}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#c0392b;padding:20px;border-radius:6px;text-align:center">
          <h1 style="color:#fff;margin:0">Booking Cancelled</h1>
        </div>
        <div style="padding:24px">
          <h2>Hi ${data.name},</h2>
          <p>Your booking <strong>${data.bookingRef}</strong> has been cancelled.</p>
          <p>Refund Amount: <strong>₹${data.refundAmount}</strong></p>
          <p>Refunds are processed within 5–7 business days to your original payment method.</p>
        </div>
      </div>
    `
  }),
  'reset-password': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2>Password Reset</h2>
        <p>Hi ${data.name}, click below to reset your password. This link expires in 10 minutes.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${data.resetUrl}" style="background:#2E75B6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Reset Password</a>
        </div>
        <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
      </div>
    `
  }),
};

/**
 * Send email using a named template
 * @param {Object} options - { to, subject, template, data }
 */
const sendEmail = async ({ to, template, data, subject, html }) => {
  let mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
  };

  if (template && templates[template]) {
    const rendered = templates[template](data);
    mailOptions.subject = rendered.subject;
    mailOptions.html = rendered.html;
  } else {
    mailOptions.subject = subject;
    mailOptions.html = html;
  }

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
