const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// ------------------------ COMMAND EXPORT ------------------------ //
module.exports = [
  {
    /* '/avatar' command */
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Get the avatar URL of the selected user, or your own avatar.')
      .addUserOption(option =>
        option.setName('user').setDescription("The user's avatar to show").setRequired(false)
      ),

    async execute(interaction) {
      const user = interaction.options.getUser('user') || interaction.user;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
      await interaction.reply({ content: avatarURL });
    },
  },
];
