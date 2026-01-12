import { EmbedBuilder, type TextChannel, type ColorResolvable } from "discord.js"

type LogLevel = "info" | "warn" | "error" | "debug"

const colors: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[35m",
}

const reset = "\x1b[0m"

function formatDate(): string {
  return new Date().toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  const timestamp = formatDate()
  const color = colors[level]
  const levelUpper = level.toUpperCase().padEnd(5)

  console.log(`${color}[${timestamp}] [${levelUpper}]${reset} ${message}`, ...args)
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
  debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
}

export async function sendLogEmbed(
  channel: TextChannel,
  title: string,
  description: string,
  color: ColorResolvable = "#5865F2",
  fields?: { name: string; value: string; inline?: boolean }[],
) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: "מערכת לוגים" })

  if (fields) {
    embed.addFields(fields)
  }

  await channel.send({ embeds: [embed] })
}
