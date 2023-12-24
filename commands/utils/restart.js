const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart bot server.")
    .setDefaultMemberPermissions(0)
    ,
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "`System: Restart request received.`",
      fetchReply: true,
    });
    const dateInUTC7 = new Date(Date.now()).toLocaleString("en-US", {
        timeZone: "Asia/Bangkok",
      });
      console.log(
        `dev requested to restart the server on ${dateInUTC7}`
      );
    process.exit(0);
  },
};
