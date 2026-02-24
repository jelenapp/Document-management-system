import nodemailer from "nodemailer";

/**
 * @deprecated This function has been moved to the backend.
 * @param email
 * @param token
 * Safe to delete after verification.
 */

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,  
      pass: process.env.EMAIL_APP_PASS,  
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"RTC App" <${process.env.EMAIL_USER}>`,
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
    throw new Error("Email nije mogao biti poslat.");
  }
};
