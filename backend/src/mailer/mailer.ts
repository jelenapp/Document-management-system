import nodemailer from "nodemailer";
import {EMAIL_APP_PASS, EMAIL_USER, NEXT_AUTH_URL} from "../config/config";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${NEXT_AUTH_URL}/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Collab File System App" <${EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <p>Zdravo,</p>
        <p>Kliknite na link ispod da biste verifikovali svoj email:</p>
        <a href="${verificationUrl}" style="color: #2563eb">${verificationUrl}</a>
        <p>Hvala!</p>
      `,
    });

    console.log("Verification email sent:", info);
  } catch (error) {
    console.error("Error sending email via Gmail SMTP:", error);
    throw new Error("Email nije moguce poslati.");
  }
}