"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Users, Bell, Lock, Palette, ChevronRight } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteGuard } from "@/components/RouteGuard";

const settingsSections = [
  {
    name: "Admin Management",
    description: "Invite and manage admin users",
    icon: Users,
    href: "/settings/admins",
    badge: "New",
  },
  {
    name: "Notifications",
    description: "Configure email and push notifications",
    icon: Bell,
    href: "/settings/notifications",
    disabled: true,
  },
  {
    name: "Security",
    description: "Password and two-factor authentication",
    icon: Lock,
    href: "/settings/security",
    disabled: true,
  },
  {
    name: "Appearance",
    description: "Customize theme and display preferences",
    icon: Palette,
    href: "/settings/appearance",
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <RouteGuard permission="settings.view">
        <SettingsContent />
      </RouteGuard>
    </ProtectedRoute>
  );
}

function SettingsContent() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.name}
            href={section.disabled ? "#" : section.href}
            className={`group ${section.disabled ? "pointer-events-none" : ""}`}
          >
            <Card
              className={`p-6 transition-all hover:shadow-md ${
                section.disabled ? "opacity-50" : "hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {section.name}
                      </h3>
                      {section.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                    {section.disabled && (
                      <span className="text-xs text-muted-foreground mt-2 inline-block">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
                {!section.disabled && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
