import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6">
        <Card className="flex h-[600px] items-center justify-center">
          <p className="text-muted-foreground">Settings page coming soon</p>
        </Card>
      </div>
    </div>
  )
}
