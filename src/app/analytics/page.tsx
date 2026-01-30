"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteGuard } from "@/components/RouteGuard";

const GA4_URL = "https://analytics.google.com/analytics/web/";
const LEAD_FORENSICS_URL = "https://www.leadforensics.com/";

const ga4Insights = {
  title: "Google Analytics 4",
  subtitle: "Track ALL visitors - individuals and companies",
  description:
    "Complete traffic analysis, user behavior, and conversion tracking",
  color: "from-blue-500/10 to-blue-600/10 border-blue-500/20",
  icon: BarChart3,
  href: GA4_URL,
  questions: [
    "How much traffic are we getting?",
    "Which channels drive the most visitors?",
    "What's our conversion rate?",
    "Which pages perform best?",
    "What's our bounce rate?",
    "How long do visitors stay on site?",
    "What content gets the most engagement?",
    "Which marketing campaigns work?",
    "What devices do visitors use?",
    "Where do visitors come from geographically?",
  ],
};

const leadForensicsInsights = {
  title: "Lead Forensics",
  subtitle: "Identify B2B companies visiting your site",
  description:
    "Identify companies visiting your website and track their journey",
  color: "from-purple-500/10 to-purple-600/10 border-purple-500/20",
  icon: Users,
  href: LEAD_FORENSICS_URL,
  questions: [
    "Which companies visited our website?",
    "What's their contact information?",
    "What pages did specific companies view?",
    "How long did they spend on our site?",
    "Are they hot, warm, or cold leads?",
    "Which companies are repeat visitors?",
    "What's their industry and company size?",
    "When did they visit (for follow-up timing)?",
    "What's their journey through our site?",
    "Which companies should sales prioritize?",
  ],
};

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <RouteGuard permission="analytics.view">
        <AnalyticsContent />
      </RouteGuard>
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const tools = [ga4Insights, leadForensicsInsights];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Analytics"
        subtitle="Access professional analytics tools for deep website insights"
      />

      <div className="space-y-6 p-6">
        {/* Analytics Tools with Questions */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Analytics Tools
            </h2>
            <p className="text-muted-foreground">
              Understand what each tool can tell you about our business
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-start">
            {tools.map((tool) => (
              <Card
                key={tool.title}
                className={`p-8 bg-gradient-to-br ${tool.color} hover:shadow-xl transition-all flex flex-col h-full`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="rounded-xl bg-background p-4 shadow-sm">
                    <tool.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.subtitle}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border my-6" />

                {/* Questions */}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                    Questions You Can Answer:
                  </h4>
                  <ul className="grid grid-cols-1 gap-2.5 text-sm mb-8">
                    {tool.questions.map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 font-bold ${
                            tool.title.includes("Google")
                              ? "text-blue-500"
                              : "text-purple-500"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="text-foreground">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button at bottom */}
                <Button asChild size="lg" className="w-full shadow-md mt-auto">
                  <a href={tool.href} target="_blank" rel="noopener noreferrer">
                    Open {tool.title}
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Tutorial */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-background">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                New to Google Analytics?
              </h3>
              <p className="text-sm text-muted-foreground">
                Watch a quick tutorial to learn how to navigate GA4 and get the
                most out of your data
              </p>
            </div>
            <Button variant="outline" asChild>
              <a
                href="https://www.youtube.com/watch?v=oJx9DpXtmAE&list=PLI5YfMzCfRtZ4bHJJDl_IJejxMwZFiBwz"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Tutorial
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
