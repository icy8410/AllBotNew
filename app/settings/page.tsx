import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RealSettingsPage } from "@/components/dashboard/real-settings-page"

export default async function Settings() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <RealSettingsPage />
    </DashboardLayout>
  )
}
