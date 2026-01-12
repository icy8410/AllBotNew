import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LogsPage } from "@/components/dashboard/logs-page"

export default async function Logs() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <LogsPage />
    </DashboardLayout>
  )
}
