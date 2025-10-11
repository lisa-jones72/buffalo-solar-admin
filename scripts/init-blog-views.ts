#!/usr/bin/env ts-node
/**
 * Initialize blog post view counts in Sanity
 *
 * This script sets viewCount to 0 for all blog posts that don't have it set yet.
 * Safe to run multiple times - won't overwrite existing counts.
 */

import { createClient } from "next-sanity";

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Need write token
});

async function initializeViewCounts() {
  console.log("🚀 Starting blog view count initialization...\n");

  try {
    // Fetch all blog posts
    const posts = await client.fetch<
      Array<{ _id: string; title: string; viewCount: number | null }>
    >(`*[_type == "post"] {
      _id,
      title,
      viewCount
    }`);

    console.log(`📚 Found ${posts.length} blog posts\n`);

    let initialized = 0;
    let skipped = 0;

    // Initialize viewCount for each post
    for (const post of posts) {
      if (post.viewCount === null || post.viewCount === undefined) {
        try {
          await client.patch(post._id).set({ viewCount: 0 }).commit();

          console.log(`✅ Initialized: "${post.title}"`);
          initialized++;
        } catch (error) {
          console.error(`❌ Failed to initialize: "${post.title}"`, error);
        }
      } else {
        console.log(
          `⏭️  Skipped (already has ${post.viewCount} views): "${post.title}"`
        );
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✨ Initialization complete!");
    console.log(`   - Initialized: ${initialized} posts`);
    console.log(`   - Skipped: ${skipped} posts`);
    console.log(`   - Total: ${posts.length} posts`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error initializing view counts:", error);
    process.exit(1);
  }
}

// Run the script
initializeViewCounts();
