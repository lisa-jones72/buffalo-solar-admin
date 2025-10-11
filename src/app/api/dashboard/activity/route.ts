import { NextResponse } from "next/server";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import type { FormSubmission, RecentActivityItem } from "@/lib/types";

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

// Helper to format form submission title
function formatActivityTitle(
  formType: string,
  data: Record<string, unknown>
): string {
  const name = (data.name || data.fullName || data.firstName) as
    | string
    | undefined;
  const email = data.email as string | undefined;

  switch (formType) {
    case "consultation":
      return `New consultation request from ${name || email || "Unknown"}`;
    case "career":
      return `New job application for ${data.position || "a position"} from ${
        name || email || "Unknown"
      }`;
    case "newsletter":
      return `Newsletter signup from ${email || "Unknown"}`;
    case "contact":
      return `Contact form submission from ${name || email || "Unknown"}`;
    case "calculator-detailed-breakdown":
      return `Detailed solar calculator request from ${
        name || email || "Unknown"
      }`;
    default:
      return `New ${formType} form submission`;
  }
}

// Fetch submissions from a specific collection
async function fetchCollectionActivity(
  collectionName: string,
  formType: string
): Promise<RecentActivityItem[]> {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy("submittedAt", "desc"),
      limit(5) // Get 5 from each collection
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as FormSubmission;
      const submittedAt = toDate(data.submittedAt);

      return {
        id: doc.id,
        title: formatActivityTitle(formType, data.data),
        time: formatDistanceToNow(submittedAt, { addSuffix: true }),
        href: "/forms",
        formType,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch recent submissions from all form collections
    const [consultationActivity, careerActivity, newsletterActivity] =
      await Promise.all([
        fetchCollectionActivity("consultationForms", "consultation"),
        fetchCollectionActivity("careerForms", "career"),
        fetchCollectionActivity("newsletterForms", "newsletter"),
      ]);

    // Combine all activities
    const allActivity = [
      ...consultationActivity,
      ...careerActivity,
      ...newsletterActivity,
    ];

    // Sort by time (most recent first) and limit to 10
    // Note: We're sorting by the actual timestamp string which isn't perfect
    // In a production app, you'd want to sort by actual dates
    const sortedActivity = allActivity
      .sort((a, b) => {
        // Simple sort - "minutes ago" < "hours ago" < "days ago" < "Yesterday"
        const timeToMinutes = (time: string) => {
          if (time.includes("second")) return 0;
          if (time.includes("minute")) return parseInt(time) || 1;
          if (time.includes("hour")) return (parseInt(time) || 1) * 60;
          if (time.includes("day")) return (parseInt(time) || 1) * 1440;
          if (time.includes("Yesterday")) return 1440;
          return 9999;
        };
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      })
      .slice(0, 10);

    return NextResponse.json(sortedActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json([]);
  }
}
