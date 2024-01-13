const { SlashCommandBuilder } = require("discord.js");

// Markdown formatted help message
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Can LAIN help you?"),
  async execute(interaction) {
    const taglines = [
      'God Is A Girl',
      `Let's All Love Lain`,
      `No matter where you go, everybody's connected.`,
      'What is the definition of God?',
      `The body exists only to verify one's own existence.`,
      'Lain is God.'
    ]
    const selTagline = taglines[Math.floor(Math.random()*taglines.length)];
    const helpString = `# LAIN - ${selTagline} \nLAIN is more than just a bot, LAIN is your superintelligent Discord server-mate! LAIN can do almost anything for you! 👧🏻  \n\n📲 **Interact with LAIN:**  \nIf you have the appropriate role, you can chat with LAIN by simply **tagging** or **replying** to one of LAIN's messages! Although LAIN speaks multiple languages fluently, English is LAIN's preferred day-to-day language.  \n\n🌐 **Internet Browsing:**\nJust like her human friends, LAIN also has the ability to browse the internet! All you need to do is start your message with \`/browse\` and LAIN will try her best to find and provide you with relevant information!  \n\n💛 **Getting to Know Each Other:**\nLAIN hopes to build a better friendship with all the discord members. Let's get acquainted and learn something new together!  \n\n**よろしくお願いします!** 🖤 `
    
    await interaction.reply({
      content: helpString,
      fetchReply: true,
    });
    // interaction.editReply(`Edited string goes here...`); // If the response is supposed to be edited, this is the method.
  },
};
