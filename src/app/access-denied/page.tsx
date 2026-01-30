"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AccessDeniedPage() {
  return (
    <ProtectedRoute>
      <AccessDeniedContent />
    </ProtectedRoute>
  );
}

function AccessDeniedContent() {
  const router = useRouter();
  const { getDefaultLandingPage, role } = usePermissions();

  const handleGoHome = () => {
    const landingPage = getDefaultLandingPage();
    router.push(landingPage);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Access Restricted
        </h1>

        <p className="text-muted-foreground mb-6">
          You don't have permission to view this page. If you believe this is an
          error, please contact your administrator.
        </p>

        {role && (
          <p className="text-sm text-muted-foreground mb-6">
            Your current role:{" "}
            <span className="font-medium capitalize">
              {role.replace("_", " ")}
            </span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
