import { type Guild, ChannelType, type VoiceChannel, Collection } from "discord.js"
import type { BotClient } from "../types"
import { getConfig } from "../utils/config"
import { logger } from "../utils/logger"

// Cache for rate limit prevention
const lastUpdates = new Collection<string, number>()
const MIN_UPDATE_INTERVAL = 300000 // 5 minutes minimum between updates

export function startStatsUpdater(client: BotClient) {
  const config = getConfig()

  if (!config.stats.enabled) return

  // Initial update
  updateAllStats(client)

  // Periodic updates
  setInterval(() => {
    updateAllStats(client)
  }, config.stats.updateIntervalMs)

  logger.info("מערכת סטטיסטיקות הופעלה")
}

async function updateAllStats(client: BotClient) {
  const config = getConfig()

  for (const guild of client.guilds.cache.values()) {
    await updateGuildStats(guild, config.stats)
  }
}

async function updateGuildStats(
  guild: Guild,
  statsConfig: typeof getConfig extends () => infer R ? R["stats"] : never,
) {
  const now = Date.now()
  const lastUpdate = lastUpdates.get(guild.id) || 0

  if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
    return
  }

  lastUpdates.set(guild.id, now)

  const members = await guild.members.fetch()

  for (const channelConfig of statsConfig.channels) {
    if (!channelConfig.channelId) continue

    const channel = guild.channels.cache.get(channelConfig.channelId) as VoiceChannel
    if (!channel) continue

    let count: number

    switch (channelConfig.type) {
      case "members":
        count = members.filter((m) => !m.user.bot).size
        break
      case "bots":
        count = members.filter((m) => m.user.bot).size
        break
      case "online":
        count = members.filter((m) => m.presence?.status && m.presence.status !== "offline").size
        break
      case "channels":
        count = guild.channels.cache.size
        break
      default:
        continue
    }

    const newName = channelConfig.format.replace(/{count}/g, count.toString())

    if (channel.name !== newName) {
      try {
        await channel.setName(newName)
      } catch (error) {
        logger.error(`שגיאה בעדכון ערוץ סטטיסטיקות: ${channel.id}`, error)
      }
    }
  }
}

export async function createStatsChannels(guild: Guild, client: BotClient) {
  const config = getConfig()

  if (!config.stats.categoryId) {
    logger.warn("לא הוגדרה קטגוריה לערוצי סטטיסטיקות")
    return
  }

  const category = guild.channels.cache.get(config.stats.categoryId)

  if (!category || category.type !== ChannelType.GuildCategory) {
    logger.error("קטגוריית סטטיסטיקות לא נמצאה")
    return
  }

  for (const channelConfig of config.stats.channels) {
    if (channelConfig.channelId) continue // Already exists

    const name = channelConfig.format.replace(/{count}/g, "0")

    try {
      const channel = await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: config.stats.categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ["Connect"],
            allow: ["ViewChannel"],
          },
        ],
      })

      channelConfig.channelId = channel.id
      logger.info(`ערוץ סטטיסטיקות נוצר: ${channel.name}`)
    } catch (error) {
      logger.error("שגיאה ביצירת ערוץ סטטיסטיקות:", error)
    }
  }
}
