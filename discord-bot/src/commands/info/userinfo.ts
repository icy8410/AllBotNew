import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder, type GuildMember } from "discord.js"
import type { Command, BotClient } from "../../types"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display user information")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to check").setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user") || interaction.user
    const member = interaction.guild?.members.cache.get(user.id) as GuildMember

    const roles = member.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}>`)
      .slice(0, 10)

    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor(member.displayHexColor || "#5865F2")
      .addFields(
        { name: "מזהה", value: user.id, inline: true },
        {
          name: "חשבון נוצר",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "הצטרף לשרת",
          value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
          inline: true,
        },
        {
          name: `רולים (${member.roles.cache.size - 1})`,
          value: roles.length > 0 ? roles.join(", ") : "ללא רולים",
          inline: false,
        },
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}

export default command
