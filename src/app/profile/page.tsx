"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteGuard } from "@/components/RouteGuard";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <RouteGuard permission="profile.view">
        <ProfileContent />
      </RouteGuard>
    </ProtectedRoute>
  );
}

function ProfileContent() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Profile" subtitle="Manage your profile information" />
      <div className="p-6">
        <Card className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">Profile page coming soon</p>
        </Card>
      </div>
    </div>
  );
}
