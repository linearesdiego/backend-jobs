import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer";
import { env } from "../config/env";

interface VerificationPayload {
  userId: string;
  email: string;
}

const LOGO_URL = "https://raw.githubusercontent.com/linearesdiego/backend-jobs/develop/assets/VIDEOJOBS2.png";

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; border-radius: 0 !important; }
          .email-body { padding: 30px 20px !important; }
          .email-header { padding: 30px 20px !important; }
          .email-footer { padding: 20px !important; }
          .btn-cta { padding: 14px 32px !important; font-size: 15px !important; }
          .logo-img { max-width: 160px !important; }
          h2 { font-size: 22px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fa;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">

              <!-- Header -->
              <tr>
                <td class="email-header" style="background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 50%,#06b6d4 100%);padding:36px 30px;text-align:center;">
                  <img src="${LOGO_URL}" alt="VideoJobs" class="logo-img" width="200" style="max-width:200px;width:100%;height:auto;display:block;margin:0 auto;">
                </td>
              </tr>

              ${content}

              <!-- Footer -->
              <tr>
                <td class="email-footer" style="background-color:#f9fafb;padding:28px 40px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
                    If you didn't create an account on VideoJobs, you can safely ignore this email.
                  </p>
                  <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
                    © ${new Date().getFullYear()} VideoJobs. All rights reserved.
                  </p>
                  <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;text-align:center;">
                    This is an automated email, please do not reply to this message.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
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
    html: emailWrapper(`
      <tr>
        <td class="email-body" style="padding:44px 40px;">
          <h2 style="margin:0 0 18px;color:#1f2937;font-size:26px;font-weight:600;text-align:center;">
            Welcome to VideoJobs! 🎉
          </h2>

          <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.6;">
            Thank you for signing up. We're excited to have you with us.
          </p>

          <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.6;">
            To start using all the features of VideoJobs, verify your email address by clicking the button below:
          </p>

          <!-- CTA Button -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding:8px 0 28px;">
                <a href="${verificationUrl}" class="btn-cta"
                   style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 48px;border-radius:8px;box-shadow:0 4px 12px rgba(59,130,246,0.4);">
                  Verify my email address
                </a>
              </td>
            </tr>
          </table>

          <div style="margin:8px 0 28px;border-top:1px solid #e5e7eb;"></div>

          <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.5;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <div style="background-color:#f9fafb;padding:14px;border-radius:6px;border-left:4px solid #3b82f6;margin-bottom:28px;">
            <p style="margin:0;color:#3b82f6;font-size:13px;word-break:break-all;line-height:1.5;">
              ${verificationUrl}
            </p>
          </div>

          <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:6px;">
            <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
              ⏰ <strong>Important:</strong> This link will expire in 24 hours for security reasons.
            </p>
          </div>
        </td>
      </tr>
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
    html: emailWrapper(`
      <tr>
        <td class="email-body" style="padding:44px 40px;">
          <h2 style="margin:0 0 18px;color:#1f2937;font-size:26px;font-weight:600;text-align:center;">
            Reset your password 🔐
          </h2>

          <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.6;">
            We received a request to reset the password for your VideoJobs account.
          </p>

          <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.6;">
            Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
          </p>

          <!-- CTA Button -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding:8px 0 28px;">
                <a href="${resetUrl}" class="btn-cta"
                   style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 48px;border-radius:8px;box-shadow:0 4px 12px rgba(59,130,246,0.4);">
                  Reset my password
                </a>
              </td>
            </tr>
          </table>

          <div style="margin:8px 0 28px;border-top:1px solid #e5e7eb;"></div>

          <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.5;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <div style="background-color:#f9fafb;padding:14px;border-radius:6px;border-left:4px solid #3b82f6;margin-bottom:28px;">
            <p style="margin:0;color:#3b82f6;font-size:13px;word-break:break-all;line-height:1.5;">
              ${resetUrl}
            </p>
          </div>

          <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:6px;">
            <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
              ⚠️ <strong>Important:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will not change.
            </p>
          </div>
        </td>
      </tr>
    `),
  });
}
