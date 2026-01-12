import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import type { Command, BotClient } from "../../types"

const command: Command = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("Display server information"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const guild = interaction.guild!

    const owner = await guild.fetchOwner()
    const members = guild.members.cache
    const channels = guild.channels.cache

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }) || "")
      .setColor("#5865F2")
      .addFields(
        { name: "בעלים", value: `<@${owner.id}>`, inline: true },
        {
          name: "נוצר",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        { name: "מזהה", value: guild.id, inline: true },
        {
          name: "משתמשים",
          value: members.filter((m) => !m.user.bot).size.toString(),
          inline: true,
        },
        {
          name: "בוטים",
          value: members.filter((m) => m.user.bot).size.toString(),
          inline: true,
        },
        { name: "רולים", value: guild.roles.cache.size.toString(), inline: true },
        {
          name: "ערוצי טקסט",
          value: channels.filter((c) => c.isTextBased()).size.toString(),
          inline: true,
        },
        {
          name: "ערוצי קול",
          value: channels.filter((c) => c.isVoiceBased()).size.toString(),
          inline: true,
        },
        { name: "Boost Level", value: guild.premiumTier.toString(), inline: true },
      )
      .setTimestamp()

    if (guild.description) {
      embed.setDescription(guild.description)
    }

    await interaction.reply({ embeds: [embed] })
  },
}

export default command
