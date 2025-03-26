const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Pong!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const start = Date.now(); // Start time before reply

        await interaction.reply({ content: 'Calculating ping...' }); // Send initial response
        const reply = await interaction.fetchReply(); // Manually fetch the response

        const roundTripPing = Date.now() - start; // More accurate RTT calculation
        const wsPing = interaction.client.ws.ping >= 0 ? interaction.client.ws.ping : 0; // Ensure WebSocket ping is valid

        const timestamp = Math.floor(Date.now() / 1000); // Generate Discord timestamp
        const dynamicTimestamp = `<t:${timestamp}:F>`;

        const embed = new EmbedBuilder()
            .setColor('#ff0080')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Round-Trip Latency', value: `${roundTripPing}ms`, inline: true },
                { name: 'WebSocket Latency', value: `${wsPing}ms`, inline: true },
                { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Timestamp', value: dynamicTimestamp, inline: false }
            );

        await interaction.editReply({ content: '', embeds: [embed] }); // Replace initial message with the embed
    }
};
