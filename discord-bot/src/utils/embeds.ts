import { EmbedBuilder, type ColorResolvable, type User, GuildMember } from "discord.js"

export function createEmbed(title: string, description: string, color: ColorResolvable = "#5865F2"): EmbedBuilder {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp()
}

export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, "#57F287")
}

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, "#ED4245")
}

export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, "#FEE75C")
}

export function createInfoEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, "#5865F2")
}

export function createUserEmbed(
  user: User | GuildMember,
  title: string,
  description: string,
  color: ColorResolvable = "#5865F2",
): EmbedBuilder {
  const embed = createEmbed(title, description, color)
  const avatarURL = user instanceof GuildMember ? user.user.displayAvatarURL() : user.displayAvatarURL()

  return embed.setThumbnail(avatarURL)
}

export function formatTimestamp(date: Date): string {
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`
}

export function formatFullTimestamp(date: Date): string {
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`
}
