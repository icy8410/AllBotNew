import { Events, type GuildMember, type TextChannel, EmbedBuilder } from "discord.js"
import type { Event, BotClient } from "../types"
import { getConfig } from "../utils/config"
import { logger, sendLogEmbed } from "../utils/logger"
import { trackMemberJoin } from "../services/invites"

const event: Event = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember, client: BotClient) {
    const config = getConfig()

    // Track invites
    await trackMemberJoin(member)

    // Welcome message
    if (config.welcome.enabled && config.welcome.channelId) {
      const channel = member.guild.channels.cache.get(config.welcome.channelId) as TextChannel

      if (channel) {
        const message = config.welcome.message
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name)
          .replace(/{memberCount}/g, member.guild.memberCount.toString())

        if (config.welcome.embedEnabled) {
          const embed = new EmbedBuilder()
            .setTitle(config.welcome.embedTitle.replace(/{username}/g, member.user.username))
            .setDescription(
              config.welcome.embedDescription
                .replace(/{user}/g, `<@${member.id}>`)
                .replace(/{username}/g, member.user.username)
                .replace(/{server}/g, member.guild.name)
                .replace(/{memberCount}/g, member.guild.memberCount.toString()),
            )
            .setColor(config.welcome.embedColor as `#${string}`)
            .setTimestamp()

          if (config.welcome.embedThumbnail) {
            embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          }

          if (config.welcome.embedImage) {
            embed.setImage(config.welcome.embedImage)
          }

          await channel.send({ embeds: [embed] })
        } else {
          await channel.send(message)
        }
      }
    }

    // Log member join
    if (config.logs.enabled && config.logs.events.includes("memberJoin")) {
      const logChannel = member.guild.channels.cache.get(config.logs.channelId) as TextChannel

      if (logChannel) {
        await sendLogEmbed(logChannel, "משתמש הצטרף", `<@${member.id}> הצטרף לשרת`, "#57F287", [
          { name: "משתמש", value: member.user.tag, inline: true },
          { name: "מזהה", value: member.id, inline: true },
          {
            name: "חשבון נוצר",
            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
        ])
      }
    }

    logger.info(`${member.user.tag} הצטרף לשרת ${member.guild.name}`)
  },
}

export default event
