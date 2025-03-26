const { REST, Routes } = require('discord.js');
require('dotenv').config({ path: 'alpha.env' });

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Deleting all guild application (/) commands.');

        // Delete all guild-specific commands
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [] },
        );

        console.log('Successfully deleted all guild application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
