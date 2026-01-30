"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Role,
  Permission,
  hasPermission as checkPermission,
  getEffectiveRole,
  canAccessRoute as checkRouteAccess,
  DEFAULT_LANDING_PAGE,
  getInvitableRoles,
  getSidebarItemVisibility,
  SidebarItem,
  SidebarVisibility,
} from "@/lib/permissions";
import type { AdminRole } from "@/lib/types";

interface UsePermissionsReturn {
  role: Role | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccessRoute: (pathname: string) => boolean;
  getDefaultLandingPage: () => string;
  getInvitableRoles: () => Role[];
  getSidebarVisibility: (item: SidebarItem) => SidebarVisibility;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (authLoading) return;

      if (!user?.email) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch the admin record from Firestore to get their role
        const adminsRef = collection(db, "admins");
        const q = query(
          adminsRef,
          where("email", "==", user.email.toLowerCase())
        );
        const snapshot = await getDocs(q);

        let databaseRole: AdminRole | undefined;
        if (!snapshot.empty) {
          const adminData = snapshot.docs[0].data();
          databaseRole = adminData.role as AdminRole;
        }

        // Get effective role (considers whitelist for super_admin)
        const effectiveRole = getEffectiveRole(user.email, databaseRole);
        setRole(effectiveRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Default to operations on error for safety
        setRole("operations");
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, authLoading]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!role) return false;
      return checkPermission(role, permission);
    },
    [role]
  );

  const canAccessRoute = useCallback(
    (pathname: string): boolean => {
      if (!role) return false;
      return checkRouteAccess(role, pathname);
    },
    [role]
  );

  const getDefaultLandingPage = useCallback((): string => {
    if (!role) return "/reports/customer-service";
    return DEFAULT_LANDING_PAGE[role];
  }, [role]);

  const getInvitableRolesForUser = useCallback((): Role[] => {
    if (!role) return [];
    return getInvitableRoles(role);
  }, [role]);

  const getSidebarVisibility = useCallback(
    (item: SidebarItem): SidebarVisibility => {
      if (!role) return "hidden";
      return getSidebarItemVisibility(role, item);
    },
    [role]
  );

  return {
    role,
    loading,
    hasPermission,
    canAccessRoute,
    getDefaultLandingPage,
    getInvitableRoles: getInvitableRolesForUser,
    getSidebarVisibility,
  };
}
