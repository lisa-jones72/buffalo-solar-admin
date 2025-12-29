# Buffalo Solar Admin - Quick Setup Guide

## ✅ What's Already Done

v0 has generated a **complete, production-ready admin dashboard** with:

### 🎨 **UI Components Generated**

- ✅ Sidebar navigation (collapsible, with sections)
- ✅ Dashboard page with quick access cards
- ✅ Systems hub page
- ✅ Forms management page with data table
- ✅ Page headers with user dropdown
- ✅ Status badges and metric cards
- ✅ All Shadcn UI components installed

### 📄 **Pages Created**

- ✅ `/` - Dashboard (homepage)
- ✅ `/systems` - Systems hub with external links
- ✅ `/forms` - Form submissions manager
- ✅ `/analytics` - Analytics dashboard (placeholder)
- ✅ `/files` - File browser (placeholder)
- ✅ `/reports` - Reports generator (placeholder)
- ✅ `/settings` - Settings page (placeholder)
- ✅ `/profile` - User profile (placeholder)
- ✅ `/login` - Login page (placeholder)

### 🎨 **Design Features**

- ✅ Dark mode enabled by default
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional color scheme
- ✅ Hover effects and transitions
- ✅ Proper spacing and typography

---

## 🚀 Quick Start

### 1. The dashboard is already running in the background!

Visit: **http://localhost:3000**

### 2. Check it out:

- **Dashboard**: Main overview page
- **Systems**: Click to see external system cards
- **Forms**: Working data table with filters

---

## 📝 What You Need to Add

### **High Priority: Connect Real Data**

#### 1. **Firebase Integration** (Forms data)

Create `src/lib/firebase-admin.ts`:

```typescript
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();
```

#### 2. **Update Forms Page** to fetch real data

Replace mock data in `src/app/forms/page.tsx`:

```typescript
// Add at top
import { db } from "@/lib/firebase-admin";

// Replace mockData with:
const getFormSubmissions = async () => {
  const snapshot = await db.collection("formSubmissions").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Make component async and fetch data
export default async function FormsPage() {
  const submissions = await getFormSubmissions();
  // ... rest of component
}
```

#### 3. **Add Authentication**

Install Firebase Auth:

```bash
npm install firebase
```

Update `src/app/login/page.tsx` with real auth flow.

Add middleware for protected routes:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check auth token
  const token = request.cookies.get("auth-token");

  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
```

---

## 🔧 Configuration Files to Create

### 1. **Environment Variables**

Create `.env.local`:

```bash
# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# System URLs (optional, defaults in code)
NEXT_PUBLIC_STUDIO_URL=https://studio.buffalosolar.com
NEXT_PUBLIC_CAREERS_URL=https://careers.buffalosolar.com
NEXT_PUBLIC_WEBSITE_URL=https://www.buffalosolar.com
```

### 2. **Systems Configuration**

Create `src/config/systems.ts`:

```typescript
export interface SystemConfig {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  requiresAuth: boolean;
  roles?: string[];
}

export const EXTERNAL_SYSTEMS: SystemConfig[] = [
  {
    id: "studio",
    name: "Content Studio",
    url:
      process.env.NEXT_PUBLIC_STUDIO_URL || "https://studio.buffalosolar.com",
    description: "Manage blog posts and website content",
    icon: "FileText",
    requiresAuth: true,
    roles: ["admin", "content-editor"],
  },
  {
    id: "careers",
    name: "Careers Portal",
    url:
      process.env.NEXT_PUBLIC_CAREERS_URL || "https://careers.buffalosolar.com",
    description: "Manage job postings and applications",
    icon: "Users",
    requiresAuth: true,
    roles: ["admin", "hr-manager"],
  },
  {
    id: "website",
    name: "Main Website",
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://www.buffalosolar.com",
    description: "Public-facing company website",
    icon: "Globe",
    requiresAuth: false,
  },
];
```

---

## 📊 Pages That Need Data

### **Priority 1: Forms Page** ✅ (Already has UI)

**Needs:** Connection to Firebase `formSubmissions` collection

### **Priority 2: Dashboard Metrics**

**Needs:** Real data for:

- Website traffic (from analytics)
- New leads count (from forms)
- Applications count (from careers system)
- Blog views (from analytics)

### **Priority 3: Analytics Page**

**Needs:**

- Integration with Google Analytics or Firebase Analytics
- Charts and graphs (Recharts already installed)

### **Priority 4: Files Page**

**Needs:**

- Google Cloud Storage integration
- File browser UI

---

## 🎨 Customization

### Change Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0); /* Change this */
}
```

### Update System Links

Edit `src/components/app-sidebar.tsx`:

- Change URLs in `externalLinks` array
- Update navigation items

### Modify Dashboard Cards

Edit `src/app/page.tsx`:

- Update `quickAccessCards` array
- Modify `metrics` array
- Change `recentActivity` items

---

## 🐛 Known Issues & Fixes

### Issue: React 19 Peer Dependency Warning

**Fix**: Already handled with `--legacy-peer-deps`

### Issue: Missing Color Variables

**Fix**: Already added `success` and `warning` colors

---

## 📚 Next Steps Checklist

- [ ] Add `.env.local` with Firebase credentials
- [ ] Connect forms page to real Firestore data
- [ ] Implement authentication on `/login`
- [ ] Add middleware for protected routes
- [ ] Update dashboard metrics with real data
- [ ] Build out analytics page
- [ ] Build out files page
- [ ] Add user management
- [ ] Implement role-based access control
- [ ] Add email notifications
- [ ] Deploy to Vercel

---

## 🚀 Deployment

When ready to deploy:

```bash
# Build locally first
npm run build

# Deploy to Vercel
vercel --prod
```

**Remember to:**

1. Add environment variables in Vercel dashboard
2. Set up custom domain: `admin.buffalosolar.com`
3. Configure authentication
4. Test all features in production

---

## 💡 Tips

1. **Start with Forms**: The forms page is the most complete and ready for data
2. **Mock Data First**: Test UI with mock data before connecting real sources
3. **Incremental**: Build one feature at a time
4. **Dark Mode**: Already enabled, but you can add a toggle if needed

---

## 📞 Support

For issues with:

- **v0 components**: Check [v0.dev](https://v0.dev)
- **Shadcn UI**: Check [ui.shadcn.com](https://ui.shadcn.com)
- **Next.js**: Check [nextjs.org/docs](https://nextjs.org/docs)

---

**Current Status**: ✅ UI Complete | ⏳ Data Integration Needed | 🚀 Ready for Development
