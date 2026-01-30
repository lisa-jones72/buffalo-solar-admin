"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, UserPlus, CheckCircle, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateInvitationToken } from "@/lib/admin";
import { getRoleDisplayName } from "@/lib/permissions";
import type { AdminRole } from "@/lib/types";
import Image from "next/image";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { signUp, signInWithGoogle } = useAuth();

  const [validating, setValidating] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("admin");
  const [inviteValid, setInviteValid] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const result = await validateInvitationToken(token);

      if (!result.valid) {
        setError(result.error || "Invalid invitation");
        setInviteValid(false);
      } else {
        setInviteEmail(result.email || "");
        setInviteRole(result.role || "admin");
        setInviteValid(true);
      }
    } catch (err) {
      setError("Failed to validate invitation");
      setInviteValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account with invitation email
      await signUp(inviteEmail, password);

      // Store invitation token and role in session for onboarding
      sessionStorage.setItem("inviteToken", token);
      sessionStorage.setItem("inviteRole", inviteRole);

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();

      // Store invitation token and role in session for onboarding
      sessionStorage.setItem("inviteToken", token);
      sessionStorage.setItem("inviteRole", inviteRole);

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Buffalo Solar"
              width={180}
              height={60}
              className="mx-auto mb-4"
            />
            <p className="text-muted-foreground">Admin Center</p>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Invalid Invitation
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/login")} variant="outline">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Buffalo Solar"
              width={180}
              height={60}
              priority
            />
          </div>
          <p className="text-muted-foreground text-base">Admin Center</p>
        </div>

        {/* Invitation Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Accept Invitation
            </h2>
            <p className="text-muted-foreground text-sm">
              You've been invited to join the team
            </p>
            <div className="mt-3 flex flex-col gap-2 items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{inviteEmail}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {getRoleDisplayName(inviteRole as AdminRole)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            /* Auth Method Buttons */
            <div className="space-y-3">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-medium bg-transparent"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-3"
                />
                Sign up with Google
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-medium bg-transparent"
                onClick={() => setShowEmailForm(true)}
                disabled={loading}
              >
                <Mail className="w-5 h-5 mr-3" />
                Sign up with Email
              </Button>
            </div>
          ) : (
            /* Email/Password Form */
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmailForm(false);
                  setError("");
                }}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Accept & Create Account"}
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            By accepting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

