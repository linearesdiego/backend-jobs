import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer";
import { env } from "../config/env";
import { emailShell, emailButton, emailHeading } from "./emailLayout";

interface VerificationPayload {
  userId: string;
  email: string;
}

export async function sendVerificationEmail(userId: string, email: string) {
  const token = jwt.sign(
    { userId, email } as VerificationPayload,
    env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  const verificationUrl = `${env.FRONTEND_URL}/register/verify-email?token=${token}`;

  await sendMail({
    to: email,
    subject: "Verify your email address - VideoJobs",
    html: emailShell(`
      ${emailHeading("Welcome to VideoJobs 🎉")}

      <p style="margin:0 0 18px;color:#94a3b8;font-size:15px;line-height:1.7;">
        Thanks for signing up. Verify your email address to start using VideoJobs.
      </p>

      ${emailButton("Verify my email address", verificationUrl)}

      <div style="margin:28px 0;border-top:1px solid #1f2937;"></div>

      <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.5;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <div style="background:#0b1120;border-left:3px solid #334155;padding:14px;border-radius:4px;margin-bottom:24px;">
        <p style="margin:0;color:#60a5fa;font-size:13px;word-break:break-all;line-height:1.5;">
          ${verificationUrl}
        </p>
      </div>

      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
        ⏰ This link expires in 24 hours for security reasons.
      </p>
    `),
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

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = jwt.sign(
    { userId, email } as VerificationPayload,
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset your password - VideoJobs",
    html: emailShell(`
      ${emailHeading("Reset your password 🔐")}

      <p style="margin:0 0 18px;color:#94a3b8;font-size:15px;line-height:1.7;">
        We received a request to reset the password for your VideoJobs account.
      </p>

      <p style="margin:0 0 8px;color:#94a3b8;font-size:15px;line-height:1.7;">
        Click the button below to set a new password. This link expires in <strong style="color:#cbd5e1;">1 hour</strong>.
      </p>

      ${emailButton("Reset my password", resetUrl)}

      <div style="margin:28px 0;border-top:1px solid #1f2937;"></div>

      <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.5;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <div style="background:#0b1120;border-left:3px solid #334155;padding:14px;border-radius:4px;margin-bottom:24px;">
        <p style="margin:0;color:#60a5fa;font-size:13px;word-break:break-all;line-height:1.5;">
          ${resetUrl}
        </p>
      </div>

      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
        ⚠️ If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
    `),
  });
}
