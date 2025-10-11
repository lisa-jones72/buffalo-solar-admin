import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Globe,
  ExternalLink,
  FileCheck,
  BarChart3,
  FolderOpen,
  FileBarChart,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const linkedApps = [
  {
    name: "Content Studio",
    url: "https://studio.buffalosolar.com",
    description: "Manage blog posts",
    icon: FileText,
  },
  {
    name: "Careers Portal",
    url: "https://careers.buffalosolar.com",
    description: "Job applications",
    icon: Users,
  },
  {
    name: "Main Website",
    url: "https://buffalosolar.com",
    description: "Public website",
    icon: Globe,
  },
];

const adminTools = [
  {
    name: "Forms",
    description: "View submissions",
    href: "/forms",
    icon: FileCheck,
  },
  {
    name: "Analytics",
    description: "Traffic & insights",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Files",
    description: "File management",
    href: "/files",
    icon: FolderOpen,
  },
  {
    name: "Reports",
    description: "Generate reports",
    href: "/reports",
    icon: FileBarChart,
  },
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Tools"
        subtitle="Access your Buffalo Solar applications"
      />

      <div className="space-y-8 p-6">
        {/* Linked Apps */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Linked Apps
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {linkedApps.map((app) => (
              <Card
                key={app.name}
                className="group p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <app.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {app.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {app.description}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      Open
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Admin Tools */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Admin Tools
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {adminTools.map((tool) => (
              <Card
                key={tool.name}
                className="group relative overflow-hidden p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <Link href={tool.href} className="absolute inset-0">
                  <span className="sr-only">Open {tool.name}</span>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
