import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { type RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Resend({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,

    async generateVerificationToken() {
        const random: RandomReader = {
            read(bytes: Uint8Array) {
                crypto.getRandomValues(bytes);
            },
        };
        return generateRandomString(random, "0123456789", 6);
    },

    async sendVerificationRequest({ identifier: email, provider, token }) {
        const resend = new ResendAPI(provider.apiKey);
        const { error } = await resend.emails.send({
            from: "Arcbase <noreply@arcbase.one>",
            to: [email],
            subject: `Your Arcbase verification code: ${token}`,
            html: generateEmailHTML(token),
        });

        if (error) {
            console.error("Email send error:", error);
            throw new Error("Could not send verification email");
        }
    },
});

function generateEmailHTML(code: string): string {
    const digits = code.split("");

    const digitBoxes = digits
        .map(
            (d) => `
      <td style="padding: 0 4px;">
        <div style="
          width: 48px;
          height: 56px;
          background: #1e1e2e;
          border: 2px solid #313244;
          border-radius: 12px;
          font-size: 28px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
          color: #cdd6f4;
          line-height: 56px;
          text-align: center;
        ">${d}</div>
      </td>
    `
        )
        .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #11111b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #11111b;">
    <tr>
      <td align="center" style="padding: 48px 24px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="
          background: #181825;
          border: 1px solid #313244;
          border-radius: 20px;
          overflow: hidden;
          max-width: 480px;
          width: 100%;
        ">
          <!-- Header gradient bar -->
          <tr>
            <td style="
              height: 4px;
              background: linear-gradient(90deg, #89b4fa, #cba6f7, #f38ba8);
            "></td>
          </tr>

          <!-- Logo & Title -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="
                      font-size: 24px;
                      font-weight: 800;
                      color: #cdd6f4;
                      letter-spacing: -0.5px;
                    ">arcbase</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h1 style="
                margin: 0 0 12px;
                font-size: 22px;
                font-weight: 700;
                color: #cdd6f4;
                line-height: 1.3;
              ">Verify your email address</h1>
              <p style="
                margin: 0 0 32px;
                font-size: 15px;
                color: #a6adc8;
                line-height: 1.6;
              ">Enter this code on the verification page to confirm your email and complete your registration.</p>
            </td>
          </tr>

          <!-- Code Display -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="
                background: #11111b;
                border: 1px solid #313244;
                border-radius: 16px;
                padding: 24px 20px;
              ">
                <tr>
                  <td align="center" style="padding: 20px 16px;">
                    <div style="
                      font-size: 11px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 2px;
                      color: #89b4fa;
                      margin-bottom: 16px;
                    ">Your verification code</div>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        ${digitBoxes}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Timer notice -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    padding: 12px 16px;
                    background: rgba(249, 226, 175, 0.08);
                    border: 1px solid rgba(249, 226, 175, 0.15);
                    border-radius: 10px;
                  ">
                    <p style="
                      margin: 0;
                      font-size: 13px;
                      color: #f9e2af;
                      line-height: 1.5;
                    ">⏱ This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    border-top: 1px solid #313244;
                    padding-top: 24px;
                  ">
                    <p style="
                      margin: 0 0 4px;
                      font-size: 13px;
                      color: #585b70;
                      line-height: 1.5;
                    ">This email was sent by <strong style="color: #6c7086;">arcbase</strong></p>
                    <p style="
                      margin: 0;
                      font-size: 12px;
                      color: #45475a;
                    ">Open source software for everyone</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
