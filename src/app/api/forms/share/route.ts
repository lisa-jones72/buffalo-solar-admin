import { NextResponse } from "next/server";
import { sendLeadShareEmail } from "@/lib/email";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

// Helper function to convert Firestore timestamp to Date
function toDate(
  timestamp: Date | { seconds: number; nanoseconds: number }
): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
}

// Map form types to their collection names
const formTypeToCollection: Record<string, string> = {
  consultation: "consultationForms",
  career: "careerForms",
  newsletter: "newsletterForms",
  contact: "contactForms",
  calculator: "calculator-detailed-breakdownForms",
};

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
    const { submissionId, formType, recipientEmail, sharedBy } = body;

    // Validate required fields
    if (!submissionId || !formType || !recipientEmail || !sharedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const collectionName = formTypeToCollection[formType];
    if (!collectionName) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    // Fetch the submission data
    const docRef = doc(db, collectionName, submissionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    const submittedAt = toDate(data.submittedAt);

    const submissionData = {
      id: docSnap.id,
      formType: formType, // Use the formType from the request, not from the document
      submittedAt: submittedAt.toISOString(),
      data: data.data,
      files: data.files || [],
      metadata: data.metadata || {},
    };

    // Send the email
    const result = await sendLeadShareEmail(
      recipientEmail,
      submissionData,
      sharedBy
    );

    if (!result.success) {
      console.error("Email send failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    // Use appropriate terminology based on form type
    const itemType = formType === "career" ? "Application" : "Lead";

    return NextResponse.json({
      success: true,
      message: `${itemType} shared successfully`,
    });
  } catch (error) {
    const itemType = body?.formType === "career" ? "application" : "lead";
    console.error(`Error sharing ${itemType}:`, error);
    return NextResponse.json(
      { error: `Failed to share ${itemType}` },
      { status: 500 }
    );
  }
}
