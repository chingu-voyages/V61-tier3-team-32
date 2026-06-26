const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password reset email with the provided reset link.
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const firstName = name?.split(" ")[0] || "there";

  await transporter.sendMail({
    from: `"FoodRescue" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Reset your FoodRescue password",
    text: `Hi ${firstName},\n\nClick the link below to reset your password. It expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— The FoodRescue Team`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="margin-bottom:24px;">
          <span style="background:#166534;color:#fff;padding:8px 14px;border-radius:50px;font-size:14px;font-weight:700;">FoodRescue</span>
        </div>
        <h2 style="color:#1B1B1B;font-size:24px;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Hi ${firstName}, we received a request to reset the password for your FoodRescue account. Click the button below to choose a new one.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#166534;color:#fff;padding:12px 28px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:24px;">
          Reset my password
        </a>
        <p style="color:#9CA3AF;font-size:13px;line-height:1.6;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0;">
        <p style="color:#D1D5DB;font-size:12px;">FoodRescue · Built for communities across Nigeria</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
