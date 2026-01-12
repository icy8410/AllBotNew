import {
  type ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} from "discord.js"
import type { BotClient } from "../types"
import { getConfig } from "../utils/config"
import { logger } from "../utils/logger"
import { createSuccessEmbed, createErrorEmbed } from "../utils/embeds"

// Cooldown storage
const verifyCooldowns = new Collection<string, number>()

export async function handleVerifyButton(interaction: ButtonInteraction, client: BotClient) {
  const config = getConfig()

  if (!config.verify.enabled) {
    await interaction.reply({
      embeds: [createErrorEmbed("שגיאה", "מערכת האימות אינה פעילה.")],
      flags: 64,
    })
    return
  }

  const userId = interaction.user.id
  const now = Date.now()

  // Check cooldown
  if (verifyCooldowns.has(userId)) {
    const expirationTime = verifyCooldowns.get(userId)! + config.verify.cooldownSeconds * 1000

    if (now < expirationTime) {
      const timeLeft = Math.ceil((expirationTime - now) / 1000)
      await interaction.reply({
        embeds: [createErrorEmbed("המתן רגע", `נא להמתין ${timeLeft} שניות לפני שימוש חוזר.`)],
        flags: 64,
      })
      return
    }
  }

  verifyCooldowns.set(userId, now)
  setTimeout(() => verifyCooldowns.delete(userId), config.verify.cooldownSeconds * 1000)

  const member = interaction.guild?.members.cache.get(userId)

  if (!member) {
    await interaction.reply({
      embeds: [createErrorEmbed("שגיאה", "לא ניתן למצוא את המשתמש.")],
      flags: 64,
    })
    return
  }

  if (member.roles.cache.has(config.verify.roleId)) {
    await interaction.reply({
      embeds: [createErrorEmbed("כבר מאומת", "כבר יש לך את הרול המאומת.")],
      flags: 64,
    })
    return
  }

  try {
    await member.roles.add(config.verify.roleId)

    await interaction.reply({
      embeds: [createSuccessEmbed("אימות הצליח", "קיבלת גישה לשרת!")],
      flags: 64,
    })

    logger.info(`${interaction.user.tag} עבר אימות בהצלחה`)
  } catch (error) {
    logger.error("שגיאה באימות:", error)
    await interaction.reply({
      embeds: [createErrorEmbed("שגיאה", "אירעה שגיאה בתהליך האימות.")],
      flags: 64,
    })
  }
}

export function sendVerifyPanel() {
  const config = getConfig()

  const embed = new EmbedBuilder()
    .setTitle(config.verify.embedTitle)
    .setDescription(config.verify.embedDescription)
    .setColor("#5865F2")

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("verify_button")
      .setLabel(config.verify.buttonText)
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅"),
  )

  return { embeds: [embed], components: [button] }
}
