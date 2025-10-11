// Form submission types matching the website's serverFormService
export interface FileUploadResult {
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FormSubmission {
  id?: string; // Firestore document ID
  formType: string;
  submittedAt: Date | { seconds: number; nanoseconds: number }; // Firebase Timestamp
  data: Record<string, unknown>;
  files?: FileUploadResult[];
  metadata?: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
}

// Dashboard metrics
export interface DashboardMetrics {
  websiteTraffic: {
    value: string;
    trend: { value: string; positive: boolean };
  };
  newLeads: {
    value: number;
    trend: { value: string; positive: boolean };
  };
  applications: {
    value: number;
    trend: { value: string; positive: boolean };
  };
  blogViews: {
    value: string;
    trend: { value: string; positive: boolean };
  };
}

// Recent activity
export interface RecentActivityItem {
  id: string;
  title: string;
  time: string;
  href: string;
  formType?: string;
}
