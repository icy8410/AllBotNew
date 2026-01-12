import { NextResponse } from "next/server"
import { exchangeCode, getUserInfo, setSession, validateEnvVars } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  console.log("[v0] Callback received - code:", !!code, "error:", error)

  if (error) {
    console.error("[v0] Discord OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${error}&desc=${encodeURIComponent(errorDescription || "")}`, request.url),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  const { valid, missing } = validateEnvVars()
  if (!valid) {
    console.error("[v0] Missing environment variables in callback:", missing)
    return NextResponse.redirect(new URL(`/login?error=config_error&missing=${missing.join(",")}`, request.url))
  }

  try {
    const tokenData = await exchangeCode(code, request.url)
    console.log("[v0] Token exchange successful")

    const user = await getUserInfo(tokenData.access_token)
    console.log("[v0] Got user info:", user.username)

    await setSession({
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        global_name: user.global_name,
      },
    })

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("[v0] OAuth callback error:", error)
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&details=${encodeURIComponent(errorMsg)}`, request.url),
    )
  }
}
