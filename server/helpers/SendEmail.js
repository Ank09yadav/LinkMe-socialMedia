const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const user = process.env.GMAIL;
const password = process.env.GOOGLE_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  secure: false, 
  auth: {
    user,
    pass: password,
  },
});

async function sendMail(to, subject, text, html) {
  try {
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required.');
    }
    const info = await transporter.sendMail({
      from: '"LinkMe App" <no-reply@gmail.com>', 
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('SendMail error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendMail };