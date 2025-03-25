const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logModAction = require('../../utils/logModAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server')
        .addStringOption(option => 
            option.setName('user_id')
                .setDescription('ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds }); // Prevents multiple replies

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const bannedUsers = await interaction.guild.bans.fetch();
            const bannedUser = bannedUsers.get(userId);
            
            if (!bannedUser) {
                return interaction.editReply({ content: `⚠️ User with ID ${userId} is not banned.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
            }

            await interaction.guild.bans.remove(userId, reason);
            await interaction.editReply({ content: `✅ <@${userId}> has been unbanned by <@${interaction.user.id}>.\n**Reason:** ${reason}`, flags: MessageFlags.SuppressEmbeds });

            // Log the action
            logModAction(interaction.client, '#0C8000', interaction.user.id, userId, 'Unban', reason);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `⚠️ An error occurred while trying to unban <@${userId}>.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }
    }
};
