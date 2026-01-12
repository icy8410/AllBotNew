import {
  type TextChannel,
  type ButtonInteraction,
  type Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  Collection,
  type Guild,
  type User,
} from "discord.js"
import type { BotClient, Ticket } from "../types"
import { getConfig } from "../utils/config"
import { logger, sendLogEmbed } from "../utils/logger"
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed, createWarningEmbed } from "../utils/embeds"

// In-memory ticket storage (use database in production)
const tickets = new Collection<string, Ticket>()
const slaWarnings = new Set<string>()

export async function createTicket(guild: Guild, user: User, client: BotClient): Promise<TextChannel | null> {
  const config = getConfig()

  // Check if user already has an open ticket
  const existingTicket = tickets.find((t) => t.userId === user.id && t.guildId === guild.id && t.status !== "closed")

  if (existingTicket) {
    return null
  }

  try {
    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: config.tickets.categoryId || undefined,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: config.tickets.supportRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    })

    const ticket: Ticket = {
      id: channel.id,
      channelId: channel.id,
      guildId: guild.id,
      userId: user.id,
      status: "open",
      createdAt: new Date(),
      messages: [],
    }

    tickets.set(channel.id, ticket)

    // Send welcome embed
    const welcomeEmbed = new EmbedBuilder()
      .setTitle("טיקט נפתח")
      .setDescription(`שלום <@${user.id}>!\nצוות התמיכה יענה לך בהקדם האפשרי.\nאנא תאר את הבעיה שלך בפירוט.`)
      .setColor("#5865F2")
      .setTimestamp()
      .setFooter({ text: `מזהה טיקט: ${channel.id}` })

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("ticket_claim").setLabel("קבל טיקט").setStyle(ButtonStyle.Primary).setEmoji("✋"),
      new ButtonBuilder().setCustomId("ticket_close").setLabel("סגור טיקט").setStyle(ButtonStyle.Danger).setEmoji("🔒"),
    )

    await channel.send({
      content: `<@${user.id}> | <@&${config.tickets.supportRoleId}>`,
      embeds: [welcomeEmbed],
      components: [buttons],
    })

    // Log ticket creation
    if (config.logs.channelId) {
      const logChannel = guild.channels.cache.get(config.logs.channelId) as TextChannel

      if (logChannel) {
        await sendLogEmbed(logChannel, "טיקט נפתח", `טיקט חדש נפתח על ידי <@${user.id}>`, "#5865F2", [
          { name: "משתמש", value: user.tag, inline: true },
          { name: "ערוץ", value: `<#${channel.id}>`, inline: true },
        ])
      }
    }

    logger.info(`טיקט נפתח: ${channel.name} על ידי ${user.tag}`)
    return channel
  } catch (error) {
    logger.error("שגיאה ביצירת טיקט:", error)
    return null
  }
}

export async function handleTicketButton(interaction: ButtonInteraction, client: BotClient) {
  const config = getConfig()
  const ticket = tickets.get(interaction.channel?.id || "")

  if (!ticket) {
    await interaction.reply({
      embeds: [createErrorEmbed("שגיאה", "לא נמצא טיקט בערוץ זה.")],
      flags: 64,
    })
    return
  }

  switch (interaction.customId) {
    case "ticket_open":
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

    case "ticket_claim":
      await claimTicket(interaction, ticket, client)
      break

    case "ticket_close":
      await initiateCloseTicket(interaction, ticket, client)
      break

    case "ticket_cancel_close":
      await interaction.update({
        embeds: [createInfoEmbed("סגירה בוטלה", "סגירת הטיקט בוטלה.")],
        components: [],
      })
      break
  }
}

