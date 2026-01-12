import { NextResponse } from "next/server"
import { getOAuthURL, validateEnvVars } from "@/lib/auth"

export async function GET(request: Request) {
  const { valid, missing, values } = validateEnvVars()

  console.log("[v0] Login route - env validation:", { valid, missing, values })

  if (!valid) {
    console.error("[v0] Missing environment variables:", missing)
    return NextResponse.json(
      {
        error: "Configuration Error",
        message: `Missing required environment variables: ${missing.join(", ")}`,
        help: "Please add these variables in the Vars section (left sidebar) or in Vercel Project Settings > Environment Variables",
        missing,
      },
      { status: 500 },
    )
  }

  try {
    const oauthURL = getOAuthURL(request.url)
    console.log("[v0] Redirecting to OAuth URL:", oauthURL)
    return NextResponse.redirect(oauthURL)
  } catch (error) {
    console.error("[v0] OAuth URL generation error:", error)
    return NextResponse.json(
      {
        error: "Configuration Error",
        message: error instanceof Error ? error.message : "Failed to generate OAuth URL",
        help: "Please verify your DISCORD_CLIENT_ID is correct",
      },
      { status: 500 },
    )
  }
}
