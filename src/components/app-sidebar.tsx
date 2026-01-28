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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [{ name: "Dashboard", href: "/", icon: LayoutDashboard }];

const linkedApps = [
  { name: "Studio", href: "https://studio.buffalosolar.com", icon: FileText },
  { name: "Careers", href: "https://careers.buffalosolar.com", icon: User },
  { name: "Website", href: "https://buffalosolar.com", icon: ExternalLink },
];

const adminLinks = [
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Files", href: "/files", icon: FolderOpen },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Customer Service", href: "/reports/customer-service", icon: Headphones },
];

const bottomLinks = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
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
              <Link
                key={item.name}
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
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Links */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {bottomLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
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
