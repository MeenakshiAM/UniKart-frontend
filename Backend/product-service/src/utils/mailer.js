const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= SEND EMAIL =================
async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"UniKart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
}

module.exports = { sendEmail };