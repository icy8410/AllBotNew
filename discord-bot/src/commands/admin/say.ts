import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  type TextChannel,
  EmbedBuilder,
} from "discord.js"
import type { Command, BotClient } from "../../types"
import { createSuccessEmbed, createErrorEmbed } from "../../utils/embeds"
import { getConfig } from "../../utils/config"
import { hasAnyRole } from "../../utils/permissions"
import type { GuildMember } from "discord.js"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a message as the bot")
    .addStringOption((opt) => opt.setName("message").setDescription("The message to send").setRequired(true))
    .addChannelOption((opt) => opt.setName("channel").setDescription("Target channel").setRequired(false))
    .addBooleanOption((opt) => opt.setName("embed").setDescription("Send as embed").setRequired(false))
    .addStringOption((opt) => opt.setName("color").setDescription("Embed color (hex)").setRequired(false))
    .addStringOption((opt) =>
      opt.setName("title").setDescription("Embed title").setRequired(false),
    ) as SlashCommandBuilder,
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const config = getConfig()
    const member = interaction.member as GuildMember

    // Check if user has permission
    if (
      config.messageRoles.length > 0 &&
      !hasAnyRole(member, config.messageRoles) &&
      !member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        embeds: [createErrorEmbed("אין הרשאה", "אין לך הרשאה לשלוח הודעות דרך הבוט.")],
        flags: 64,
      })
      return
    }

    const message = interaction.options.getString("message", true)
    const channel = (interaction.options.getChannel("channel") as TextChannel) || (interaction.channel as TextChannel)
    const useEmbed = interaction.options.getBoolean("embed") || false
    const color = interaction.options.getString("color") || "#5865F2"
    const title = interaction.options.getString("title")

    try {
      if (useEmbed) {
        const embed = new EmbedBuilder().setDescription(message).setColor(color as `#${string}`)

        if (title) {
          embed.setTitle(title)
        }

        await channel.send({ embeds: [embed] })
      } else {
        await channel.send(message)
      }

      await interaction.reply({
        embeds: [createSuccessEmbed("הודעה נשלחה", `ההודעה נשלחה לערוץ <#${channel.id}>`)],
        flags: 64,
      })
    } catch (error) {
      await interaction.reply({
        embeds: [createErrorEmbed("שגיאה", "אירעה שגיאה בשליחת ההודעה.")],
        flags: 64,
      })
    }
  },
}

export default command
