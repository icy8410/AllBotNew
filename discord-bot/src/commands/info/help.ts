import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import type { Command, BotClient } from "../../types"

const command: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("Display all available commands"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const commands = client.commands

    const embed = new EmbedBuilder()
      .setTitle("רשימת פקודות")
      .setDescription("להלן רשימת כל הפקודות הזמינות:")
      .setColor("#5865F2")
      .setTimestamp()

    const categories: Record<string, string[]> = {
      "מערכת טיקטים": ["ticket"],
      הגדרות: ["setup"],
      הודעות: ["say"],
      הזמנות: ["invites"],
      מידע: ["serverinfo", "userinfo", "help"],
    }

    for (const [category, cmdNames] of Object.entries(categories)) {
      const cmds = cmdNames
        .filter((name) => commands.has(name))
        .map((name) => `\`/${name}\` - ${commands.get(name)!.data.description}`)
        .join("\n")

      if (cmds) {
        embed.addFields({ name: category, value: cmds, inline: false })
      }
    }

    await interaction.reply({ embeds: [embed] })
  },
}

export default command
