"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEffectiveRole, DEFAULT_LANDING_PAGE } from "@/lib/permissions";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdminRole } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

// Helper to get landing page for a user email
async function getLandingPageForUser(email: string): Promise<string> {
  try {
    // Fetch the admin record to get their role
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("email", "==", email.toLowerCase()));
    const snapshot = await getDocs(q);

    let databaseRole: AdminRole | undefined;
    if (!snapshot.empty) {
      const adminData = snapshot.docs[0].data();
      databaseRole = adminData.role as AdminRole;
    }

    // Get effective role (considers whitelist for super_admin)
    const role = getEffectiveRole(email, databaseRole);
    return DEFAULT_LANDING_PAGE[role];
  } catch (error) {
    console.error("Error getting landing page:", error);
    return "/"; // Fallback to dashboard
  }
}

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirect to role-appropriate landing page
      const landingPage = await getLandingPageForUser(email);
      router.push(landingPage);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      // Get email from the signed-in user
      const userEmail = result?.user?.email;
      if (userEmail) {
        const landingPage = await getLandingPageForUser(userEmail);
        router.push(landingPage);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

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

        {/* Auth Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            /* Sign In Method Buttons */
            <div className="space-y-3">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-medium bg-transparent"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-3"
                />
                Sign in with Google
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-medium bg-transparent"
                onClick={() => setShowEmailForm(true)}
                disabled={loading}
              >
                <Mail className="w-5 h-5 mr-3" />
                Sign in with Email
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

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>

          {/* Footer Text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need help?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
