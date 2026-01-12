import { cookies } from "next/headers"

export interface Session {
  accessToken: string
  tokenType: string
  expiresAt: number
  user: {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    global_name: string | null
  }
}

const DISCORD_OAUTH2_URL = "https://discord.com/api/oauth2"

function getClientId(): string {
  // Check for the env var that's set in the v0/Vercel project
  const clientId = process.env.DISCORD_CLIENT_ID

  if (!clientId || clientId === "undefined" || clientId.trim() === "") {
    console.error("[v0] DISCORD_CLIENT_ID is not set or invalid")
    throw new Error("DISCORD_CLIENT_ID is missing. Please add it in Vars (sidebar) or Vercel Environment Variables.")
  }

  console.log("[v0] Using Client ID:", clientId.substring(0, 5) + "...")
  return clientId
}

function getClientSecret(): string {
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientSecret || clientSecret === "undefined" || clientSecret.trim() === "") {
    console.error("[v0] DISCORD_CLIENT_SECRET is not set or invalid")
    throw new Error(
      "DISCORD_CLIENT_SECRET is missing. Please add it in Vars (sidebar) or Vercel Environment Variables.",
    )
  }
  return clientSecret
}

function getRedirectUri(requestUrl?: string): string {
  // If we have a request URL, use its origin
  if (requestUrl) {
    try {
      const url = new URL(requestUrl)
      return `${url.origin}/api/auth/callback`
    } catch {
      // Fall through to other methods
    }
  }

  // Check for explicit redirect URI
  if (process.env.NEXT_PUBLIC_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_REDIRECT_URI
  }

  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/callback`
  }

  // Fallback for local development
  return "http://localhost:3000/api/auth/callback"
}

export function validateEnvVars(): { valid: boolean; missing: string[]; values: Record<string, string> } {
  const missing: string[] = []
  const values: Record<string, string> = {}

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || clientId === "undefined" || clientId.trim() === "") {
    missing.push("DISCORD_CLIENT_ID")
  } else {
    values.clientId = clientId.substring(0, 5) + "***"
  }

  if (!clientSecret || clientSecret === "undefined" || clientSecret.trim() === "") {
    missing.push("DISCORD_CLIENT_SECRET")
  } else {
    values.clientSecret = "***set***"
  }

  return {
    valid: missing.length === 0,
    missing,
    values,
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("discord_session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value)

    if (Date.now() >= session.expiresAt) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function setSession(session: Session) {
  const cookieStore = await cookies()
  cookieStore.set("discord_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("discord_session")
}

export function getOAuthURL(requestUrl?: string): string {
  const clientId = getClientId()
  const redirectUri = getRedirectUri(requestUrl)

  console.log("[v0] OAuth URL params - clientId:", clientId, "redirectUri:", redirectUri)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
  })

  return `${DISCORD_OAUTH2_URL}/authorize?${params.toString()}`
}

export async function exchangeCode(code: string, requestUrl?: string) {
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  const redirectUri = getRedirectUri(requestUrl)

  console.log("[v0] Exchanging code with redirectUri:", redirectUri)

  const response = await fetch(`${DISCORD_OAUTH2_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[v0] Discord token exchange failed:", errorData)
    throw new Error(`Failed to exchange code: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get user info")
  }

  return response.json()
}

export async function getUserGuilds(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get user guilds")
  }

  return response.json()
}
