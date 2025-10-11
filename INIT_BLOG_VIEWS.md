# Initialize Blog View Counts

## 🎯 What This Does

This script initializes the `viewCount` field to `0` for all blog posts in your Sanity CMS that don't have it set yet.

**Safe to run multiple times** - won't overwrite existing view counts!

---

## 🚀 How to Run

### 1. Install tsx (if not already installed)

```bash
npm install -D tsx --legacy-peer-deps
```

### 2. Add Sanity Write Token to `.env.local`

You need a **write token** from Sanity. Get it here:

1. Go to [Sanity Manage](https://www.sanity.io/manage)
2. Select your project
3. Go to **API** tab
4. Under **Tokens**, click **Add API token**
5. Name: "Admin Write Access"
6. Permissions: **Editor** (can write)
7. Copy the token

Add to your admin's `.env.local`:

```bash
SANITY_API_TOKEN=your_write_token_here
```

### 3. Run the Script

```bash
npm run init-blog-views
```

---

## 📊 What You'll See

```
🚀 Starting blog view count initialization...

📚 Found 23 blog posts

✅ Initialized: "Best Practices for Solar Panel Maintenance"
✅ Initialized: "Understanding Solar Incentives in 2025"
⏭️  Skipped (already has 45 views): "Buffalo Solar Expands Commercial Sector"
...

============================================================
✨ Initialization complete!
   - Initialized: 22 posts
   - Skipped: 1 posts
   - Total: 23 posts
============================================================
```

---

## ✅ After Running

1. **Refresh your admin dashboard** - Blog Views card will now show "0"
2. **As people visit blog posts** - Counts will increment automatically
3. **Dashboard will update** - Shows total views across all posts

---

## 🐛 Troubleshooting

**Error: "Unauthorized"**

- Make sure you added `SANITY_API_TOKEN` to `.env.local`
- Token needs **Editor** or **Administrator** permissions

**Error: "Project not found"**

- Check `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`
- Make sure it matches your Sanity project

---

## 📝 Notes

- Script only sets missing `viewCount` fields to `0`
- Won't overwrite posts that already have view counts
- After initialization, your website's tracking will work normally
- Views increment whenever someone visits a blog post

Ready to track those blog views! 📈
