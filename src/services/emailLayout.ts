// Shared dark minimalist layout for all VideoJobs notification emails.
// Keep every email consistent by composing inner content with emailShell()
// and emailButton() rather than re-declaring the chrome per template.

const LOGO_URL =
  "https://raw.githubusercontent.com/linearesdiego/backend-jobs/develop/assets/VIDEOJOBS2.png";

/** Wraps inner body HTML in the dark email chrome (logo header + footer). */
export const emailShell = (inner: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
  </head>
  <body style="margin:0;padding:0;background:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1120;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;width:100%;background:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="padding:32px 32px 8px;text-align:center;">
                <img src="${LOGO_URL}" alt="VideoJobs" width="150" style="max-width:150px;width:100%;height:auto;display:block;margin:0 auto;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 36px 40px;">
                ${inner}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 36px 32px;border-top:1px solid #1f2937;">
                <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                  © ${new Date().getFullYear()} VideoJobs · This is an automated message, please don't reply.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

/** Single accent CTA button used across emails. */
export const emailButton = (label: string, url: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:32px 0 8px;">
    <tr>
      <td style="border-radius:6px;background:#3b82f6;">
        <a href="${url}"
           style="display:inline-block;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none;padding:13px 30px;border-radius:6px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

/** Section heading used at the top of an email body. */
export const emailHeading = (text: string) => `
  <h1 style="margin:0 0 20px;color:#f1f5f9;font-size:21px;font-weight:600;line-height:1.4;">
    ${text}
  </h1>`;
