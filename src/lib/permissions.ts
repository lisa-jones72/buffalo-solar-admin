import { ALLOWED_ADMIN_EMAILS } from "./auth-whitelist";

// Role type - ordered by hierarchy (highest to lowest)
export type Role = "super_admin" | "admin" | "operations";

// Role hierarchy levels (higher number = more access)
export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 3,
  admin: 2,
  operations: 1,
};

// All available permissions
export const PERMISSIONS = {
  // Dashboard
  "dashboard.view": "View dashboard",

  // Forms
  "forms.view": "View form submissions",

  // Analytics
  "analytics.view": "View analytics",

  // Announcements
  "announcements.view": "View announcements",

  // Files
  "files.view": "View files",

  // Reports
  "reports.view": "View reports",
  "reports.customer-service.view": "View customer service reports",

  // Tools
  "tools.view": "View tools",

  // Settings
  "settings.view": "View settings",
  "settings.admins.view": "View admin management",
  "settings.admins.invite": "Invite new admins",
  "settings.admins.delete": "Delete admins",

  // Profile (everyone has this)
  "profile.view": "View profile",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "dashboard.view",
    "forms.view",
    "analytics.view",
    "announcements.view",
    "files.view",
    "reports.view",
    "reports.customer-service.view",
    "tools.view",
    "settings.view",
    "settings.admins.view",
    "settings.admins.invite",
    "settings.admins.delete",
    "profile.view",
  ],
  admin: [
    "dashboard.view",
    "forms.view",
    "analytics.view",
    "announcements.view",
    "files.view",
    "reports.view",
    "reports.customer-service.view",
    "tools.view",
    "settings.view",
    "settings.admins.view",
    "settings.admins.invite",
    "settings.admins.delete",
    "profile.view",
  ],
  operations: [
    "reports.customer-service.view",
    "profile.view",
  ],
};

// Map routes to required permissions
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/": "dashboard.view",
  "/forms": "forms.view",
  "/analytics": "analytics.view",
  "/announcements": "announcements.view",
  "/files": "files.view",
  "/reports": "reports.view",
  "/reports/customer-service": "reports.customer-service.view",
  "/tools": "tools.view",
  "/settings": "settings.view",
  "/settings/admins": "settings.admins.view",
  "/profile": "profile.view",
};

// Default landing page per role
export const DEFAULT_LANDING_PAGE: Record<Role, string> = {
  super_admin: "/",
  admin: "/",
  operations: "/reports/customer-service",
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Get all permissions for a role
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// Check if role A can manage role B (for invitation purposes)
// You can only invite roles at your level or below
export function canManageRole(inviterRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[inviterRole] >= ROLE_HIERARCHY[targetRole];
}

// Get roles that a given role can invite
export function getInvitableRoles(role: Role): Role[] {
  const inviterLevel = ROLE_HIERARCHY[role];
  return (Object.keys(ROLE_HIERARCHY) as Role[]).filter(
    (r) => ROLE_HIERARCHY[r] <= inviterLevel
  );
}

// Get the effective role for a user
// Super admin is determined by whitelist, otherwise use database role
export function getEffectiveRole(
  email: string | null | undefined,
  databaseRole: Role | undefined
): Role {
  if (!email) return "operations"; // Fallback to lowest access

  // Check whitelist first - whitelist users are always super_admin
  if (ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
    return "super_admin";
  }

  // Otherwise use the database role, defaulting to admin for backwards compatibility
  return databaseRole ?? "admin";
}

// Check if a user can access a specific route
export function canAccessRoute(role: Role, pathname: string): boolean {
  const permission = ROUTE_PERMISSIONS[pathname];
  if (!permission) return true; // No permission required for unlisted routes
  return hasPermission(role, permission);
}

// Get human-readable role name
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "operations":
      return "Operations";
    default:
      return role;
  }
}

// Sidebar item visibility modes
export type SidebarVisibility = "visible" | "grayed" | "hidden";

// Sidebar navigation items with their permissions and visibility rules
export interface SidebarItem {
  name: string;
  href: string;
  permission: Permission;
  // When user lacks permission: "grayed" shows disabled, "hidden" removes entirely
  whenNoAccess: "grayed" | "hidden";
}

// Define sidebar items with their access rules
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/", permission: "dashboard.view", whenNoAccess: "grayed" },
  { name: "Forms", href: "/forms", permission: "forms.view", whenNoAccess: "grayed" },
  { name: "Announcements", href: "/announcements", permission: "announcements.view", whenNoAccess: "grayed" },
  { name: "Analytics", href: "/analytics", permission: "analytics.view", whenNoAccess: "grayed" },
  { name: "Files", href: "/files", permission: "files.view", whenNoAccess: "grayed" },
  { name: "Reports", href: "/reports", permission: "reports.view", whenNoAccess: "grayed" },
  { name: "Customer Service", href: "/reports/customer-service", permission: "reports.customer-service.view", whenNoAccess: "grayed" },
  { name: "Tools", href: "/tools", permission: "tools.view", whenNoAccess: "grayed" },
];

export const SIDEBAR_BOTTOM_ITEMS: SidebarItem[] = [
  { name: "Settings", href: "/settings", permission: "settings.view", whenNoAccess: "hidden" },
  { name: "Admin Management", href: "/settings/admins", permission: "settings.admins.view", whenNoAccess: "hidden" },
  { name: "Profile", href: "/profile", permission: "profile.view", whenNoAccess: "grayed" },
];

// Get visibility for a sidebar item based on role
export function getSidebarItemVisibility(
  role: Role,
  item: SidebarItem
): SidebarVisibility {
  if (hasPermission(role, item.permission)) {
    return "visible";
  }
  return item.whenNoAccess;
}
