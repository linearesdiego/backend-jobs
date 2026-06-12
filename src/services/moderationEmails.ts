import { sendMail } from "../config/mailer";
import { env } from "../config/env";

const shell = (heading: string, bodyHtml: string) => `
  <!DOCTYPE html>
  <html lang="en"><head><meta charset="UTF-8" /></head>
  <body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" style="width:100%;border-collapse:collapse;background:#f4f7fa;">
      <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);">
          <tr><td style="background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 50%,#06b6d4 100%);padding:40px 30px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:32px;font-weight:700;">VideoJobs</h1>
          </td></tr>
          <tr><td style="padding:50px 40px;">
            <h2 style="margin:0 0 20px;color:#1f2937;font-size:26px;text-align:center;">${heading}</h2>
            ${bodyHtml}
          </td></tr>
          <tr><td style="background:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} VideoJobs. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

export async function sendApplicationApprovedEmail(email: string) {
  await sendMail({
    to: email,
    subject: "Your post was approved - VideoJobs",
    html: shell(
      "Your post is approved! 🎉",
      `<p style="color:#4b5563;font-size:16px;line-height:1.6;">
         Good news — a moderator approved your video post. It's now visible to contractors on VideoJobs.
       </p>
       <p style="margin-top:24px;">
         <a href="${env.FRONTEND_URL}/provider/create-post"
            style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;">
           View my post
         </a>
       </p>`,
    ),
  });
}

export async function sendApplicationRejectedEmail(email: string, reason: string) {
  await sendMail({
    to: email,
    subject: "Your post needs changes - VideoJobs",
    html: shell(
      "Your post needs changes",
      `<p style="color:#4b5563;font-size:16px;line-height:1.6;">
         A moderator reviewed your video post and it can't be published yet. Reason:
       </p>
       <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:6px;margin:20px 0;color:#92400e;font-size:14px;">
         ${reason}
       </div>
       <p style="color:#4b5563;font-size:16px;line-height:1.6;">
         Update your post and submit it again for review.
       </p>
       <p style="margin-top:24px;">
         <a href="${env.FRONTEND_URL}/provider/create-post"
            style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;">
           Edit my post
         </a>
       </p>`,
    ),
  });
}
