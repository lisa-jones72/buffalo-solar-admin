import { createClient } from "next-sanity";

// Use the same Sanity config as your website
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true, // Can use CDN for read-only data
});

/**
 * Get total blog views from Sanity
 */
export async function getTotalBlogViews() {
  try {
    console.log("Fetching blog views from Sanity...");
    console.log("Sanity Config:", {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    });

    // First, let's see what posts exist
    const posts = await client.fetch<any[]>(
      `*[_type == "post"] | order(_createdAt desc) [0...5] {
        title,
        viewCount,
        _createdAt,
        draft,
        archived
      }`
    );

    console.log("Sample Sanity Posts:", posts);

    // Get all posts and manually sum viewCount (GROQ doesn't have sum())
    const allPosts = await client.fetch<Array<{ viewCount: number | null }>>(
      `*[_type == "post" && !draft && !archived] {
        viewCount
      }`
    );

    // Calculate total views, treating null as 0
    const totalViews = allPosts.reduce((sum, post) => {
      return sum + (post.viewCount || 0);
    }, 0);

    console.log("Sanity Total Views:", totalViews);
    console.log("Total posts:", allPosts.length);

    return totalViews;
  } catch (error) {
    console.error("Error fetching blog views from Sanity:", error);
    return 0;
  }
}

/**
 * Get blog views for the last 7 days vs previous 7 days
 * Note: This requires tracking view dates in Sanity, which you may not have yet.
 * For now, we'll just return the total and a placeholder trend.
 */
export async function getBlogViewsWithTrend() {
  try {
    const totalViews = await getTotalBlogViews();

    // Format as K (thousands)
    const formatViews = (num: number): string => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    return {
      value: formatViews(totalViews),
      trend: {
        value:
          totalViews === 0 ? "Ready to track views" : "Total all-time views",
        positive: true,
      },
    };
  } catch (error) {
    console.error("Error fetching blog views:", error);
    return {
      value: "0",
      trend: { value: "Error fetching views", positive: false },
    };
  }
}
