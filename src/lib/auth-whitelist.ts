// Whitelist of allowed admin emails
// Only these emails can create accounts and access the admin panel
export const ALLOWED_ADMIN_EMAILS: string[] = [
  // Add your allowed emails here
  "lisa@buffalosolar.com",
  // Example: "admin@buffalosolar.com",
  // Example: "lisa@buffalosolar.com",
];

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
}

