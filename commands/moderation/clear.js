const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes a specified number of messages from the channel')
        .addIntegerOption(option => 
            option.setName('number')
                .setDescription('Number of messages to delete')
                .setRequired(true)
        )
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('ignoreuser')
                .setDescription('Set to true to delete only bot messages')
                .addChoices(
                    { name: 'True', value: 'true' },
                    { name: 'False', value: 'false' }
                )
                .setRequired(false)
        )
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to delete messages from')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds });

        const number = interaction.options.getInteger('number');
        const user = interaction.options.getUser('user');
        const ignoreUser = interaction.options.getString('ignoreuser');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const logChannel = interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID);
        const timestamp = Math.floor(Date.now() / 1000);
        const dynamicTimestamp = `<t:${timestamp}:F>`;

        try {
            // Send a temporary response to avoid deletion conflicts
            const botMessage = await interaction.fetchReply();
            const botMessageId = botMessage.id;

            let messages = await channel.messages.fetch({ limit: 100 }); // Fetch up to 100 messages

            if (user) {
                messages = messages.filter(msg => msg.author.id === user.id);
            }

            if (ignoreUser === 'true') {
                messages = messages.filter(msg => msg.author.bot);
            }

            // Filter out the bot's own reply
            messages = messages.filter(msg => msg.id !== botMessageId);

            const messagesToDelete = Array.from(messages.values()).slice(0, number);
            await channel.bulkDelete(messagesToDelete, true);

            await interaction.followUp({ content: `✅ Deleted ${messagesToDelete.length} messages from <#${channel.id}>.`, flags: MessageFlags.SuppressEmbeds });

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('🗑️ Messages Cleared')
                    .addFields(
                        { name: 'Channel', value: `<#${channel.id}>`, inline: true },
                        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Number of Messages', value: `${messagesToDelete.length}`, inline: true },
                        { name: 'Timestamp', value: dynamicTimestamp, inline: false }
                    );

                logChannel.send({ embeds: [logEmbed] }).catch(console.error);
            }
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '⚠️ An error occurred while trying to delete messages.', flags: MessageFlags.SuppressEmbeds });
        }
    }
};