async function claimTicket(interaction: ButtonInteraction, ticket: Ticket, client: BotClient) {
  const config = getConfig()
  const member = interaction.guild?.members.cache.get(interaction.user.id)

  if (!member?.roles.cache.has(config.tickets.supportRoleId)) {
    await interaction.reply({
      embeds: [createErrorEmbed("אין הרשאה", "רק צוות התמיכה יכול לקבל טיקטים.")],
      flags: 64,
    })
    return
  }

  if (ticket.claimedBy) {
    await interaction.reply({
      embeds: [createErrorEmbed("הטיקט כבר נתפס", `הטיקט כבר נתפס על ידי <@${ticket.claimedBy}>.`)],
      flags: 64,
    })
    return
  }

  ticket.claimedBy = interaction.user.id
  ticket.status = "claimed"

  // Update channel permissions
  const channel = interaction.channel as TextChannel

  // Remove support role access except claimed staff
  await channel.permissionOverwrites.edit(config.tickets.supportRoleId, {
    ViewChannel: false,
  })

  await channel.permissionOverwrites.edit(interaction.user.id, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    ManageChannels: true,
  })

  await interaction.update({
    embeds: [
      createSuccessEmbed(
        "טיקט נתפס",
        `הטיקט נתפס על ידי <@${interaction.user.id}>.\nרק איש הצוות והפותח יכולים לכתוב כאן כעת.`,
      ),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("סגור טיקט")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🔒"),
      ),
    ],
  })

  // Log claim
  if (config.logs.channelId) {
    const logChannel = interaction.guild?.channels.cache.get(config.logs.channelId) as TextChannel

    if (logChannel) {
      await sendLogEmbed(logChannel, "טיקט נתפס", `<@${interaction.user.id}> תפס את הטיקט <#${channel.id}>`, "#5865F2")
    }
  }

  logger.info(`${interaction.user.tag} תפס טיקט ${channel.name}`)
}

async function initiateCloseTicket(interaction: ButtonInteraction, ticket: Ticket, client: BotClient) {
  const config = getConfig()
  const member = interaction.guild?.members.cache.get(interaction.user.id)

  const isStaff = member?.roles.cache.has(config.tickets.supportRoleId)
  const isOwner = ticket.userId === interaction.user.id

  if (!isStaff && !isOwner) {
    await interaction.reply({
      embeds: [createErrorEmbed("אין הרשאה", "אין לך הרשאה לסגור טיקט זה.")],
      flags: 64,
    })
    return
  }

  const warningEmbed = createWarningEmbed("סגירת טיקט", "הטיקט ייסגר בעוד 10 שניות.\nשלח הודעה כדי לבטל את הסגירה.")

  await interaction.update({
    embeds: [warningEmbed],
    components: [],
  })

  const channel = interaction.channel as TextChannel

  // Wait 10 seconds and check for new messages
  setTimeout(async () => {
    try {
      const messages = await channel.messages.fetch({ limit: 1 })
      const latestMessage = messages.first()

      if (latestMessage && latestMessage.createdTimestamp > Date.now() - 10000 && !latestMessage.author.bot) {
        await channel.send({
          embeds: [createInfoEmbed("סגירה בוטלה", "סגירת הטיקט בוטלה כי נשלחה הודעה.")],
        })
        return
      }

      await closeTicket(channel, ticket, interaction.user, client)
    } catch {
      // Channel might be deleted
    }
  }, 10000)
}

async function closeTicket(channel: TextChannel, ticket: Ticket, closedBy: User, client: BotClient) {
  const config = getConfig()

  // Generate transcript
  const transcript = await generateTranscript(channel, ticket)

  // Send transcript to user
  try {
    const user = await client.users.fetch(ticket.userId)
    const dmEmbed = new EmbedBuilder()
      .setTitle("הטיקט שלך נסגר")
      .setDescription(`הטיקט שלך בשרת נסגר על ידי <@${closedBy.id}>.`)
      .setColor("#ED4245")
      .setTimestamp()
      .addFields({ name: "תמליל", value: transcript.substring(0, 1024) })

    await user.send({ embeds: [dmEmbed] })
  } catch {
    // User might have DMs disabled
  }

  // Send to transcript channel
  if (config.tickets.transcriptChannelId) {
    const transcriptChannel = channel.guild.channels.cache.get(config.tickets.transcriptChannelId) as TextChannel

    if (transcriptChannel) {
      const embed = new EmbedBuilder()
        .setTitle(`תמליל טיקט - ${channel.name}`)
        .setDescription(
          `**פותח:** <@${ticket.userId}>\n**נסגר על ידי:** <@${closedBy.id}>\n**תפוס על ידי:** ${ticket.claimedBy ? `<@${ticket.claimedBy}>` : "לא נתפס"}`,
        )
        .setColor("#5865F2")
        .setTimestamp()

      await transcriptChannel.send({
        embeds: [embed],
        files: [
          {
            attachment: Buffer.from(transcript),
            name: `transcript-${channel.name}.txt`,
          },
        ],
      })
    }
  }

  // Log ticket close
  if (config.logs.channelId) {
    const logChannel = channel.guild.channels.cache.get(config.logs.channelId) as TextChannel

    if (logChannel) {
      await sendLogEmbed(logChannel, "טיקט נסגר", `טיקט <#${channel.id}> נסגר על ידי <@${closedBy.id}>`, "#ED4245", [
        { name: "פותח", value: `<@${ticket.userId}>`, inline: true },
        {
          name: "נתפס על ידי",
          value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : "לא נתפס",
          inline: true,
        },
      ])
    }
  }

  ticket.status = "closed"
  tickets.delete(channel.id)

  await channel.delete()
  logger.info(`טיקט ${channel.name} נסגר על ידי ${closedBy.tag}`)
}

