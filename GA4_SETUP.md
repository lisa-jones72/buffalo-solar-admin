# Google Analytics 4 Setup for Admin Dashboard

## 🔧 Quick Setup Steps

### 1. Enable Google Analytics Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (the one with your service account)
3. Go to **APIs & Services** > **Library**
4. Search for "Google Analytics Data API"
5. Click **Enable**

### 2. Grant Analytics Access to Service Account

1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** (gear icon, bottom left)
3. In the **Account** column, click **Account Access Management**
4. Click **Add users** (+ icon)
5. Enter your service account email (looks like: `xxxxx@xxxxx.iam.gserviceaccount.com`)
6. Select **Viewer** role
7. Click **Add**

### 3. Get Your Property ID

1. In Google Analytics, go to **Admin** > **Property Settings**
2. Copy your **Property ID** (format: `123456789`)

### 4. Add to Admin `.env.local`

Add these to your admin's `.env.local` file:

```bash
# Google Analytics 4
GA4_PROPERTY_ID=your_property_id_here

# Google Service Account (same as website)
GOOGLE_CLOUD_TYPE=service_account
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account@xxx.iam.gserviceaccount.com
GOOGLE_CLOUD_CLIENT_ID=your_client_id
GOOGLE_CLOUD_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_CLOUD_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLOUD_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40xxx.iam.gserviceaccount.com
GOOGLE_CLOUD_UNIVERSE_DOMAIN=googleapis.com
```

**Note:** If you have these already in your website's `.env.local`, just copy them over!

### 5. Install Package & Restart

```bash
npm install @google-analytics/data --legacy-peer-deps
npm run dev
```

---

## 📊 What You'll Get

### Website Traffic Card

- **Real visitor counts** from GA4
- **Week-over-week trends**
- **Accurate session data**

### Blog Views Card

- **Pulled from Sanity CMS** (more accurate!)
- **Total view counts** from your blog posts
- **Direct from your content database**

---

## 🐛 Troubleshooting

**"Permission denied" error:**

- Make sure you added the service account email to GA4 with Viewer access
- Wait 5-10 minutes for permissions to propagate

**"Property not found" error:**

- Double-check your Property ID
- Make sure it's the numeric ID, not the measurement ID (G-XXXXXXXXXX)

**"API not enabled" error:**

- Enable the "Google Analytics Data API" in Google Cloud Console
- Wait a few minutes for it to activate

---

Ready to continue once you've enabled the API! 🚀
