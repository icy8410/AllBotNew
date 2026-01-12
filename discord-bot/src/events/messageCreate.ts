import { Events, type Message, TextChannel } from "discord.js"
import type { Event, BotClient } from "../types"
import { getConfig } from "../utils/config"
import { handleTicketMessage } from "../services/tickets"

const event: Event = {
  name: Events.MessageCreate,
  async execute(message: Message, client: BotClient) {
    if (message.author.bot) return

    const config = getConfig()

    // Check if message is in a ticket channel
    if (message.channel instanceof TextChannel) {
      if (message.channel.name.startsWith("ticket-")) {
        await handleTicketMessage(message, client)
      }
    }
  },
}

export default event
