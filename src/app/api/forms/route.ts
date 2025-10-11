import { NextResponse } from "next/server";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("type") || "consultation";
    const collectionName = formTypeToCollection[formType];

    if (!collectionName) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    // Fetch all submissions for the given type
    const q = query(
      collection(db, collectionName),
      orderBy("submittedAt", "desc")
    );

    const snapshot = await getDocs(q);

    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      const submittedAt = toDate(data.submittedAt);

      // Extract key fields for table display
      const name =
        data.data?.ownerName || // Consultation forms use ownerName
        data.data?.name ||
        data.data?.fullName ||
        data.data?.firstName ||
        "N/A";
      const email = data.data?.email || "N/A";
      const phone = data.data?.phone || data.data?.phoneNumber || "";

      // For career forms, get the position
      const position = formType === "career" ? data.data?.position : undefined;

      return {
        id: doc.id,
        name,
        email,
        phone,
        position,
        submittedAt: format(submittedAt, "MMM dd, yyyy HH:mm"),
        timestamp: submittedAt.getTime(), // For sorting on client
        formType,
        hasFiles: data.files && data.files.length > 0,
        fileCount: data.files?.length || 0,
      };
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
