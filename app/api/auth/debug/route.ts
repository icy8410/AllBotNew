import { NextResponse } from "next/server"
import { validateEnvVars } from "@/lib/auth"

// Debug endpoint to check environment variables
export async function GET(request: Request) {
  const { valid, missing, values } = validateEnvVars()

  const url = new URL(request.url)
  const expectedRedirectUri = `${url.origin}/api/auth/callback`

  return NextResponse.json({
    status: valid ? "ready" : "missing_config",
    missing,
    values,
    redirectUri: expectedRedirectUri,
    vercelUrl: process.env.VERCEL_URL || "not set",
    nodeEnv: process.env.NODE_ENV,
    instructions: !valid
      ? [
          "1. Go to the Vars section in the left sidebar",
          "2. Add DISCORD_CLIENT_ID = 1460350507066331239",
          "3. Add DISCORD_CLIENT_SECRET = your_client_secret",
          "4. Add DISCORD_BOT_TOKEN = your_bot_token",
          `5. In Discord Developer Portal, add this redirect URI: ${expectedRedirectUri}`,
        ]
      : [`Make sure this redirect URI is added in Discord Developer Portal: ${expectedRedirectUri}`],
  })
}
