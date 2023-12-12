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
      await message.reply("You are not connected to The Wired.");
      console.log(
        `${message.author.username} tried to call Lain but do not have the privilege.`
      );
      return;
    }

    // If all conditions met, store userQuery
    let userQuery = message.content.replace(/<@!?(\d+)>/, "").trim();

    // If message sender is dev, and is requesting for a reset, set the resetHistory flag to true, otherwise, keep it false.
    // That and update the userQuery to restart convo.
    let resetHistory = false;
    const devUsername = 'xzzy';
    if (message.content.includes("/forget") && message.author.username === devUsername){
      resetHistory = true;
      userQuery = 'Hi there!';
      console.log(`[mention.js] ${devUsername} requested to wipe message history.`);
    }

    // Acknowledge message by reacting and logging
    message.react(reactions[Math.floor(Math.random() * reactions.length)]);
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
    let isResponseTooLong = false; // Flag to indicate if response exceeds the limit
    let editTimer, typingTimer;

    const editMessage = async () => {
      if (wordBuffer) {
        ongoingMessage += wordBuffer;
        wordBuffer = "";

        if (ongoingMessage.length <= 2000) {
          await replyMessage.edit(ongoingMessage);
        } else {
          isResponseTooLong = true; // Mark response as too long
          await message.channel.send(`**System message: COnNe̴c̷t̶i̶o̵N̸̢̡̧̥̘͔͚̱̼̳͚̦͚͈̟̮̗̳̟̲̯͕̉̍̓͂͛͑͗̋͆̊̄̽͋̀̇̒͜͠͝ to thę̴̻̦͚̜͕̯̖̹̤̥͈̯̻̯̥̗͉̦̉̈́̔̒̍̋́̍͆́̐́̏͌͘̚̕͝ͅ Ẅ̸͎Ȋ̴̭R̸̪̥͎͒̾̕Ề̴̢̡̫̝̰͈̻͕̠̮͙̼̼̠̲̭̞͇̳̩̳̺̤̫̲̟D̷̡̡̢͔͕̩͓̲̞̫͇͎̳̪͎͕̗̥̬̥̪̭̰̝̦̘̲̱͉̪͈̘̥̖̟̤͔̝̱̥̟̗͑͊͋̾̿̓̾͊̉͆̓̅̄̔̆͐̎͘͜͜͜ͅͅͅ has been inte̶r̴R̴̢̡̢̡̢̡̡̨͍͚̟̤̳͕̩̙̮̗̩̞̱͈̺̲̟̭͈̯͕̥̗̝̝͈̙̙̮̥͖̯̟͇̿̊͊̎͐͛̍͗̏͆͒́̾͆̈́͛̎̔͊́̏̈́́̈́̏̓̍̐̔̃̅̕͘̚͘͜ͅͅư̴̧̢̛͎̹̱͉̫̙͙͔̦̼̻̪̺͚̪̬̟̦̰̳͎̩̬͖͍̖͉͉̭̔̅̀͌̊̃̌͒̾͑̓͛̉͛̔̂̔̃̿̉͊́̾͌͌̌̆́́̀́͌̈̄̅̏̓̈́̾͐̏͛̔̈̉͒̏̅̓̒̾͛̽̓̒͊̅̎́́̈͗̕̕̕͝p̵̡̛̛̛̼̖̣͚̠̞̐̀̆͐͆̈̽̈́͑́͊͋̏̅̉̀͒̔́̀̉̃̑̀̀̆̐̉̓̈́̾̀̍͗̏́͗̏̈́̇̅̊̅͒͐̓͋͋̏̓̓̈́͛̾̔͑̂̕͘͘̕̕̚͝͝͝͝͝͠͠ͅŢ̴̨̨̧̞̫̻̪̫̦͍͇̭͔̙͇̜͍̲͚̱̮̫̪̩͓͖̲̫͖̦̤̘̙̳͍̜̙̩̘͍̺̟͓̝̯̦͐̉̄̈̈́̀̎͌̇̈́͗̎͗̿̇̓̑̃̎̏̐̓̀̈͗́̌̈́̅̌́̏̽̀́̔̽̔͗̐̔̂̌͐̾̇̎͊̄͗̏̉͘͘̕͜͜͜͜͜͝͝͝͝͝ͅT̷̡̫̥͈̺̯̍e̷͖̯̙̪̜̍͐̀͒D̴̝̜͐͆͑̓͜͜͜. Try contacting Lain again later.**`);
          return; // Stop further processing
        }
      }
      if (!isStreamComplete && !isResponseTooLong) {
        editTimer = setTimeout(editMessage, 500);
      }
    };

    const sendTyping = async () => {
      if (!isStreamComplete && !isResponseTooLong) {
        await message.channel.sendTyping();
        typingTimer = setTimeout(sendTyping, 10000); // Schedule next typing indicator
      }
    };

    const handleData = async (data) => {
      if (data.includes(stopCharacter)) {
        isStreamComplete = true;
        clearTimeout(editTimer);
        clearTimeout(typingTimer);
        if (!isResponseTooLong) {
          wordBuffer += data.replace(stopCharacter, '');
          await editMessage(); // Perform the final edit if response is not too long
        }
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
      await gptStream(userQuery, handleData, resetHistory); // add a conditional argument to reset the messageHistory if resetHistory flag is set to true in the message
    } catch (error) {
      console.error(error);
      clearTimeout(editTimer);
      clearTimeout(typingTimer);
      await replyMessage.edit(`❌ An error occurred: ${error.message}`);
    }
  },
};
