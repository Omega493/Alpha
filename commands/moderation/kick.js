const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logModAction = require('../../utils/logModAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User to kick')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds }); // Prevents multiple replies

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.editReply({ content: `⚠️ User <@${target.id}> not found in this server.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }

        if (!member.kickable) {
            return interaction.editReply({ content: `❌ I cannot kick <@${target.id}> due to role hierarchy or missing permissions.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }

        try {
            await member.kick(reason);
            await interaction.editReply({ content: `✅ **<@${target.id}>** has been kicked by <@${interaction.user.id}>.\n**Reason:** ${reason}`, flags: MessageFlags.SuppressEmbeds });

            // Log the action
            logModAction(interaction.client, '#ff4500', interaction.user.tag, target.tag, 'Kick', reason);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `⚠️ An error occurred while trying to kick <@${target.id}>.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }
    }
};
