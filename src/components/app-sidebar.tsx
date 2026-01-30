"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileText,
  BarChart3,
  FolderOpen,
  FileBarChart,
  Headphones,
  Settings,
  User,
  LogOut,
  ExternalLink,
  ChevronLeft,
  Megaphone,
  Users,
  Wrench,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  whenNoAccess: "grayed" | "hidden";
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view", whenNoAccess: "grayed" },
];

const linkedApps = [
  { name: "Studio", href: "https://studio.buffalosolar.com", icon: FileText },
  { name: "Careers", href: "https://careers.buffalosolar.com", icon: User },
  { name: "Website", href: "https://buffalosolar.com", icon: ExternalLink },
];

const adminLinks: NavItem[] = [
  { name: "Forms", href: "/forms", icon: FileText, permission: "forms.view", whenNoAccess: "grayed" },
  { name: "Announcements", href: "/announcements", icon: Megaphone, permission: "announcements.view", whenNoAccess: "grayed" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "analytics.view", whenNoAccess: "grayed" },
  { name: "Files", href: "/files", icon: FolderOpen, permission: "files.view", whenNoAccess: "grayed" },
  { name: "Reports", href: "/reports", icon: FileBarChart, permission: "reports.view", whenNoAccess: "grayed" },
  { name: "Customer Service", href: "/reports/customer-service", icon: Headphones, permission: "reports.customer-service.view", whenNoAccess: "grayed" },
  { name: "Tools", href: "/tools", icon: Wrench, permission: "tools.view", whenNoAccess: "grayed" },
];

const bottomLinks: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings.view", whenNoAccess: "hidden" },
  { name: "Admin Management", href: "/settings/admins", icon: Users, permission: "settings.admins.view", whenNoAccess: "hidden" },
  { name: "Profile", href: "/profile", icon: User, permission: "profile.view", whenNoAccess: "grayed" },
];

// Helper component for nav items with permission checking
function NavItemWithPermission({
  item,
  isActive,
  collapsed,
  hasPermission,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  hasPermission: boolean;
}) {
  // If no permission and should be hidden, don't render
  if (!hasPermission && item.whenNoAccess === "hidden") {
    return null;
  }

  // If no permission and should be grayed out
  if (!hasPermission && item.whenNoAccess === "grayed") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                "text-muted-foreground/50 cursor-not-allowed"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-3 w-3" />
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>You don't have access to this feature</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Has permission - render as normal link
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      title={collapsed ? item.name : undefined}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { hasPermission, loading } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              BS
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Buffalo Solar
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavItemWithPermission
                key={item.name}
                item={item}
                isActive={isActive}
                collapsed={collapsed}
                hasPermission={!loading && hasPermission(item.permission)}
              />
            );
          })}
        </div>

        {/* Linked Apps */}
        {!collapsed && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Linked Apps
            </p>
            {linkedApps.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {/* Admin Section */}
        {!collapsed && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            {adminLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavItemWithPermission
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  collapsed={collapsed}
                  hasPermission={!loading && hasPermission(item.permission)}
                />
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Links */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {bottomLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavItemWithPermission
              key={item.name}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              hasPermission={!loading && hasPermission(item.permission)}
            />
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
