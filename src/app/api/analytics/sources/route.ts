import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

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

export async function GET() {
  try {
    if (!propertyId) {
      return NextResponse.json(
        { error: "GA4 not configured" },
        { status: 400 }
      );
    }

    // Get traffic by source/medium for the last 30 days
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    const sources =
      response.rows?.map((row) => {
        const source = row.dimensionValues?.[0]?.value || "Unknown";
        const medium = row.dimensionValues?.[1]?.value || "none";
        const sessions = parseInt(row.metricValues?.[0]?.value || "0");
        const users = parseInt(row.metricValues?.[1]?.value || "0");

        // Combine source and medium for better clarity
        const label = medium === "(none)" ? source : `${source} / ${medium}`;

        return {
          source: label,
          sessions,
          users,
        };
      }) || [];

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error fetching traffic sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic sources" },
      { status: 500 }
    );
  }
}
