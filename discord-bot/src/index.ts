import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from "discord.js"
import { config } from "dotenv"
import { readdirSync } from "fs"
import { join } from "path"
import type { Command, Event, BotClient } from "./types"
import { logger } from "./utils/logger"

config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
}) as BotClient

client.commands = new Collection<string, Command>()
client.cooldowns = new Collection<string, Collection<string, number>>()

// Load Commands
async function loadCommands() {
  const commandsPath = join(__dirname, "commands")
  const commandFolders = readdirSync(commandsPath)

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder)
    const commandFiles = readdirSync(folderPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

    for (const file of commandFiles) {
      const filePath = join(folderPath, file)
      const command: Command = (await import(filePath)).default

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command)
        logger.info(`פקודה נטענה: ${command.data.name}`)
      }
    }
  }
}

// Load Events
async function loadEvents() {
  const eventsPath = join(__dirname, "events")
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file)
    const event: Event = (await import(filePath)).default

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client))
    } else {
      client.on(event.name, (...args) => event.execute(...args, client))
    }

    logger.info(`אירוע נטען: ${event.name}`)
  }
}

// Register Slash Commands
async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN!)

  try {
    logger.info("מתחיל לרשום פקודות סלאש...")

    const commands = client.commands.map((cmd) => cmd.data.toJSON())

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    })

    logger.info(`נרשמו ${commands.length} פקודות בהצלחה!`)
  } catch (error) {
    logger.error("שגיאה ברישום פקודות:", error)
  }
}

// Initialize Bot
async function init() {
  try {
    await loadCommands()
    await loadEvents()
    await registerCommands()

    await client.login(process.env.DISCORD_TOKEN)
    logger.info("הבוט מחובר ומוכן!")
  } catch (error) {
    logger.error("שגיאה באתחול הבוט:", error)
    process.exit(1)
  }
}

init()

export { client }
