import { NextResponse } from "next/server"
import { getDiscordAPI } from "@/lib/discord"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const guildId = searchParams.get("id")

  if (!guildId) {
    return NextResponse.json({ error: "Guild ID required" }, { status: 400 })
  }

  try {
    const discord = getDiscordAPI()
    const guild = await discord.getGuild(guildId)
    return NextResponse.json(guild)
  } catch (error) {
    console.error("[v0] Error fetching guild:", error)
    return NextResponse.json({ error: "Failed to fetch guild" }, { status: 500 })
  }
}
