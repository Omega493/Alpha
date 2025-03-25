const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logModAction = require('../../utils/logModAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('massban')
        .setDescription('Bans multiple users from the server')
        .addStringOption(option => 
            option.setName('users')
                .setDescription('List of user IDs separated by spaces')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.SuppressEmbeds }); // Prevents multiple replies

        const usersInput = interaction.options.getString('users');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const userIds = usersInput.split(/\s+/);
        
        let successCount = 0;
        let failedCount = 0;

        for (const userId of userIds) {
            try {
                const user = await interaction.guild.members.fetch(userId).catch(() => null);
                if (user && user.bannable) {
                    await user.ban({ reason });
                    logModAction(interaction.client, '#ff0000', interaction.user.tag, user.user.tag, 'Mass Ban', reason);
                    successCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                console.error(`Failed to ban user ${userId}:`, error);
                failedCount++;
            }
        }

        await interaction.editReply({ content: `✅ Mass ban completed: ${successCount} users banned, ${failedCount} failed.\n**Action initiated by:** <@${interaction.user.id}>\n**Reason:** ${reason}`, flags: MessageFlags.SuppressEmbeds });
    }
};