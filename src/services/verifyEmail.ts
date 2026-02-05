import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer";
import { env } from "../config/env";

interface VerificationPayload {
  userId: string;
  email: string;
}

export async function sendVerificationEmail(userId: string, email: string) {
  // Generate verification token (expires in 24 hours)
  const token = jwt.sign(
    { userId, email } as VerificationPayload,
    env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  // Create verification URL
  const verificationUrl = `${env.FRONTEND_URL}/register/verify-email?token=${token}`;

  // Send email
  await sendMail({
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to VideoJobs!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  });
}

export async function verifyEmailToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as VerificationPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired verification token");
  }
}
