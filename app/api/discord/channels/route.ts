import { NextResponse } from "next/server"
import { getDiscordAPI } from "@/lib/discord"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const guildId = searchParams.get("guildId")

  if (!guildId) {
    return NextResponse.json({ error: "Guild ID required" }, { status: 400 })
  }

  try {
    const discord = getDiscordAPI()
    const channels = await discord.getGuildChannels(guildId)
    return NextResponse.json(channels)
  } catch (error) {
    console.error("[v0] Error fetching channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guildId, name, type, parent_id } = body

    if (!guildId || !name || type === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const discord = getDiscordAPI()
    const channel = await discord.createChannel(guildId, { name, type, parent_id })
    return NextResponse.json(channel)
  } catch (error) {
    console.error("[v0] Error creating channel:", error)
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
  }
}
