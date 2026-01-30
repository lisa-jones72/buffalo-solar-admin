"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { acceptInvitation } from "@/lib/admin";
import { usePermissions } from "@/hooks/usePermissions";
import { getRoleDisplayName } from "@/lib/permissions";
import type { AdminRole } from "@/lib/types";
import Image from "next/image";
import { CheckCircle, User, Briefcase, Sparkles, Headphones, Shield, BarChart3 } from "lucide-react";

// Role-specific onboarding content - scalable for new roles
interface OnboardingContent {
  welcomeTitle: string;
  welcomeSubtitle: string;
  features: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  successRedirectLabel: string;
}

function getOnboardingContent(role: AdminRole): OnboardingContent {
  switch (role) {
    case "super_admin":
      return {
        welcomeTitle: "Welcome, Super Admin!",
        welcomeSubtitle: "You have full access to manage Buffalo Solar's admin center.",
        features: [
          {
            title: "Full system access",
            description: "Manage all features, settings, and configurations",
            icon: Shield,
          },
          {
            title: "Team management",
            description: "Invite and manage all admin users and their roles",
            icon: User,
          },
          {
            title: "Analytics & reports",
            description: "Access comprehensive analytics and business reports",
            icon: BarChart3,
          },
        ],
        successRedirectLabel: "Redirecting to dashboard...",
      };
    case "admin":
      return {
        welcomeTitle: "Welcome to Buffalo Solar!",
        welcomeSubtitle: "Let's get your account set up. This will only take a minute.",
        features: [
          {
            title: "Manage leads & forms",
            description: "Access all form submissions and lead data",
            icon: Briefcase,
          },
          {
            title: "View analytics",
            description: "Track website traffic and performance metrics",
            icon: BarChart3,
          },
          {
            title: "Collaborate with team",
            description: "Invite and manage other team members",
            icon: User,
          },
        ],
        successRedirectLabel: "Redirecting to dashboard...",
      };
    case "operations":
      return {
        welcomeTitle: "Welcome to the Team!",
        welcomeSubtitle: "You're joining Buffalo Solar's customer service operations.",
        features: [
          {
            title: "Customer service requests",
            description: "View and manage support tickets from customers",
            icon: Headphones,
          },
          {
            title: "Service submissions",
            description: "Access customer service form submissions",
            icon: Briefcase,
          },
          {
            title: "Your profile",
            description: "Manage your account settings and preferences",
            icon: User,
          },
        ],
        successRedirectLabel: "Redirecting to customer service...",
      };
    default:
      return {
        welcomeTitle: "Welcome to Buffalo Solar!",
        welcomeSubtitle: "Let's get your account set up.",
        features: [
          {
            title: "Access the portal",
            description: "You're all set to get started",
            icon: CheckCircle,
          },
        ],
        successRedirectLabel: "Redirecting...",
      };
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getDefaultLandingPage, loading: permissionsLoading } = usePermissions();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState<AdminRole>("admin");

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Get the role from sessionStorage (set during accept-invite)
    const storedRole = sessionStorage.getItem("inviteRole") as AdminRole;
    if (storedRole) {
      setInviteRole(storedRole);
    }
  }, [user, router]);

  // Get role-specific onboarding content
  const onboardingContent = getOnboardingContent(inviteRole);

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

        // Clear invitation token and role
        sessionStorage.removeItem("inviteToken");
        sessionStorage.removeItem("inviteRole");
      }

      // Show success step
      setStep(3);

      // Redirect to appropriate landing page after 2 seconds
      setTimeout(() => {
        const landingPage = getDefaultLandingPage();
        router.push(landingPage);
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
                    {onboardingContent.welcomeTitle}
                  </h2>
                  <p className="text-muted-foreground">
                    {onboardingContent.welcomeSubtitle}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {getRoleDisplayName(inviteRole)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {onboardingContent.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <feature.icon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
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
                      Your job title (optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Sales Manager, Marketing Lead"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
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
                  <span>{onboardingContent.successRedirectLabel}</span>
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

