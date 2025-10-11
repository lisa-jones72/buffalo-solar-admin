import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Reports" subtitle="Generate and view business reports" />
      <div className="p-6">
        <Card className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">Reports dashboard coming soon</p>
        </Card>
      </div>
    </div>
  )
}
