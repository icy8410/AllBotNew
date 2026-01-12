import {
  Events,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
  Collection,
} from "discord.js"
import type { Event, BotClient } from "../types"
import { logger } from "../utils/logger"
import { createErrorEmbed } from "../utils/embeds"
import { handleTicketButton } from "../services/tickets"
import { handleVerifyButton } from "../services/verify"

const event: Event = {
  name: Events.InteractionCreate,
  async execute(
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
    client: BotClient,
  ) {
    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)

      if (!command) {
        logger.warn(`פקודה לא נמצאה: ${interaction.commandName}`)
        return
      }

      // Cooldown handling
      if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection())
      }

      const now = Date.now()
      const timestamps = client.cooldowns.get(command.data.name)!
      const cooldownAmount = (command.cooldown || 3) * 1000

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000
          await interaction.reply({
            embeds: [createErrorEmbed("המתן רגע", `נא להמתין ${timeLeft.toFixed(1)} שניות לפני שימוש חוזר בפקודה.`)],
            flags: 64,
          })
          return
        }
      }

      timestamps.set(interaction.user.id, now)
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)

      try {
        await command.execute(interaction, client)
        logger.info(`${interaction.user.tag} ביצע פקודה: ${interaction.commandName}`)
      } catch (error) {
        logger.error(`שגיאה בפקודה ${interaction.commandName}:`, error)

        const errorEmbed = createErrorEmbed("שגיאה", "אירעה שגיאה בביצוע הפקודה. נסה שוב מאוחר יותר.")

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], flags: 64 })
        } else {
          await interaction.reply({ embeds: [errorEmbed], flags: 64 })
        }
      }
    }

    // Handle Button Interactions
    if (interaction.isButton()) {
      const customId = interaction.customId

      if (customId.startsWith("ticket_")) {
        await handleTicketButton(interaction, client)
      } else if (customId === "verify_button") {
        await handleVerifyButton(interaction, client)
      }
    }

    // Handle Select Menu Interactions
    if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions here
    }
  },
}

export default event
