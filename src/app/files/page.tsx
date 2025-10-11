import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"

export default function FilesPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Files" subtitle="Manage uploaded files and assets" />
      <div className="p-6">
        <Card className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">Files browser coming soon</p>
        </Card>
      </div>
    </div>
  )
}
