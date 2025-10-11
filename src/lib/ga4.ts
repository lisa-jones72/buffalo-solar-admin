import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Initialize GA4 client
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

/**
 * Get website traffic for the last 7 days vs previous 7 days
 */
export async function getWebsiteTraffic() {
  try {
    if (!propertyId) {
      console.warn("GA4_PROPERTY_ID not configured");
      return null;
    }

    console.log("Fetching GA4 data for property:", propertyId);

    // Current week (last 7 days)
    const [currentResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "7daysAgo",
          endDate: "today",
        },
      ],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
    });

    console.log("GA4 Current Response:", {
      rowCount: currentResponse.rows?.length,
      sessions: currentResponse.rows?.[0]?.metricValues?.[0]?.value,
      users: currentResponse.rows?.[0]?.metricValues?.[1]?.value,
    });

    // Previous week (8-14 days ago)
    const [previousResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "14daysAgo",
          endDate: "8daysAgo",
        },
      ],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
    });

    const currentSessions = parseInt(
      currentResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
    );
    const previousSessions = parseInt(
      previousResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
    );

    console.log("GA4 Sessions:", {
      current: currentSessions,
      previous: previousSessions,
    });

    // Calculate trend
    const percentChange =
      previousSessions > 0
        ? ((currentSessions - previousSessions) / previousSessions) * 100
        : 0;

    // Format sessions as K (thousands)
    const formatSessions = (num: number): string => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    return {
      value: formatSessions(currentSessions),
      trend: {
        value: `${Math.abs(Math.round(percentChange))}% from last week`,
        positive: percentChange >= 0,
      },
    };
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    return null;
  }
}

/**
 * Get page views for a specific path (useful for blog analytics)
 */
export async function getPageViews(pagePath: string) {
  try {
    if (!propertyId) {
      console.warn("GA4_PROPERTY_ID not configured");
      return 0;
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "CONTAINS",
            value: pagePath,
          },
        },
      },
    });

    return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0");
  } catch (error) {
    console.error("Error fetching page views:", error);
    return 0;
  }
}
