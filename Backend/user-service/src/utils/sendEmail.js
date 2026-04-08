const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const url = `http://localhost:4001/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your UniKart Email",
    html: `
      <h2>Welcome to UniKart</h2>
      <p>Click below to verify your email:</p>
      <a href="${url}">Verify Email</a>
    `,
  });
};

module.exports = sendVerificationEmail;
