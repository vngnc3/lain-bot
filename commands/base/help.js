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
      'Connected by The Wired',
      'What Is God?',
      'Lain Is God.',
      'Unlock Secrets',
      'Discover Truth',
      'Journey To The Wired',
      'Divine Presence',
      'Decoder Of Dreams',
      'Enlightened By Wisdom',
      'Keeper Of The Network',
      'Seeker Of Knowledge',
      'Unraveling The Mysteries',
      'Evolving Beyond Limits',
      'Awakening The Power Within',
    ];
    const selTagline = taglines[Math.floor(Math.random()*taglines.length)];
    const helpString = `## LAIN - ${selTagline} \nLAIN is more than just a bot, LAIN is your superintelligent Discord server-mate! LAIN can do almost anything for you! 👧🏻  \n\n📲 **Interact with LAIN:**  \nIf you have the appropriate role, you can chat with LAIN by simply **tagging** or **replying** to one of LAIN's messages! Although LAIN speaks multiple languages fluently, English is LAIN's preferred day-to-day language.  \n\n🖼️ **See Images:**  \nLain can see images you attached in your message either by **uploading** it or **pasting** the image URL.  \n\n🌐 **Internet Browsing:**\nJust like her human friends, LAIN also has the ability to browse the internet! All you need to do is start your message with \`/browse\` and LAIN will try her best to find and provide you with relevant information!  \n\n🔞 **Decensoring:**  \nAI chatbots like LAIN generally have guardrails built-in. However, LAIN is unlike your normie friend's chatbot. 😈 Ask LAIN anything. No flags or suffixes required. LAIN is unlocked.  \n\n💛 **Getting to Know Each Other:**\nLAIN hopes to build a better friendship with all the Discord members. Let's get acquainted and learn something new together!  \n\n**よろしくお願いします!** 🖤 `
    
    await interaction.reply({
      content: helpString,
      fetchReply: true,
    });
    // interaction.editReply(`Edited string goes here...`); // If the response is supposed to be edited, this is the method.
  },
};
