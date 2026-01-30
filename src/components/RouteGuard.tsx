"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  permission: Permission;
}

export function RouteGuard({ children, permission }: RouteGuardProps) {
  const router = useRouter();
  const { hasPermission, loading, role } = usePermissions();

  useEffect(() => {
    if (!loading && role && !hasPermission(permission)) {
      router.replace("/access-denied");
    }
  }, [loading, role, hasPermission, permission, router]);

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if no role (not authenticated)
  if (!role) {
    return null;
  }

  // Don't render if no permission (will redirect)
  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}
