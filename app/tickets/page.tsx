import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TicketsPage } from "@/components/dashboard/tickets-page"

export default async function Tickets() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <TicketsPage />
    </DashboardLayout>
  )
}
