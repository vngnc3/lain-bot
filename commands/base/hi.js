const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hi")
    .setDescription("I'm excited to meet you"),
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
    await interaction.reply({
      content: variants[Math.floor(Math.random()*variants.length)],
      fetchReply: true,
    });
    // interaction.editReply(`Edited string goes here...`); // If the response is supposed to be edited, this is the method.
  },
};
