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
    const roles = await discord.getGuildRoles(guildId)
    return NextResponse.json(roles)
  } catch (error) {
    console.error("[v0] Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guildId, name, color, permissions } = body

    if (!guildId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const discord = getDiscordAPI()
    const role = await discord.createRole(guildId, { name, color, permissions })
    return NextResponse.json(role)
  } catch (error) {
    console.error("[v0] Error creating role:", error)
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { guildId, roleId, ...data } = body

    if (!guildId || !roleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const discord = getDiscordAPI()
    const role = await discord.updateRole(guildId, roleId, data)
    return NextResponse.json(role)
  } catch (error) {
    console.error("[v0] Error updating role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const guildId = searchParams.get("guildId")
  const roleId = searchParams.get("roleId")

  if (!guildId || !roleId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const discord = getDiscordAPI()
    await discord.deleteRole(guildId, roleId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting role:", error)
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 })
  }
}
