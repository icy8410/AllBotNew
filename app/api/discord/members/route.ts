import { NextResponse } from "next/server"
import { getDiscordAPI } from "@/lib/discord"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const guildId = searchParams.get("guildId")
  const limit = Number.parseInt(searchParams.get("limit") || "100")

  if (!guildId) {
    return NextResponse.json({ error: "Guild ID required" }, { status: 400 })
  }

  try {
    const discord = getDiscordAPI()
    const members = await discord.getGuildMembers(guildId, limit)
    return NextResponse.json(members)
  } catch (error) {
    console.error("[v0] Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}
