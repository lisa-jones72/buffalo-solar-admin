import { NextResponse } from "next/server";
import { sendLeadShareEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Notification email recipient
const NOTIFICATION_EMAIL = "lisa@buffalosolar.com";

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

    // Format submission data for email
    const submissionData = {
      id: submissionId,
      formType: formType,
      submittedAt: new Date().toISOString(),
      data: formData,
      files: files || [],
      metadata: metadata || {},
    };

    // Send notification email to lisa@buffalosolar.com
    const result = await sendLeadShareEmail(
      NOTIFICATION_EMAIL,
      submissionData,
      "Website Form Submission"
    );

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
