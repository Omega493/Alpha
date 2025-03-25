require('dotenv').config({ path: 'changli.env' });
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Deleting all global application (/) commands.');

        // Delete all global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );

        console.log('Successfully deleted all global application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();