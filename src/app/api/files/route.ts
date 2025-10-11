import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
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

// Form type collections to check for files
const formCollections = [
  { name: "consultationForms", type: "Consultation" },
  { name: "careerForms", type: "Career" },
  { name: "contactForms", type: "Contact" },
];

export async function GET() {
  try {
    const allFiles: Array<{
      id: string;
      fileName: string;
      originalName: string;
      url: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
      formType: string;
      submissionId: string;
      submitterName?: string;
      submitterEmail?: string;
    }> = [];

    // Fetch files from all form collections
    for (const { name: collectionName, type: formType } of formCollections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));

        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          // Check if this submission has files
          if (
            data.files &&
            Array.isArray(data.files) &&
            data.files.length > 0
          ) {
            const submitterName =
              data.data?.ownerName ||
              data.data?.name ||
              data.data?.fullName ||
              "Unknown";
            const submitterEmail = data.data?.email || "";

            data.files.forEach((file: any) => {
              allFiles.push({
                id: `${doc.id}_${file.fileName}`,
                fileName: file.fileName,
                originalName: file.originalName,
                url: file.url,
                size: file.size,
                mimeType: file.mimeType,
                uploadedAt: format(
                  toDate(data.submittedAt),
                  "MMM dd, yyyy HH:mm"
                ),
                formType,
                submissionId: doc.id,
                submitterName,
                submitterEmail,
              });
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching files from ${collectionName}:`, error);
      }
    }

    // Sort by upload date (newest first)
    allFiles.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json(allFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
