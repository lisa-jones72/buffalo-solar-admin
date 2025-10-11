import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import {
  FileText,
  Users,
  Globe,
  FileCheck,
  BarChart3,
  FolderOpen,
  FileBarChart,
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const externalSystems = [
  {
    name: "Studio",
    url: "studio.buffalosolar.com",
    status: "online" as const,
    description: "Content management system for blog posts",
    icon: FileText,
    stats: [
      { label: "Published Posts", value: "127" },
      { label: "Draft Posts", value: "8" },
    ],
  },
  {
    name: "Careers",
    url: "careers.buffalosolar.com",
    status: "online" as const,
    description: "Job postings and application management",
    icon: Users,
    stats: [
      { label: "Active Jobs", value: "5" },
      { label: "Pending Apps", value: "23" },
    ],
  },
  {
    name: "Website",
    url: "buffalosolar.com",
    status: "online" as const,
    description: "Main company website",
    icon: Globe,
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Avg Load Time", value: "1.2s" },
    ],
  },
]

const internalTools = [
  {
    name: "Forms Manager",
    description: "View and manage form submissions",
    href: "/forms",
    icon: FileCheck,
    count: "47 new",
  },
  {
    name: "Analytics Dashboard",
    description: "Website and campaign analytics",
    href: "/analytics",
    icon: BarChart3,
    count: "Live data",
  },
  {
    name: "Files Browser",
    description: "Manage uploaded files and assets",
    href: "/files",
    icon: FolderOpen,
    count: "2.4 GB used",
  },
  {
    name: "Reports",
    description: "Generate and view reports",
    href: "/reports",
    icon: FileBarChart,
    count: "12 reports",
  },
]

export default function SystemsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Systems" subtitle="Status and access to all Buffalo Solar systems" />

      <div className="space-y-8 p-6">
        {/* External Systems */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">External Systems</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {externalSystems.map((system) => (
              <Card key={system.name} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5">
                        <system.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{system.name}</h3>
                        <p className="text-xs text-muted-foreground">{system.url}</p>
                      </div>
                    </div>
                    <StatusBadge status={system.status} />
                  </div>

                  <p className="text-sm text-muted-foreground">{system.description}</p>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                    {system.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <a href={`https://${system.url}`} target="_blank" rel="noopener noreferrer">
                        Open
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`https://${system.url}/docs`} target="_blank" rel="noopener noreferrer">
                        Docs
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Internal Tools */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Internal Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {internalTools.map((tool) => (
              <Card key={tool.name} className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{tool.count}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
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
  )
}
