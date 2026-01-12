import { Events, type Message, type TextChannel } from "discord.js"
import type { Event, BotClient } from "../types"
import { getConfig } from "../utils/config"
import { sendLogEmbed } from "../utils/logger"

const event: Event = {
  name: Events.MessageDelete,
  async execute(message: Message, client: BotClient) {
    if (!message.guild || message.author?.bot) return

    const config = getConfig()

    if (config.logs.enabled && config.logs.events.includes("messageDelete")) {
      const logChannel = message.guild.channels.cache.get(config.logs.channelId) as TextChannel

      if (logChannel && message.content) {
        const content = message.content.length > 1024 ? message.content.substring(0, 1021) + "..." : message.content

        await sendLogEmbed(logChannel, "הודעה נמחקה", `הודעה נמחקה בערוץ <#${message.channel.id}>`, "#FEE75C", [
          {
            name: "מחבר",
            value: message.author?.tag || "לא ידוע",
            inline: true,
          },
          { name: "ערוץ", value: `<#${message.channel.id}>`, inline: true },
          { name: "תוכן", value: content, inline: false },
        ])
      }
    }
  },
}

export default event
