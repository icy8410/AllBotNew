import { Events, ActivityType } from "discord.js"
import type { Event, BotClient } from "../types"
import { logger } from "../utils/logger"
import { startStatsUpdater } from "../services/stats"
import { startSLAChecker } from "../services/tickets"
import { cacheInvites } from "../services/invites"

const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: BotClient) {
    logger.info(`הבוט מחובר בתור ${client.user?.tag}!`)

    // Set presence
    client.user?.setPresence({
      activities: [
        {
          name: "את השרת",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    })

    // Initialize services
    for (const guild of client.guilds.cache.values()) {
      await cacheInvites(guild)
    }

    startStatsUpdater(client)
    startSLAChecker(client)

    logger.info("כל המערכות מוכנות!")
  },
}

export default event
