const { SlashCommandBuilder } = require("discord.js");

// Markdown formatted help message
const helpString = ``;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Can LAIN help you?"),
  async execute(interaction) {
    const variants = [
        "hello",
        "hi there",
        "hi there, anon",
        "halo",
        "hai",
        "hiiiiiiiiii",
        "👋"
    ]
    const sent = await interaction.reply({
      content: variants[Math.floor(Math.random()*variants.length)],
      fetchReply: true,
    });
    // interaction.editReply(`Edited string goes here...`); // If the response is supposed to be edited, this is the method.
  },
};
