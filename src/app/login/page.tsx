"use client"

import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Buffalo Solar</h1>
          <p className="text-muted-foreground text-base">Operations Hub</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Google Sign In Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 text-base font-medium bg-transparent"
            onClick={() => {
              // TODO: Implement Google OAuth
              console.log("Sign in with Google clicked")
            }}
          >
            <Chrome className="w-5 h-5 mr-3" />
            Sign in with Google
          </Button>

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
  )
}
