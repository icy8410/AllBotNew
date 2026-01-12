import type {
  Client,
  Collection,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ClientEvents,
  PermissionResolvable,
} from "discord.js"

export interface BotClient extends Client {
  commands: Collection<string, Command>
  cooldowns: Collection<string, Collection<string, number>>
}

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  permissions?: PermissionResolvable[]
  cooldown?: number
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>
}

export interface Event {
  name: keyof ClientEvents
  once?: boolean
  execute: (...args: unknown[]) => Promise<void> | void
}

export interface TicketConfig {
  categoryId: string
  logChannelId: string
  supportRoleId: string
  transcriptChannelId: string
  slaWarningMinutes: number
  slaCloseMinutes: number
  autoResponses: AutoResponse[]
}

export interface AutoResponse {
  roleId: string
  triggerMessage: string
  responseMessage: string
}

export interface Ticket {
  id: string
  channelId: string
  guildId: string
  userId: string
  claimedBy?: string
  status: "open" | "claimed" | "closed"
  createdAt: Date
  lastResponseAt?: Date
  messages: TicketMessage[]
}

export interface TicketMessage {
  authorId: string
  content: string
  timestamp: Date
  isStaff: boolean
}

export interface WelcomeConfig {
  enabled: boolean
  channelId: string
  message: string
  embedEnabled: boolean
  embedColor: string
  embedTitle: string
  embedDescription: string
  embedThumbnail: boolean
  embedImage?: string
}

export interface VerifyConfig {
  enabled: boolean
  channelId: string
  roleId: string
  buttonText: string
  embedTitle: string
  embedDescription: string
  cooldownSeconds: number
}

export interface StatsConfig {
  enabled: boolean
  categoryId: string
  updateIntervalMs: number
  channels: StatsChannel[]
}

export interface StatsChannel {
  type: "members" | "bots" | "online" | "channels"
  format: string
  channelId?: string
}

export interface InviteData {
  uses: number
  inviterId: string
  code: string
}

export interface UserInvites {
  total: number
  regular: number
  left: number
  fake: number
}

export interface LogConfig {
  enabled: boolean
  channelId: string
  events: LogEvent[]
}

export type LogEvent =
  | "memberJoin"
  | "memberLeave"
  | "messageDelete"
  | "messageEdit"
  | "roleChange"
  | "channelCreate"
  | "channelDelete"
  | "ban"
  | "unban"
  | "kick"
  | "ticket"

export interface BotConfig {
  tickets: TicketConfig
  welcome: WelcomeConfig
  verify: VerifyConfig
  stats: StatsConfig
  logs: LogConfig
  messageRoles: string[]
}
