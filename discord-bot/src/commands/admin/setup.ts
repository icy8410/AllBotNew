import { SlashCommandBuilder, type ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from "discord.js"
import type { Command, BotClient } from "../../types"
import { createSuccessEmbed } from "../../utils/embeds"
import { getConfig, updateConfig } from "../../utils/config"
import { sendVerifyPanel } from "../../services/verify"
import { createStatsChannels } from "../../services/stats"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup bot systems")
    .addSubcommand((sub) =>
      sub
        .setName("tickets")
        .setDescription("Setup the ticket system")
        .addChannelOption((opt) =>
          opt
            .setName("category")
            .setDescription("Category for tickets")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true),
        )
        .addChannelOption((opt) =>
          opt.setName("logs").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true),
        )
        .addRoleOption((opt) => opt.setName("support").setDescription("Support role").setRequired(true))
        .addChannelOption((opt) =>
          opt
            .setName("transcripts")
            .setDescription("Transcripts channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("verify")
        .setDescription("Setup the verification system")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Verification channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addRoleOption((opt) => opt.setName("role").setDescription("Verified role").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("welcome")
        .setDescription("Setup the welcome system")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Welcome channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("stats")
        .setDescription("Setup the stats system")
        .addChannelOption((opt) =>
          opt
            .setName("category")
            .setDescription("Category for stats channels")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("logs")
        .setDescription("Setup the logging system")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true),
        ),
    ) as SlashCommandBuilder,
  permissions: [PermissionFlagsBits.Administrator],

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const subcommand = interaction.options.getSubcommand()
    const config = getConfig()

    switch (subcommand) {
      case "tickets":
        const ticketCategory = interaction.options.getChannel("category")!
        const ticketLogs = interaction.options.getChannel("logs")!
        const supportRole = interaction.options.getRole("support")!
        const transcripts = interaction.options.getChannel("transcripts")

        updateConfig("tickets", {
          ...config.tickets,
          categoryId: ticketCategory.id,
          logChannelId: ticketLogs.id,
          supportRoleId: supportRole.id,
          transcriptChannelId: transcripts?.id || "",
        })

        await interaction.reply({
          embeds: [
            createSuccessEmbed(
              "מערכת טיקטים הוגדרה",
              `קטגוריה: <#${ticketCategory.id}>\nלוגים: <#${ticketLogs.id}>\nרול תמיכה: <@&${supportRole.id}>`,
            ),
          ],
          flags: 64,
        })
        break

      case "verify":
        const verifyChannel = interaction.options.getChannel("channel")!
        const verifyRole = interaction.options.getRole("role")!

        updateConfig("verify", {
          ...config.verify,
          enabled: true,
          channelId: verifyChannel.id,
          roleId: verifyRole.id,
        })

        // Send verify panel
        const channel = interaction.guild!.channels.cache.get(verifyChannel.id)
        if (channel?.isTextBased()) {
          await channel.send(sendVerifyPanel())
        }

        await interaction.reply({
          embeds: [createSuccessEmbed("מערכת אימות הוגדרה", `ערוץ: <#${verifyChannel.id}>\nרול: <@&${verifyRole.id}>`)],
          flags: 64,
        })
        break

      case "welcome":
        const welcomeChannel = interaction.options.getChannel("channel")!

        updateConfig("welcome", {
          ...config.welcome,
          enabled: true,
          channelId: welcomeChannel.id,
        })

        await interaction.reply({
          embeds: [createSuccessEmbed("מערכת Welcome הוגדרה", `ערוץ: <#${welcomeChannel.id}>`)],
          flags: 64,
        })
        break

      case "stats":
        const statsCategory = interaction.options.getChannel("category")!

        updateConfig("stats", {
          ...config.stats,
          enabled: true,
          categoryId: statsCategory.id,
        })

        await createStatsChannels(interaction.guild!, client)

        await interaction.reply({
          embeds: [createSuccessEmbed("מערכת סטטיסטיקות הוגדרה", `קטגוריה: <#${statsCategory.id}>`)],
          flags: 64,
        })
        break

      case "logs":
        const logsChannel = interaction.options.getChannel("channel")!

        updateConfig("logs", {
          ...config.logs,
          enabled: true,
          channelId: logsChannel.id,
        })

        await interaction.reply({
          embeds: [createSuccessEmbed("מערכת לוגים הוגדרה", `ערוץ: <#${logsChannel.id}>`)],
          flags: 64,
        })
        break
    }
  },
}

export default command
