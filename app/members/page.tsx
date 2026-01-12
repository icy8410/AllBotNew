import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MembersPage } from "@/components/dashboard/members-page"

export default async function Members() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <MembersPage />
    </DashboardLayout>
  )
}
