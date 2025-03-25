const { EmbedBuilder } = require('discord.js');

module.exports = async function logModAction(client, colour, moderatorId, affectedUserId, command, reason) {
    const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);

    if (!logChannel) {
        console.error('Log channel not found!');
        return;
    }

    // Fetch user objects to ensure proper mention formatting
    const moderator = await client.users.fetch(moderatorId).catch(() => null);
    const affectedUser = await client.users.fetch(affectedUserId).catch(() => null);

    const logEmbed = new EmbedBuilder()
        .setColor(colour)
        .setTitle('Moderation Action Logged')
        .addFields(
            { name: 'Moderator', value: moderator ? `<@${moderator.id}>` : 'Unknown Moderator', inline: true },
            { name: 'Affected User', value: affectedUser ? `<@${affectedUser.id}>` : 'Unknown User', inline: true },
            { name: 'Command Used', value: command, inline: true },
            { name: 'Reason', value: reason || 'No reason provided' }
        );

    logChannel.send({ 
        embeds: [logEmbed] 
    }).catch(console.error);
};
