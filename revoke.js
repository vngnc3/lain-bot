const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const clientId = process.env.DISCORD_BOT_USER_ID;
const guildId = process.env.DISCORD_SERVER_ID;
const token = process.env.DISCORD_TOKEN;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Revoke guild-based commands
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log("Successfully deleted all guild commands."))
  .catch(console.error);

// Revoke global commands
rest
  .put(Routes.applicationCommands(clientId), { body: [] })
  .then(() => console.log("Successfully deleted all application commands."))
  .catch(console.error);