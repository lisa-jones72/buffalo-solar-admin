import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subDays, format } from "date-fns";

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

// Get submission count by day for a collection
async function getSubmissionsByDay(
  collectionName: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  try {
    const q = query(
      collection(db, collectionName),
      where("submittedAt", ">=", Timestamp.fromDate(startDate)),
      where("submittedAt", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    const byDay: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const submittedAt = toDate(data.submittedAt);
      const dateKey = format(submittedAt, "yyyy-MM-dd");
      byDay[dateKey] = (byDay[dateKey] || 0) + 1;
    });

    return byDay;
  } catch (error) {
    console.error(`Error fetching submissions for ${collectionName}:`, error);
    return {};
  }
}

export async function GET() {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);

    // Fetch submissions by day for each form type
    const [consultationsByDay, careersByDay, newslettersByDay] =
      await Promise.all([
        getSubmissionsByDay("consultationForms", startDate, endDate),
        getSubmissionsByDay("careerForms", startDate, endDate),
        getSubmissionsByDay("newsletterForms", startDate, endDate),
      ]);

    // Create array of daily data
    const dailyData: Array<{
      date: string;
      consultations: number;
      careers: number;
      newsletter: number;
      total: number;
    }> = [];

    // Generate data for each day in the range
    for (let i = 30; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dateKey = format(date, "yyyy-MM-dd");

      const consultations = consultationsByDay[dateKey] || 0;
      const careers = careersByDay[dateKey] || 0;
      const newsletter = newslettersByDay[dateKey] || 0;

      dailyData.push({
        date: dateKey,
        consultations,
        careers,
        newsletter,
        total: consultations + careers + newsletter,
      });
    }

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Error fetching conversion data:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversion data" },
      { status: 500 }
    );
  }
}
