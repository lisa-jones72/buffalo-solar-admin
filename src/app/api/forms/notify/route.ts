import { NextResponse } from "next/server";
import { sendLeadShareEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Notification recipients by form type.
// Service requests submitted from the website use formType: "support".
const CONSULTATION_NOTIFICATION_EMAILS = [
  "ljones57@u.rochester.edu",
  "lisa@buffalosolar.com",
  "alyssa@buffalosolar.com",
  "michael@buffalosolar.com",
];

// TODO: Update these recipients to your customer service/service request inboxes.
const SUPPORT_NOTIFICATION_EMAILS = ["lisa@buffalosolar.com"];

function isSupportRequest(formType: string, formData: unknown): boolean {
  const normalized = String(formType || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (
    normalized === "support" ||
    normalized === "service" ||
    normalized === "service-request" ||
    normalized === "customer-service"
  ) {
    return true;
  }

  // Fallback: many support/service forms include an issue description field.
  if (formData && typeof formData === "object") {
    return Object.prototype.hasOwnProperty.call(formData, "issueDescription");
  }

  return false;
}

function getNotificationEmails(formType: string, formData: unknown): string[] {
  if (isSupportRequest(formType, formData)) return SUPPORT_NOTIFICATION_EMAILS;
  return CONSULTATION_NOTIFICATION_EMAILS;
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, submissionId, formType = "consultation", files, metadata } = body;

    // Validate required fields
    if (!formData || !submissionId) {
      return NextResponse.json(
        { error: "Missing required fields: formData and submissionId are required" },
        { status: 400 }
      );
    }

    const recipients = getNotificationEmails(formType, formData);
    const supportRequest = isSupportRequest(formType, formData);

    // Format submission data for email
    // Normalize formType to "support" if detected as a support request
    const submissionData = {
      id: submissionId,
      formType: supportRequest ? "support" : formType,
      submittedAt: new Date().toISOString(),
      data: formData,
      files: files || [],
      metadata: metadata || {},
    };
    const emailTitle =
      supportRequest ? "Customer Service / Service Request" : "Website Form Submission";

    // Build a nice subject line, especially for support requests
    const formDataObj =
      formData && typeof formData === "object" ? (formData as Record<string, unknown>) : {};
    
    // Build full name from split fields if available
    const ownerFullName = [formDataObj["ownerFirstName"], formDataObj["ownerLastName"]]
      .filter(Boolean)
      .join(" ");
    
    const nameForSubject =
      (formDataObj["businessName"] as string) ||
      ownerFullName ||
      (formDataObj["ownerName"] as string) ||
      (formDataObj["email"] as string) ||
      "Unknown";

    const subjectOverride = supportRequest
      ? `New Service Request - ${nameForSubject}`
      : undefined;

    // Debug: helps confirm which server/version is handling requests
    console.log("Form notify recipients:", { formType, recipients, supportRequest });

    // Send notification email to configured recipients
    const result = await sendLeadShareEmail(recipients, submissionData, emailTitle, {
      subjectOverride,
    });

    if (!result.success) {
      console.error("Email notification failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send notification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification email sent successfully",
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error processing form notification:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
