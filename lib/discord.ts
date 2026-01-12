export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  global_name: string | null
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
}

export interface DiscordChannel {
  id: string
  type: number
  name: string
  position: number
  parent_id: string | null
}

export interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  permissions: string
  managed: boolean
  mentionable: boolean
}

export interface DiscordMember {
  user: DiscordUser
  nick: string | null
  roles: string[]
  joined_at: string
}

const DISCORD_API = "https://discord.com/api/v10"

export class DiscordAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${DISCORD_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Discord API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getGuild(guildId: string) {
    return this.fetch(`/guilds/${guildId}?with_counts=true`) as Promise<
      DiscordGuild & { approximate_member_count: number; approximate_presence_count: number }
    >
  }

  async getGuildChannels(guildId: string) {
    return this.fetch(`/guilds/${guildId}/channels`) as Promise<DiscordChannel[]>
  }

  async getGuildRoles(guildId: string) {
    return this.fetch(`/guilds/${guildId}/roles`) as Promise<DiscordRole[]>
  }

  async getGuildMembers(guildId: string, limit = 100) {
    return this.fetch(`/guilds/${guildId}/members?limit=${limit}`) as Promise<DiscordMember[]>
  }

  async createChannel(guildId: string, data: { name: string; type: number; parent_id?: string }) {
    return this.fetch(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createRole(guildId: string, data: { name: string; color?: number; permissions?: string }) {
    return this.fetch(`/guilds/${guildId}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateRole(guildId: string, roleId: string, data: Partial<DiscordRole>) {
    return this.fetch(`/guilds/${guildId}/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteRole(guildId: string, roleId: string) {
    return this.fetch(`/guilds/${guildId}/roles/${roleId}`, {
      method: "DELETE",
    })
  }
}

export function getDiscordAPI() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is not set")
  }
  return new DiscordAPI(token)
}
