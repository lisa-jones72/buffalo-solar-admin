import nodemailer from "nodemailer";

// Lazy transporter initialization - only create when needed at runtime
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  // Return existing transporter if already created
  if (transporter) {
    return transporter;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Email configuration missing: GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables"
    );
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

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
              background-color: #000000;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #FF6B35;
            }
            .logo-img {
              max-width: 200px;
              height: auto;
              margin: 0 auto 16px;
              display: block;
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
            <img src="https://admin.buffalosolar.com/logo.png" alt="Buffalo Solar" class="logo-img" />
            <p style="color: #ffffff; margin-top: 8px;">Admin Center</p>
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

    const emailTransporter = getTransporter();
    await emailTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendLeadShareEmail(
  to: string,
  submissionData: {
    id: string;
    formType: string;
    submittedAt: string;
    data: Record<string, unknown>;
    files?: Array<{
      originalName: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
    metadata?: {
      userAgent?: string;
      ip?: string;
      referrer?: string;
    };
  },
  sharedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure we have email credentials
    const emailUser = process.env.GMAIL_USER;
    const emailPass = process.env.GMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error("Email configuration error: Missing GMAIL_USER or GMAIL_APP_PASSWORD");
      return {
        success: false,
        error: "Email service is not configured. Please check environment variables.",
      };
    }
    // Format submission data for display
    const formatValue = (value: unknown): string => {
      if (value === null || value === undefined) return "N/A";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    };

    const formatDate = (dateString: string): string => {
      try {
        return new Date(dateString).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const dataRows = Object.entries(submissionData.data)
      .filter(([key]) => !key.toLowerCase().includes("recaptcha"))
      .map(
        ([key, value]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333; width: 150px;">
            ${key.replace(/([A-Z])/g, " $1").trim()}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">
            ${formatValue(value)}
          </td>
        </tr>
      `
      )
      .join("");

    const filesSection =
      submissionData.files && submissionData.files.length > 0
        ? `
        <div style="margin-top: 24px;">
          <h3 style="color: #333; margin-bottom: 12px;">Uploaded Files (${submissionData.files.length})</h3>
          <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
            ${submissionData.files
              .map(
                (file) => `
              <tr>
                <td style="padding: 12px;">
                  <strong>${file.originalName}</strong><br>
                  <span style="color: #666; font-size: 12px;">
                    ${formatFileSize(file.size)} • ${file.mimeType}
                  </span>
                </td>
              </tr>
            `
              )
              .join("")}
          </table>
        </div>
      `
        : "";

    const mailOptions = {
      from: `Buffalo Solar Admin <${emailUser}>`,
      to,
      subject: `New Lead Shared: ${submissionData.formType} Form Submission`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 700px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              border-bottom: 2px solid #f0f0f0;
              background-color: #000000;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #FF6B35;
            }
            .logo-img {
              max-width: 200px;
              height: auto;
              margin: 0 auto 16px;
              display: block;
            }
            .content {
              padding: 40px 0;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #FF6B35;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
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
            <img src="https://admin.buffalosolar.com/logo.png" alt="Buffalo Solar" class="logo-img" />
          </div>
          
          <div class="content">
            <h2>New Lead Shared with You</h2>
            <p>Hi there,</p>
            <p><strong>${sharedBy}</strong> has shared a new lead with you from the Buffalo Solar Admin Center.</p>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>Form Type:</strong> ${submissionData.formType}</p>
              <p style="margin: 8px 0 0 0;"><strong>Submitted:</strong> ${formatDate(submissionData.submittedAt)}</p>
              <p style="margin: 8px 0 0 0;"><strong>Submission ID:</strong> ${submissionData.id}</p>
            </div>

            <h3 style="color: #333; margin-top: 32px; margin-bottom: 16px;">Lead Information</h3>
            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              ${dataRows}
            </table>

            ${filesSection}

            <p style="margin-top: 32px; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <strong>Note:</strong> This lead was shared with you from the Buffalo Solar Admin Dashboard. 
              You can view and manage all leads by logging into the admin center.
            </p>
          </div>

          <div class="footer">
            <p>Buffalo Solar Admin Center</p>
            <p style="font-size: 12px;">
              This is an automated email from the Buffalo Solar admin system.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const emailTransporter = getTransporter();
    await emailTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending lead share email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    const emailTransporter = getTransporter();
    await emailTransporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}

