import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"
import type { BotConfig } from "../types"

const configPath = join(__dirname, "../../config.json")

const defaultConfig: BotConfig = {
  tickets: {
    categoryId: "",
    logChannelId: "",
    supportRoleId: "",
    transcriptChannelId: "",
    slaWarningMinutes: 30,
    slaCloseMinutes: 60,
    autoResponses: [],
  },
  welcome: {
    enabled: false,
    channelId: "",
    message: "ברוך הבא {user} לשרת {server}!",
    embedEnabled: true,
    embedColor: "#5865F2",
    embedTitle: "ברוכים הבאים!",
    embedDescription: "ברוך הבא {user} לשרת שלנו!",
    embedThumbnail: true,
  },
  verify: {
    enabled: false,
    channelId: "",
    roleId: "",
    buttonText: "אמת אותי",
    embedTitle: "אימות",
    embedDescription: "לחץ על הכפתור למטה כדי לאמת את עצמך ולקבל גישה לשרת.",
    cooldownSeconds: 60,
  },
  stats: {
    enabled: false,
    categoryId: "",
    updateIntervalMs: 600000,
    channels: [
      { type: "members", format: "👥 משתמשים: {count}" },
      { type: "bots", format: "🤖 בוטים: {count}" },
      { type: "online", format: "🟢 מחוברים: {count}" },
    ],
  },
  logs: {
    enabled: false,
    channelId: "",
    events: ["memberJoin", "memberLeave", "messageDelete", "ticket"],
  },
  messageRoles: [],
}

export function getConfig(): BotConfig {
  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }

  try {
    const data = readFileSync(configPath, "utf-8")
    return { ...defaultConfig, ...JSON.parse(data) }
  } catch {
    return defaultConfig
  }
}

export function saveConfig(config: BotConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

export function updateConfig<K extends keyof BotConfig>(key: K, value: BotConfig[K]): void {
  const config = getConfig()
  config[key] = value
  saveConfig(config)
}
