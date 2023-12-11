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
    let isStreamComplete = false;
    let lastTypingTime = 0;

    const handleData = async (data) => {
      if (data.includes(stopCharacter)) {
        // Append data excluding the stop character and mark the stream as complete
        ongoingMessage += data.replace(stopCharacter, '');
        isStreamComplete = true;
    
        // Edit the reply with the complete message
        await replyMessage.edit(ongoingMessage);
        console.log("[mention.js] Stream completed.");
        return;
      } else {
        ongoingMessage += data;
      }
    
      const now = Date.now();
      // Send typing indicator only if more than 10 seconds have passed since the last one
      if (now - lastTypingTime > 10000 && !isStreamComplete) {
        await message.channel.sendTyping();
        lastTypingTime = now;
      }
    
      // If the stream is not yet complete, update the message with the current ongoingMessage
      if (!isStreamComplete) {
        await replyMessage.edit(ongoingMessage);
      }
    };
    
    try {
      await gptStream(userQuery, handleData);
      // Additional handling if needed after the stream is complete
    } catch (error) {
      console.error(error);
      await replyMessage.edit(`❌ An error occurred: ${error.message}`);
    }    
  },
};
