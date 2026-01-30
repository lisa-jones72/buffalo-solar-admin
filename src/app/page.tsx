"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import {
  FileText,
  Users,
  FileCheck,
  TrendingUp,
  Eye,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardMetrics, RecentActivityItem } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteGuard } from "@/components/RouteGuard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <RouteGuard permission="dashboard.view">
        <DashboardContent />
      </RouteGuard>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch metrics and activity in parallel
        const [metricsRes, activityRes] = await Promise.all([
          fetch("/api/dashboard/metrics"),
          fetch("/api/dashboard/activity"),
        ]);

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivity(activityData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch immediately
    fetchData();

    // Poll for updated metrics and activity every 2 minutes
    const interval = setInterval(() => {
      fetchData();
    }, 120000); // 2 minutes

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const metricsArray = metrics
    ? [
        {
          title: "Website Traffic",
          value: metrics.websiteTraffic.value,
          icon: TrendingUp,
          trend: metrics.websiteTraffic.trend,
        },
        {
          title: "New Leads",
          value: metrics.newLeads.value.toString(),
          icon: Users,
          trend: metrics.newLeads.trend,
        },
        {
          title: "Applications",
          value: metrics.applications.value.toString(),
          icon: FileCheck,
          trend: metrics.applications.trend,
        },
        {
          title: "Blog Views",
          value: metrics.blogViews.value,
          icon: Eye,
          trend: metrics.blogViews.trend,
        },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
      />

      <div className="space-y-8 p-6">
        {/* Quick Access */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Linked Apps
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tools">
                More Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Content Studio */}
            <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
              <a
                href="https://studio.buffalosolar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              >
                <span className="sr-only">Open Content Studio</span>
              </a>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Content Studio
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage blog posts
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Careers */}
            <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
              <a
                href="https://careers.buffalosolar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              >
                <span className="sr-only">Open Careers</span>
              </a>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground">Careers</h3>
                  <p className="text-sm text-muted-foreground">
                    Job applications
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Forms Manager */}
            <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
              <Link href="/forms" className="absolute inset-0">
                <span className="sr-only">Open Forms Manager</span>
              </Link>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Forms Manager
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    View submissions
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Today's Metrics */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Today&apos;s Metrics
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 w-24 rounded bg-muted"></div>
                      <div className="h-8 w-16 rounded bg-muted"></div>
                      <div className="h-3 w-32 rounded bg-muted"></div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              metricsArray.map((metric) => (
                <StatCard key={metric.title} {...metric} />
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/forms">
                View all forms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card className="divide-y divide-border">
            {loading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted"></div>
                      <div className="h-3 w-24 rounded bg-muted"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="opacity-0 group-hover:opacity-100"
                    >
                      {activity.href.startsWith("http") ? (
                        <a
                          href={activity.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <Link href={activity.href}>View</Link>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent activity to display
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
