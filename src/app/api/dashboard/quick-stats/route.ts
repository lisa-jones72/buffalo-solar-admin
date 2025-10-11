import { NextResponse } from "next/server";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subDays } from "date-fns";
import { getTotalBlogViews } from "@/lib/sanity";

export const dynamic = "force-dynamic";

async function getFormCount(collectionName: string, days: number = 7): Promise<number> {
  try {
    const startDate = subDays(new Date(), days);
    const q = query(
      collection(db, collectionName),
      where("submittedAt", ">=", Timestamp.fromDate(startDate))
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error(`Error counting ${collectionName}:`, error);
    return 0;
  }
}

export async function GET() {
  try {
    // Fetch counts for each section (last 7 days)
    const [blogViews, careerApps, totalForms] = await Promise.all([
      getTotalBlogViews(),
      getFormCount("careerForms", 7),
      Promise.all([
        getFormCount("consultationForms", 7),
        getFormCount("newsletterForms", 7),
        getFormCount("careerForms", 7),
      ]).then(([consultations, newsletter, careers]) => 
        consultations + newsletter + careers
      ),
    ]);

    return NextResponse.json({
      studio: {
        totalViews: blogViews,
        recentPosts: 0, // Could add count of posts published in last 7 days
      },
      careers: {
        newApplications: careerApps,
        activeListings: 0, // Could add count of active job listings
      },
      forms: {
        totalSubmissions: totalForms,
        thisWeek: totalForms,
      },
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return NextResponse.json({
      studio: { totalViews: 0, recentPosts: 0 },
      careers: { newApplications: 0, activeListings: 0 },
      forms: { totalSubmissions: 0, thisWeek: 0 },
    });
  }
}

