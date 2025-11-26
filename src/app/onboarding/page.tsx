"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { acceptInvitation } from "@/lib/admin";
import Image from "next/image";
import { CheckCircle, User, Briefcase, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleComplete = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get invitation token from session
      const inviteToken = sessionStorage.getItem("inviteToken");

      if (inviteToken) {
        // Accept invitation and update profile
        const result = await acceptInvitation(inviteToken, name);

        if (!result.success) {
          setError(result.error || "Failed to complete setup");
          setLoading(false);
          return;
        }

        // Clear invitation token
        sessionStorage.removeItem("inviteToken");
      }

      // Show success step
      setStep(3);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError("Failed to complete onboarding");
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Buffalo Solar"
            width={160}
            height={53}
            className="mx-auto mb-4"
            priority
          />
          <p className="text-muted-foreground">Admin Center</p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-accent">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="p-8 md:p-12">
            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome to Buffalo Solar!
                  </h2>
                  <p className="text-muted-foreground">
                    Let's get your account set up. This will only take a minute.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Manage leads & forms</p>
                      <p className="text-sm text-muted-foreground">
                        Access all form submissions and lead data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">View analytics</p>
                      <p className="text-sm text-muted-foreground">
                        Track website traffic and performance metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Collaborate with team</p>
                      <p className="text-sm text-muted-foreground">
                        Invite and manage other admin users
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12"
                  onClick={() => setStep(2)}
                >
                  Get Started
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Tell us about yourself
                  </h2>
                  <p className="text-muted-foreground">
                    We'll use this to personalize your experience
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your full name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your role (optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Sales Manager, Marketing Lead"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="rounded-lg bg-accent/50 p-4 flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Your Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  All Set, {name.split(" ")[0]}!
                </h2>
                <p className="text-muted-foreground mb-2">
                  Your account is ready to go.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Redirecting to dashboard...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skip link for step 2 */}
        {step === 2 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Changed your mind?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              Sign out
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

