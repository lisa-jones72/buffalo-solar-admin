"use client";

import { useState } from "react";
import { Mail, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  formType: string;
  submissionName: string;
  sharedBy: string;
}

export function ShareLeadDialog({
  isOpen,
  onClose,
  submissionId,
  formType,
  submissionName,
  sharedBy,
}: ShareLeadDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Determine if this is a career application
  const isCareerApplication = formType === "career";
  const itemType = isCareerApplication ? "application" : "lead";
  const itemTypeCapitalized = isCareerApplication ? "Application" : "Lead";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forms/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          formType,
          recipientEmail: email,
          sharedBy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to share ${itemType}`);
      }

      setSuccess(true);
      setEmail("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to share ${itemType}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share {itemTypeCapitalized}</DialogTitle>
          <DialogDescription>
            Share this {itemType} with a teammate by entering their email address. They
            will receive a detailed email with all the {itemType} information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading || success}
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600">
                  {itemTypeCapitalized} shared successfully! The email has been sent.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground mb-1">Sharing:</p>
              <p className="text-muted-foreground">{submissionName}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {formType} Form Submission
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : success ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Share {itemTypeCapitalized}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
