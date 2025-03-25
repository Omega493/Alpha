const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logModAction = require('../../utils/logModAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server by ID')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('ID of the user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Ban duration in days (leave blank for permanent ban)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds });

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason');
        const time = interaction.options.getInteger('time');

        if (!member.bannable) {
            return interaction.editReply({ content: `❌ I cannot ban <@${target.id}> due to role hierarchy or missing permissions.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }

        try {
            await interaction.guild.bans.create(userId, { days: time || 0, reason });
            await interaction.editReply({ content: `✅ <@${userId}> has been banned ${time ? `for ${time} days` : 'permanently'} by <@${interaction.user.id}>.\n**Reason:** ${reason}`, flags: MessageFlags.SuppressEmbeds });
            logModAction(interaction.client, '#ff0000', interaction.user.id, userId, 'Ban', reason);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `⚠️ An error occurred while trying to ban the user.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }
    }
};
