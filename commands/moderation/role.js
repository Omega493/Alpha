const { 
    SlashCommandBuilder, 
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add or remove a role to/from a user')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose an action')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' }
                )
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to add or remove')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The target user (defaults to you if omitted)')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Check if the executing member has the required permissions.
        if (
            !interaction.member.permissions.has("MANAGE_ROLES") ||
            !interaction.member.permissions.has("MANAGE_MEMBERS")
        ) {
            await interaction.reply({
                content: "❌ You don't have required permissions to do this action.",
                flags: 64
            });
            return;
        }

        // Retrieve options.
        const action = interaction.options.getString('action');
        const role = interaction.options.getRole('role');

        // Check if the role is bot-specific (managed) and throw an error if so.
        if (role.managed) {
            await interaction.reply({
                content: `❌ The role <@&${role.id}> is bot-specific. It can't be manually added to members.`,
                flags: 64
            });
            return;
        }

        // Although @everyone is technically a role, Discord hides it from the Role option.
        if (role.id === interaction.guild.id) {
            await interaction.reply({
                content: "❌ You cannot add or remove the @everyone role.",
                flags: 64
            });
            return;
        }

        // Fetch the target member (or default to the command invoker).
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        let embedStatus = '';
        let errorMsg = null;
        let color;

        // Start a 15-second timer for connection monitoring.
        const connectionTimeout = setTimeout(() => {
            console.warn('Operation exceeded 15 seconds, possible connection issues.');
        }, 15000);

        // Process the role action.
        if (action === 'add') {
            if (targetMember.roles.cache.has(role.id)) {
                errorMsg = `⚠️ <@${targetMember.id}> already has the role <@&${role.id}>.`;
            } else {
                try {
                    await targetMember.roles.add(role);
                    embedStatus = '✅ Role Added';
                    color = 0x0C8000;
                } catch (err) {
                    console.error(err);
                    errorMsg = `❌ Failed to add <@&${role.id}> to <@${targetMember.id}>.`;
                }
            }
        } else if (action === 'remove') {
            if (!targetMember.roles.cache.has(role.id)) {
                errorMsg = `⚠️ <@${targetMember.id}> doesn't even have the role <@&${role.id}>.`;
            } else {
                try {
                    await targetMember.roles.remove(role);
                    embedStatus = '🚫 Role Removed';
                    color = 0xff0000;
                } catch (err) {
                    console.error(err);
                    errorMsg = `❌ Failed to remove <@&${role.id}> from <@${targetMember.id}>.`;
                }
            }
        }

        // Clear the connection timeout timer.
        clearTimeout(connectionTimeout);

        // If an error occurred, send the error message.
        if (errorMsg) {
            await interaction.reply({
                content: errorMsg,
                flags: 64
            });
            return;
        }

        // Build the public embed without an explicit timestamp field.
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Role Update')
            .addFields(
                { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Target', value: `<@${targetMember.id}>`, inline: true },
                { name: 'Role', value: `<@&${role.id}>`, inline: true },
                { name: 'Status', value: embedStatus, inline: true }
            )
            .setTimestamp();

        // Send the embed to the log channel.
        const logChannel = interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('Log channel not found. Make sure process.env.LOG_CHANNEL_ID is correct.');
        }

        // Send the public embed reply.
        await interaction.reply({ embeds: [embed] });
    }
};
