const gptStream = require("../api/gpt-discord.js");
const stopCharacter = "🞇"; // Same as defined in gpt-discord.js

module.exports = {
  name: "messageCreate",
  async execute(message) {
    const reactions = ["✅", "🆗", "🖤", "🥰", "🫡", "🤔", "🧠", "🐸"];

    // Define the required role name
    const requiredRoleName = "WIRED"; // Replace with your specific role name

    if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return false;
    if (message.author.bot || !message.mentions.has(message.client.user.id))
      return;
    
    // Check if the message sender has the required role
    const hasRequiredRole = message.member.roles.cache.some(
      (role) => role.name === requiredRoleName
    );
    if (!hasRequiredRole) {
      // Optionally, send a reply or log if the user does not have the required role
      console.log(
        `${message.author.username} tried to call Lain but do not have the privilege.`
      );
      return;
    }
    message.react(reactions[Math.floor(Math.random() * reactions.length)]);
    const userQuery = message.content.replace(/<@!?(\d+)>/, "").trim();
    const dateInUTC7 = new Date(Date.now()).toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });
    console.log(
      `${message.author.username} asked Lain on ${dateInUTC7}: ${userQuery}`
    );

    // Send typing indicator before editing the message
    await message.channel.sendTyping();

    let replyMessage = await message.reply("...");
    let ongoingMessage = "";
    let wordBuffer = "";
    let isStreamComplete = false;
    let editTimer, typingTimer;

    const editMessage = async () => {
      if (wordBuffer) {
        ongoingMessage += wordBuffer;
        wordBuffer = "";
        await replyMessage.edit(ongoingMessage);
      }
      if (!isStreamComplete) {
        editTimer = setTimeout(editMessage, 500);
      }
    };

    const sendTyping = async () => {
      if (!isStreamComplete) {
        await message.channel.sendTyping();
        typingTimer = setTimeout(sendTyping, 10000); // Schedule next typing indicator
      }
    };

    const handleData = async (data) => {
      if (data.includes(stopCharacter)) {
        isStreamComplete = true;
        clearTimeout(editTimer);
        clearTimeout(typingTimer);
        wordBuffer += data.replace(stopCharacter, '');
        await editMessage();
        console.log("[mention.js] Stream completed.");
        return;
      } else {
        wordBuffer += data;
      }
    };

    // Start the edit and typing processes
    editTimer = setTimeout(editMessage, 500);
    typingTimer = setTimeout(sendTyping, 10000);

    try {
      await gptStream(userQuery, handleData);
    } catch (error) {
      console.error(error);
      clearTimeout(editTimer);
      clearTimeout(typingTimer);
      await replyMessage.edit(`❌ An error occurred: ${error.message}`);
    }
  },
};
