import { NextResponse } from "next/server";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
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
  support: "supportForms",
  career: "careerForms",
  newsletter: "newsletterForms",
  contact: "contactForms",
  calculator: "calculator-detailed-breakdownForms",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("type") || "consultation";
    const collectionName = formTypeToCollection[formType];

    if (!collectionName) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    const submittedAt = toDate(data.submittedAt);

    const submission = {
      id: docSnap.id,
      formType: data.formType,
      submittedAt: submittedAt.toISOString(),
      data: data.data,
      files: data.files || [],
      metadata: data.metadata || {},
    };

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("type") || "consultation";
    const collectionName = formTypeToCollection[formType];

    if (!collectionName) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
