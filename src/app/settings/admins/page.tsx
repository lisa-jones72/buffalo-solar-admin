"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAdmins } from "@/lib/admin";
import type { Admin } from "@/lib/types";
import { UserPlus, Mail, CheckCircle, Clock, Copy } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminsPage() {
  return (
    <ProtectedRoute>
      <AdminsContent />
    </ProtectedRoute>
  );
}

function AdminsContent() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send invitation");
        return;
      }

      setSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteLink(data.inviteLink);
      setInviteEmail("");
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
            />
            <Button type="submit" disabled={inviting}>
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
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 mb-2 font-medium">
                Invitation Link (share this with the new admin):
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-sm font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Note: In production, this will be sent via email automatically.
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
                  {admin.status === "active" ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-700 border-yellow-200"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}

                  {admin.role === "super_admin" && (
                    <Badge variant="outline">Super Admin</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

