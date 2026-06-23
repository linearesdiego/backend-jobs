import { sendMail } from "../config/mailer";
import { env } from "../config/env";
import { emailShell, emailButton, emailHeading } from "./emailLayout";

export async function sendApplicationApprovedEmail(email: string) {
  await sendMail({
    to: email,
    subject: "Your post was approved - VideoJobs",
    html: emailShell(`
      ${emailHeading("Your post is live")}
      <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.7;">
        A moderator approved your video post. It's now visible to contractors on VideoJobs.
      </p>
      ${emailButton("View my post", `${env.FRONTEND_URL}/provider/create-post`)}
    `),
  });
}

export async function sendApplicationRejectedEmail(email: string, reason: string) {
  await sendMail({
    to: email,
    subject: "Your post needs changes - VideoJobs",
    html: emailShell(`
      ${emailHeading("Your post needs changes")}
      <p style="margin:0 0 18px;color:#94a3b8;font-size:15px;line-height:1.7;">
        A moderator reviewed your post and it can't be published yet.
      </p>
      <div style="background:#0b1120;border-left:3px solid #334155;padding:14px 16px;border-radius:4px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">Reason</p>
        <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;">${reason}</p>
      </div>
      <p style="margin:18px 0 0;color:#94a3b8;font-size:15px;line-height:1.7;">
        Update your post and submit it again for review.
      </p>
      ${emailButton("Edit my post", `${env.FRONTEND_URL}/provider/create-post`)}
    `),
  });
}
