import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subDays } from "date-fns";
import { getWebsiteTraffic } from "@/lib/ga4";
import { getBlogViewsWithTrend } from "@/lib/sanity";

export const dynamic = "force-dynamic";

interface MetricData {
  total: number;
  previousPeriod: number;
  trend: {
    value: string;
    positive: boolean;
  };
}

// Calculate trend percentage
function calculateTrend(
  current: number,
  previous: number
): { value: string; positive: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? "100%" : "0%", positive: current > 0 };
  }

  const percentChange = ((current - previous) / previous) * 100;
  const absChange = Math.abs(Math.round(percentChange));

  return {
    value: `${absChange}% from last week`,
    positive: percentChange >= 0,
  };
}

// Get count of documents in a collection within a date range
async function getCountInRange(
  collectionName: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const q = query(
      collection(db, collectionName),
      where("submittedAt", ">=", Timestamp.fromDate(startDate)),
      where("submittedAt", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error(`Error fetching count for ${collectionName}:`, error);
    return 0;
  }
}

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);

    // Fetch consultation forms (leads)
    const currentLeads = await getCountInRange(
      "consultationForms",
      weekAgo,
      now
    );
    const previousLeads = await getCountInRange(
      "consultationForms",
      twoWeeksAgo,
      weekAgo
    );

    // Fetch career applications
    const currentApps = await getCountInRange("careerForms", weekAgo, now);
    const previousApps = await getCountInRange(
      "careerForms",
      twoWeeksAgo,
      weekAgo
    );

    // Fetch newsletter signups
    const currentNewsletter = await getCountInRange(
      "newsletterForms",
      weekAgo,
      now
    );
    const previousNewsletter = await getCountInRange(
      "newsletterForms",
      twoWeeksAgo,
      weekAgo
    );

    // Fetch website traffic from GA4
    const websiteTraffic = await getWebsiteTraffic();

    // Fetch blog views from Sanity
    const blogViews = await getBlogViewsWithTrend();

    const metrics = {
      websiteTraffic: websiteTraffic || {
        value: "0",
        trend: { value: "GA4 not configured", positive: false },
      },
      newLeads: {
        value: currentLeads + currentNewsletter, // Include newsletter signups as leads
        trend: calculateTrend(
          currentLeads + currentNewsletter,
          previousLeads + previousNewsletter
        ),
      },
      applications: {
        value: currentApps,
        trend: calculateTrend(currentApps, previousApps),
      },
      blogViews: blogViews || {
        value: "0",
        trend: { value: "Sanity not configured", positive: false },
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);

    // Return default metrics on error
    return NextResponse.json({
      websiteTraffic: {
        value: "0",
        trend: { value: "0%", positive: false },
      },
      newLeads: {
        value: 0,
        trend: { value: "0%", positive: false },
      },
      applications: {
        value: 0,
        trend: { value: "0%", positive: false },
      },
      blogViews: {
        value: "0",
        trend: { value: "0%", positive: false },
      },
    });
  }
}
