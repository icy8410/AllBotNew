import type { GuildMember, PermissionResolvable, ChatInputCommandInteraction } from "discord.js"
import { createErrorEmbed } from "./embeds"

export function hasPermissions(member: GuildMember, permissions: PermissionResolvable[]): boolean {
  return permissions.every((perm) => member.permissions.has(perm))
}

export function hasRole(member: GuildMember, roleId: string): boolean {
  return member.roles.cache.has(roleId)
}

export function hasAnyRole(member: GuildMember, roleIds: string[]): boolean {
  return roleIds.some((roleId) => member.roles.cache.has(roleId))
}

export async function checkPermissions(
  interaction: ChatInputCommandInteraction,
  permissions: PermissionResolvable[],
): Promise<boolean> {
  const member = interaction.member as GuildMember

  if (!hasPermissions(member, permissions)) {
    await interaction.reply({
      embeds: [createErrorEmbed("אין הרשאה", "אין לך את ההרשאות הנדרשות לביצוע פעולה זו.")],
      flags: 64,
    })
    return false
  }

  return true
}

export async function checkRole(interaction: ChatInputCommandInteraction, roleId: string): Promise<boolean> {
  const member = interaction.member as GuildMember

  if (!hasRole(member, roleId)) {
    await interaction.reply({
      embeds: [createErrorEmbed("אין הרשאה", "אין לך את הרול הנדרש לביצוע פעולה זו.")],
      flags: 64,
    })
    return false
  }

  return true
}
