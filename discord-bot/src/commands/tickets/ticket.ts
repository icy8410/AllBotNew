import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type TextChannel,
  PermissionFlagsBits,
} from "discord.js"
import type { Command, BotClient } from "../../types"
import { createTicket, sendTicketPanel } from "../../services/tickets"
import { createSuccessEmbed, createErrorEmbed } from "../../utils/embeds"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket system commands")
    .addSubcommand((sub) => sub.setName("create").setDescription("Create a new ticket"))
    .addSubcommand((sub) =>
      sub
        .setName("panel")
        .setDescription("Send the ticket panel")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Channel to send the panel").setRequired(false),
        ),
    ) as SlashCommandBuilder,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "create":
        const channel = await createTicket(interaction.guild!, interaction.user, client)

        if (channel) {
          await interaction.reply({
            embeds: [createSuccessEmbed("טיקט נפתח", `הטיקט שלך נפתח: <#${channel.id}>`)],
            flags: 64,
          })
        } else {
          await interaction.reply({
            embeds: [createErrorEmbed("שגיאה", "כבר יש לך טיקט פתוח או שאירעה שגיאה.")],
            flags: 64,
          })
        }
        break

      case "panel":
        const targetChannel =
          (interaction.options.getChannel("channel") as TextChannel) || (interaction.channel as TextChannel)

        await targetChannel.send(sendTicketPanel())

        await interaction.reply({
          embeds: [createSuccessEmbed("פאנל נשלח", `פאנל הטיקטים נשלח לערוץ <#${targetChannel.id}>`)],
          flags: 64,
        })
        break
    }
  },
}

export default command
