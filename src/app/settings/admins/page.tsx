"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAdmins } from "@/lib/admin";
import type { Admin, AdminRole } from "@/lib/types";
import { UserPlus, Mail, CheckCircle, Clock, Copy, Trash2, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteGuard } from "@/components/RouteGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { getRoleDisplayName } from "@/lib/permissions";

export default function AdminsPage() {
  return (
    <ProtectedRoute>
      <RouteGuard permission="settings.admins.view">
        <AdminsContent />
      </RouteGuard>
    </ProtectedRoute>
  );
}

function AdminsContent() {
  const { user } = useAuth();
  const { hasPermission, getInvitableRoles, role: currentUserRole } = usePermissions();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("admin");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{ email: string; name?: string; status: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Get available roles for invitation
  const availableRoles = getInvitableRoles() as AdminRole[];
  
  // Check permissions
  const canInvite = hasPermission("settings.admins.invite");
  const canDelete = hasPermission("settings.admins.delete");

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error("Error loading admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteLink("");
    setInviting(true);

    try {
      const response = await fetch("/api/admins/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          invitedBy: user?.email || "",
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send invitation");
        return;
      }

      setSuccess(`Invitation sent to ${inviteEmail} as ${getRoleDisplayName(inviteRole)}!`);
      setInviteLink(data.inviteLink);
      setInviteEmail("");
      setInviteRole("admin"); // Reset to default
      loadAdmins(); // Refresh admin list
    } catch (err) {
      setError("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSuccess("Invite link copied to clipboard!");
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (admin: Admin) => {
    setAdminToDelete({
      email: admin.email,
      name: admin.name,
      status: admin.status,
    });
    setDeleteDialogOpen(true);
  };

  // Perform the actual delete
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/admins/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminToDelete.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete admin");
        setDeleting(false);
        return;
      }

      const successMessage = adminToDelete.status === "pending"
        ? `Invitation for ${adminToDelete.email} deleted`
        : `Admin ${adminToDelete.name || adminToDelete.email} deleted successfully`;
      setSuccess(successMessage);
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      loadAdmins(); // Refresh list
    } catch (err) {
      setError("Failed to delete admin");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Admin Management"
        subtitle="Invite and manage admin users"
      />

      {/* Invite New Admin */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Invite New Admin</h2>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="admin@buffalosolar.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
              disabled={!canInvite}
            />
            <Select
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value as AdminRole)}
              disabled={!canInvite}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviting || !canInvite}>
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          {inviteLink && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-300">
              <p className="text-sm text-slate-900 mb-2 font-medium">
                Invitation Link (share this with the new admin):
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-sm font-mono bg-white text-slate-900 border-slate-300"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="bg-white hover:bg-slate-100 text-slate-900 border-slate-300"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                ⏰ This link expires in 24 hours
              </p>
            </div>
          )}
        </form>
      </Card>

      {/* Admin List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Current Admins</h2>

        {loading ? (
          <p className="text-muted-foreground">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-muted-foreground">No admins found.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {admin.name
                        ? admin.name.charAt(0).toUpperCase()
                        : admin.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {admin.name || "Name not set"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role badge */}
                  <Badge variant="outline" className="capitalize">
                    {getRoleDisplayName(admin.role)}
                  </Badge>

                  {admin.status === "active" ? (
                    <>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      {/* Only users with delete permission can delete active admins (but not themselves) */}
                      {canDelete && admin.email !== user?.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(admin)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                          title="Delete admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700 border-yellow-200"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                      {/* Anyone with invite permission can delete pending invitations */}
                      {canInvite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(admin)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                          title="Delete invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adminToDelete?.status === "pending"
                ? "Delete Invitation"
                : "Delete Admin User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {adminToDelete?.status === "pending" ? (
                <>
                  Are you sure you want to delete the invitation for{" "}
                  <strong>{adminToDelete?.email}</strong>? They will no longer
                  be able to accept this invitation.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <strong>
                    {adminToDelete?.name || adminToDelete?.email}
                  </strong>
                  ? This action cannot be undone and they will lose access to
                  the admin center.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

