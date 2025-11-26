# Dashboard Setup Guide

## 📋 Overview

The Buffalo Solar Admin Dashboard now connects to your website's Firebase database to display real-time metrics and form submissions.

## 🔧 Setup Instructions

### 1. Install Required Packages

First, install the Firebase dependencies:

```bash
npm install firebase date-fns
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the admin project and copy the Firebase configuration from your website:

```bash
# From buffalo-solar-website/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Use the **same Firebase project** as your website so the admin can read the form submissions.

### 3. Restart the Dev Server

After adding the environment variables:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## 📊 What's Now Functional

### Dashboard Metrics (Real-Time)

- **New Leads**: Counts consultation forms + newsletter signups from the last 7 days
- **Applications**: Counts career applications from the last 7 days
- **Trends**: Shows percentage change compared to previous week
- **Website Traffic & Blog Views**: Currently showing placeholder values (ready for Google Analytics integration)

### Recent Activity Feed

Displays the 10 most recent form submissions across:

- ✅ Consultation requests
- ✅ Career applications
- ✅ Newsletter signups
- ✅ Contact forms
- ✅ Calculator detailed requests

## 📁 Data Structure

The dashboard reads from these Firestore collections:

### `consultationForms`

```typescript
{
  formType: "consultation",
  submittedAt: Timestamp,
  data: {
    name: string,
    email: string,
    phone: string,
    // ... other form fields
  },
  files?: FileUploadResult[],
  metadata?: { userAgent, ip, referrer }
}
```

### `careerForms`

```typescript
{
  formType: "career",
  submittedAt: Timestamp,
  data: {
    name: string,
    email: string,
    position: string,
    // ... other form fields
  },
  files?: FileUploadResult[],
  metadata?: { userAgent, ip, referrer }
}
```

### `newsletterForms`

```typescript
{
  formType: "newsletter",
  submittedAt: Timestamp,
  data: {
    email: string,
  },
  metadata?: { userAgent, ip, referrer }
}
```

## 🔍 How It Works

### API Routes

**`/api/dashboard/metrics`**

- Fetches form submission counts from the last 7 days and previous 7 days
- Calculates week-over-week trends
- Returns metrics for dashboard cards

**`/api/dashboard/activity`**

- Fetches the 5 most recent submissions from each form collection
- Combines and sorts by time
- Returns formatted activity items with relative timestamps

### Client-Side Loading

- Dashboard page uses React hooks to fetch data on mount
- Shows skeleton loaders while data is being fetched
- Gracefully handles errors and displays appropriate messages

## 🚀 Next Steps

### Immediate

1. Copy Firebase credentials from website to admin `.env.local`
2. Install Firebase packages: `npm install firebase date-fns`
3. Restart dev server

### Future Enhancements

- [ ] Google Analytics integration for real traffic and blog view metrics
- [ ] Real-time updates using Firebase listeners
- [ ] Date range filters for metrics
- [ ] Export functionality for form submissions
- [ ] Email notifications for new submissions

## 🧪 Testing

To test the dashboard with real data:

1. Submit a form on the website (consultation, career, or newsletter)
2. Wait a few seconds for Firestore to update
3. Refresh the admin dashboard
4. You should see:
   - Updated lead/application count in metrics
   - New submission in recent activity feed

## 📝 Notes

- The dashboard has **read-only** access to Firestore
- All form submissions from the website automatically appear in the admin
- Metrics update in real-time (no manual sync required)
- The same Firebase project is used for both website and admin for consistency

## 🐛 Troubleshooting

**Dashboard shows "No recent activity":**

- Verify Firebase credentials are correct
- Check that form submissions exist in Firestore
- Look at browser console for any errors

**Metrics show 0:**

- Ensure forms have been submitted in the last 7 days
- Verify Firestore collections exist (`consultationForms`, `careerForms`, etc.)
- Check that timestamps are being stored correctly

**Build errors about Firebase:**

- Run `npm install firebase date-fns`
- Restart the dev server completely
- Clear `.next` folder: `rm -rf .next`
