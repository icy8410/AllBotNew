import { NextResponse } from "next/server"
import { validateEnvVars } from "@/lib/auth"

export async function GET() {
  const { valid, missing } = validateEnvVars()

  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/auth/callback`
      : "http://localhost:3000/api/auth/callback")

  return NextResponse.json({
    configured: valid,
    missing,
    redirectUri,
    vercelUrl: process.env.VERCEL_URL || null,
    vercelEnv: process.env.VERCEL_ENV || null,
    help: !valid
      ? "Add the missing environment variables in Vercel Dashboard > Settings > Environment Variables"
      : undefined,
  })
}
