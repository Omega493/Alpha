const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logModAction = require('../../utils/logModAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hardmute')
        .setDescription('Mutes a user and removes all their roles')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User to hard mute')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('time')
                .setDescription('Mute duration in minutes (leave blank for indefinite)')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for hard muting')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds }); // Prevents multiple replies

        const target = interaction.options.getUser('target');
        const time = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.editReply({ content: `⚠️ User <@${target.id}> not found in this server.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }

        if (!member.moderatable) {
            return interaction.editReply({ content: `❌ I cannot hard mute <@${target.id}> due to role hierarchy or missing permissions.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }

        try {
            // Remove all roles
            const roles = member.roles.cache.map(role => role.id);
            for (const roleId of roles) {
                await member.roles.remove(roleId);
            }

            // Apply mute
            await member.timeout(time ? time * 60 * 1000 : null, reason);
            await interaction.editReply({ content: `✅ **<@${target.id}>** has been hard muted ${time ? `for ${time} minutes` : 'indefinitely'} by <@${interaction.user.id}>. All roles removed.\n**Reason:** ${reason}`, flags: MessageFlags.SuppressEmbeds });
            
            // Log the action
            logModAction(interaction.client, '#ff5100', interaction.user.tag, target.tag, 'Hard Mute', reason);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `⚠️ An error occurred while trying to hard mute <@${target.id}>.`, flags: MessageFlags.SuppressEmbeds | MessageFlags.Ephemeral });
        }
    }
};
