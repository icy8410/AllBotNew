import { type Guild, type GuildMember, Collection, type Invite } from "discord.js"
import type { InviteData, UserInvites } from "../types"
import { logger } from "../utils/logger"

// Cache invites per guild
const guildInvites = new Collection<string, Collection<string, InviteData>>()

// Track user invites
const userInvites = new Collection<string, UserInvites>()

// Track who invited whom
const memberInviters = new Collection<string, string>()

export async function cacheInvites(guild: Guild) {
  try {
    const invites = await guild.invites.fetch()
    const inviteCache = new Collection<string, InviteData>()

    for (const invite of invites.values()) {
      if (invite.inviter) {
        inviteCache.set(invite.code, {
          uses: invite.uses || 0,
          inviterId: invite.inviter.id,
          code: invite.code,
        })
      }
    }

    guildInvites.set(guild.id, inviteCache)
    logger.info(`קאש הזמנות עודכן עבור ${guild.name}: ${inviteCache.size} הזמנות`)
  } catch (error) {
    logger.error(`שגיאה בטעינת הזמנות עבור ${guild.name}:`, error)
  }
}

export async function trackMemberJoin(member: GuildMember) {
  const guild = member.guild

  try {
    const newInvites = await guild.invites.fetch()
    const oldInvites = guildInvites.get(guild.id) || new Collection()

    // Find the used invite
    let usedInvite: Invite | undefined

    for (const invite of newInvites.values()) {
      const oldInvite = oldInvites.get(invite.code)

      if (oldInvite && invite.uses && invite.uses > oldInvite.uses) {
        usedInvite = invite
        break
      }
    }

    if (usedInvite && usedInvite.inviter) {
      const inviterId = usedInvite.inviter.id
      memberInviters.set(member.id, inviterId)

      // Update inviter stats
      const inviterStats = userInvites.get(inviterId) || {
        total: 0,
        regular: 0,
        left: 0,
        fake: 0,
      }

      // Check for fake invite (account created recently)
      const accountAge = Date.now() - member.user.createdTimestamp
      const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000 // 7 days

      if (isNewAccount) {
        inviterStats.fake++
      } else {
        inviterStats.regular++
      }

      inviterStats.total++
      userInvites.set(inviterId, inviterStats)

      logger.info(`${member.user.tag} הוזמן על ידי ${usedInvite.inviter.tag} (קוד: ${usedInvite.code})`)
    }

    // Update cache
    await cacheInvites(guild)
  } catch (error) {
    logger.error("שגיאה במעקב הזמנות:", error)
  }
}

export async function trackMemberLeave(member: GuildMember) {
  const inviterId = memberInviters.get(member.id)

  if (inviterId) {
    const inviterStats = userInvites.get(inviterId)

    if (inviterStats) {
      inviterStats.left++
      inviterStats.total--
      userInvites.set(inviterId, inviterStats)
    }

    memberInviters.delete(member.id)
  }
}

export function getUserInvites(userId: string): UserInvites {
  return userInvites.get(userId) || { total: 0, regular: 0, left: 0, fake: 0 }
}

export function getLeaderboard(guild: Guild, limit = 10): { userId: string; invites: UserInvites }[] {
  const entries: { userId: string; invites: UserInvites }[] = []

  for (const [userId, invites] of userInvites) {
    if (guild.members.cache.has(userId)) {
      entries.push({ userId, invites })
    }
  }

  return entries.sort((a, b) => b.invites.total - a.invites.total).slice(0, limit)
}
