const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'alpha.env' });

// ------------------------ ENVIRONMENT VARIABLES ------------------------ //
const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const userID1 = process.env.USER_ID1;

// ------------------------ BOT PERMISSIONS ------------------------ //
const allIntents = Object.values(GatewayIntentBits);
const client = new Client({ intents: allIntents });

// ------------------------ START BOT ------------------------ //
client.login(token);
client.once('ready', () => {
    console.log('Bot is online.');
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'birds!', type: 2 }],
        status: 'online',
    });
});

// ------------------------ HANDLE BOT SHUTDOWN ------------------------ //
let shutdownCalled = false; // Prevent duplicate shutdown calls

const shutdown = async () => {
    if (shutdownCalled) return; // Ensure function only runs once
    shutdownCalled = true;

    console.log('Shutting down bot...');
    if (client.user) {
        await client.user.setPresence({ status: 'invisible' }); // Set bot offline
    }
    await client.destroy();
    process.exit(0);
};

process.once('beforeExit', shutdown);
process.once('exit', shutdown);
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);


// ------------------------ LOAD COMMANDS ------------------------ //
client.commands = new Collection();

const loadCommands = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            const command = require(fullPath);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
            }
        }
    }
};

const commandDirs = ['./commands', './utils'];
commandDirs.forEach(dir => loadCommands(path.resolve(__dirname, dir)));

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

// ------------------------ REGISTER SLASH COMMANDS ------------------------ //
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        const commandData = Array.from(client.commands.values()).map(command => command.data.toJSON());

        await rest.put(Routes.applicationCommands(clientId), { body: commandData });
        console.log('Successfully reloaded application (/) commands globally.');
    } catch (error) {
        console.error(error);
    }
})();
