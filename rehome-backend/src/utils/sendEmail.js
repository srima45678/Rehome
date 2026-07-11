// sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"ReHome Nepal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: attachments || []
    });

    console.log('Email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

module.exports = sendEmail;