import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginPage } from "@/components/auth/login-page"
import { Suspense } from "react"

function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">טוען...</div>}>
      <LoginPage />
    </Suspense>
  )
}

export default async function Login() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return <LoginPageWrapper />
}
