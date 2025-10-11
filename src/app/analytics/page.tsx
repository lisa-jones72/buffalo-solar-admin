import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Analytics" subtitle="Website and campaign performance metrics" />
      <div className="p-6">
        <Card className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">Analytics dashboard coming soon</p>
        </Card>
      </div>
    </div>
  )
}
