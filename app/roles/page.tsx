import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RolesPage } from "@/components/dashboard/roles-page"

export default async function Roles() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={session.user}>
      <RolesPage />
    </DashboardLayout>
  )
}
