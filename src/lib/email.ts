import nodemailer from "nodemailer";

// Create transporter using Gmail App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // your gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // your gmail app password
  },
});

export async function sendInvitationEmail(
  to: string,
  inviteLink: string,
  invitedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailOptions = {
      from: `Buffalo Solar Admin <${process.env.GMAIL_USER}>`,
      to,
      subject: "You've been invited to Buffalo Solar Admin Center",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #FF6B35;
            }
            .content {
              padding: 40px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #FF6B35;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #FF6B35;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              border-top: 2px solid #f0f0f0;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">☀️ Buffalo Solar</div>
            <p style="color: #666; margin-top: 8px;">Admin Center</p>
          </div>
          
          <div class="content">
            <h2>You've Been Invited!</h2>
            <p>Hi there,</p>
            <p><strong>${invitedBy}</strong> has invited you to join the Buffalo Solar Admin Center.</p>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>Your invitation email:</strong></p>
              <p style="margin: 8px 0 0 0; color: #FF6B35; font-weight: 600;">${to}</p>
            </div>

            <p>As an admin, you'll be able to:</p>
            <ul>
              <li>Manage form submissions and leads</li>
              <li>View analytics and reports</li>
              <li>Manage content and files</li>
              <li>Invite other team members</li>
            </ul>

            <p style="margin-top: 32px;">Click the button below to accept your invitation and create your account:</p>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 32px;">
              Or copy and paste this link into your browser:<br>
              <a href="${inviteLink}" style="color: #FF6B35; word-break: break-all;">${inviteLink}</a>
            </p>

            <p style="font-size: 14px; color: #999; margin-top: 24px;">
              <strong>Note:</strong> This invitation will expire in 24 hours.
            </p>
          </div>

          <div class="footer">
            <p>Buffalo Solar Admin Center</p>
            <p style="font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}

