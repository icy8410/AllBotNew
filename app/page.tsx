import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RealOverviewPage } from "@/components/dashboard/real-overview-page"

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <RealOverviewPage />
    </DashboardLayout>
  )
}