async function generateTranscript(channel: TextChannel, ticket: Ticket): Promise<string> {
  const messages = await channel.messages.fetch({ limit: 100 })
  const sortedMessages = [...messages.values()].reverse()

  let transcript = `=== תמליל טיקט: ${channel.name} ===\n`
  transcript += `פותח: ${ticket.userId}\n`
  transcript += `נוצר: ${ticket.createdAt.toLocaleString("he-IL")}\n`
  transcript += `${"=".repeat(50)}\n\n`

  for (const msg of sortedMessages) {
    const time = msg.createdAt.toLocaleString("he-IL")
    transcript += `[${time}] ${msg.author.tag}: ${msg.content}\n`

    if (msg.attachments.size > 0) {
      transcript += `  [קבצים מצורפים: ${msg.attachments.map((a) => a.url).join(", ")}]\n`
    }
  }

  return transcript
}

export async function handleTicketMessage(message: Message, client: BotClient) {
  const config = getConfig()
  const ticket = tickets.get(message.channel.id)

  if (!ticket) return

  ticket.lastResponseAt = new Date()

  // Check for auto-responses
  const member = message.guild?.members.cache.get(message.author.id)

  for (const autoResponse of config.tickets.autoResponses) {
    if (
      member?.roles.cache.has(autoResponse.roleId) &&
      message.content.toLowerCase().includes(autoResponse.triggerMessage.toLowerCase())
    ) {
      await message.channel.send({
        embeds: [createInfoEmbed("הודעה אוטומטית", autoResponse.responseMessage)],
      })
    }
  }

  // Add message to ticket history
  ticket.messages.push({
    authorId: message.author.id,
    content: message.content,
    timestamp: new Date(),
    isStaff: member?.roles.cache.has(config.tickets.supportRoleId) || false,
  })
}

export function startSLAChecker(client: BotClient) {
  const config = getConfig()

  setInterval(async () => {
    const now = Date.now()

    for (const [channelId, ticket] of tickets) {
      if (ticket.status === "closed") continue

      const lastResponse = ticket.lastResponseAt || ticket.createdAt
      const minutesSinceLastResponse = (now - lastResponse.getTime()) / 1000 / 60

      const guild = client.guilds.cache.get(ticket.guildId)
      if (!guild) continue

      const channel = guild.channels.cache.get(channelId) as TextChannel
      if (!channel) continue

      // SLA Warning
      if (minutesSinceLastResponse >= config.tickets.slaWarningMinutes && !slaWarnings.has(channelId)) {
        slaWarnings.add(channelId)
        await channel.send({
          content: `<@&${config.tickets.supportRoleId}>`,
          embeds: [
            createWarningEmbed("אזהרת SLA", `לא נשלחה תגובה בטיקט זה מזה ${config.tickets.slaWarningMinutes} דקות!`),
          ],
        })
      }

      // Auto-close
      if (minutesSinceLastResponse >= config.tickets.slaCloseMinutes) {
        await channel.send({
          embeds: [createErrorEmbed("סגירה אוטומטית", "הטיקט נסגר אוטומטית עקב חוסר פעילות.")],
        })

        await closeTicket(channel, ticket, client.user!, client)
      }
    }
  }, 60000) // Check every minute
}

export function sendTicketPanel() {
  const embed = new EmbedBuilder()
    .setTitle("פתיחת טיקט")
    .setDescription("לחץ על הכפתור למטה כדי לפתוח טיקט חדש.\nצוות התמיכה יענה לך בהקדם.")
    .setColor("#5865F2")

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ticket_open").setLabel("פתח טיקט").setStyle(ButtonStyle.Primary).setEmoji("📩"),
  )

  return { embeds: [embed], components: [button] }
}
