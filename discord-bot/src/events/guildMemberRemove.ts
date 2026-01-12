import { Events, type GuildMember, type TextChannel } from "discord.js"
import type { Event, BotClient } from "../types"
import { getConfig } from "../utils/config"
import { logger, sendLogEmbed } from "../utils/logger"
import { trackMemberLeave } from "../services/invites"

const event: Event = {
  name: Events.GuildMemberRemove,
  async execute(member: GuildMember, client: BotClient) {
    const config = getConfig()

    // Track leave for invites
    await trackMemberLeave(member)

    // Log member leave
    if (config.logs.enabled && config.logs.events.includes("memberLeave")) {
      const logChannel = member.guild.channels.cache.get(config.logs.channelId) as TextChannel

      if (logChannel) {
        const roles = member.roles.cache
          .filter((r) => r.id !== member.guild.id)
          .map((r) => `<@&${r.id}>`)
          .join(", ")

        await sendLogEmbed(logChannel, "משתמש עזב", `<@${member.id}> עזב את השרת`, "#ED4245", [
          { name: "משתמש", value: member.user.tag, inline: true },
          { name: "מזהה", value: member.id, inline: true },
          {
            name: "רולים",
            value: roles || "ללא רולים",
            inline: false,
          },
        ])
      }
    }

    logger.info(`${member.user.tag} עזב את השרת ${member.guild.name}`)
  },
}

export default event
