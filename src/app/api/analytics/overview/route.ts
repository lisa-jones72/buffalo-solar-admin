import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    type: process.env.GOOGLE_CLOUD_TYPE,
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CLOUD_AUTH_URI,
    token_uri: process.env.GOOGLE_CLOUD_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_CLOUD_UNIVERSE_DOMAIN,
  } as Record<string, string | undefined>,
});

const propertyId = process.env.GA4_PROPERTY_ID;

async function getFormCount(
  collectionName: string,
  days: number
): Promise<number> {
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
    if (!propertyId) {
      return NextResponse.json(
        { error: "GA4 not configured" },
        { status: 400 }
      );
    }

    // Get GA4 overview stats (last 30 days)
    const [ga4Response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    });

    const row = ga4Response.rows?.[0];

    // Get form submission counts (last 30 days)
    const [consultations, careers, newsletter] = await Promise.all([
      getFormCount("consultationForms", 30),
      getFormCount("careerForms", 30),
      getFormCount("newsletterForms", 30),
    ]);

    const overview = {
      sessions: parseInt(row?.metricValues?.[0]?.value || "0"),
      users: parseInt(row?.metricValues?.[1]?.value || "0"),
      pageViews: parseInt(row?.metricValues?.[2]?.value || "0"),
      bounceRate: parseFloat(row?.metricValues?.[3]?.value || "0"),
      avgSessionDuration: parseFloat(row?.metricValues?.[4]?.value || "0"),
      conversions: {
        consultations,
        careers,
        newsletter,
        total: consultations + careers + newsletter,
      },
      conversionRate: 0, // Will calculate below
    };

    // Calculate conversion rate
    if (overview.sessions > 0) {
      overview.conversionRate =
        (overview.conversions.total / overview.sessions) * 100;
    }

    return NextResponse.json(overview);
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
