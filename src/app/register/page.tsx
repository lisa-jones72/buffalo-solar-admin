"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

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
      await signUp(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
    } finally {
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
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign up to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            /* Sign Up Method Buttons */
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
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </>
          )}

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>

          {/* Footer Text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
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

