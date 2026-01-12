import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import type { Command, BotClient } from "../../types"
import { getUserInvites, getLeaderboard } from "../../services/invites"

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("invites")
    .setDescription("Invite tracking commands")
    .addSubcommand((sub) =>
      sub
        .setName("check")
        .setDescription("Check your or someone's invites")
        .addUserOption((opt) => opt.setName("user").setDescription("User to check").setRequired(false)),
    )
    .addSubcommand((sub) =>
      sub.setName("leaderboard").setDescription("View the invites leaderboard"),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "check":
        const user = interaction.options.getUser("user") || interaction.user
        const invites = getUserInvites(user.id)

        const checkEmbed = new EmbedBuilder()
          .setTitle(`הזמנות של ${user.username}`)
          .setThumbnail(user.displayAvatarURL())
          .setColor("#5865F2")
          .addFields(
            { name: "סה״כ", value: invites.total.toString(), inline: true },
            { name: "רגילות", value: invites.regular.toString(), inline: true },
            { name: "עזבו", value: invites.left.toString(), inline: true },
            { name: "מזויפות", value: invites.fake.toString(), inline: true },
          )
          .setTimestamp()

        await interaction.reply({ embeds: [checkEmbed] })
        break

      case "leaderboard":
        const leaderboard = getLeaderboard(interaction.guild!, 10)

        let description = ""

        if (leaderboard.length === 0) {
          description = "אין נתוני הזמנות עדיין."
        } else {
          leaderboard.forEach((entry, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`
            description += `${medal} <@${entry.userId}> - **${entry.invites.total}** הזמנות\n`
          })
        }

        const lbEmbed = new EmbedBuilder()
          .setTitle("טבלת הזמנות")
          .setDescription(description)
          .setColor("#FFD700")
          .setTimestamp()

        await interaction.reply({ embeds: [lbEmbed] })
        break
    }
  },
}

export default command
