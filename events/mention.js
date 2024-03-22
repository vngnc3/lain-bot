// gpt-discord
const gptStream = require("../api/gpt-discord.js");
const stopCharacter = "▵"; // Same as defined in gpt-discord.js

// GPT-4-Vision
const vision = require("../api/vision.js");

// RAG
const rag = require("../api/rag.js");
const ragAgent = require("../api/rag-agent.js");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    const reactions = ["✅", "🆗", "🖤", "🥰", "🫡", "🤔", "🧠", "🐸"];

    // RULES
    // Limit messages to certain role
    const requiredRoleName = "WIRED"; // Replace with your specific role name

    // Ignore messages from other type of mentions
    if (
      message.content.includes("@here") ||
      message.content.includes("@everyone") ||
      message.content.includes(requiredRoleName) ||
      message.type == "REPLY"
    )
      return false;

    // Ignore bots
    if (message.author.bot || !message.mentions.has(message.client.user.id))
      return;

    // Check if the message sender has the required role
    const hasRequiredRole = message.member.roles.cache.some(
      (role) => role.name === requiredRoleName,
    );
    if (!hasRequiredRole) {
      // Optionally, send a reply or log if the user does not have the required role
      await message.reply("You are not connected to The Wired.");
      console.log(
        `${message.author.username} tried to call Lain but do not have the privilege.`,
      );
      return;
    }

    // If all conditions met, store userQuery
    let userQuery = message.content.replace(/<@!?(\d+)>/, "").trim();

    // VISION
    // 1. Grok image if attached
    // 2. Detect image attachment
    // 3. Detect inline image URL
    async function grok(query, url) {
      console.log(`[mention.js] query: ${query}`);
      console.log(`[mention.js] imageUrl: ${url}`);

      // Call the vision function to process the image
      const grokImage = await vision(url);

      // Update userQuery with the processed information
      userQuery = query + " " + grokImage;
    }
    if (message.attachments.size > 0) {
      // Filter out image attachments
      const imageAttachments = message.attachments.filter((attachment) =>
        attachment.contentType.startsWith("image"),
      );

      // Check if there are any image attachments
      if (imageAttachments.size > 0) {
        // Get the URL of the first image attachment, store the url
        imageUrl = imageAttachments.first().url;
        // Then, grok
        await grok(userQuery, imageUrl);
      }
    }
    const imageregex =
      /(http|https):\/\/[^\s]*\.(jpg|png|webp|gif)(\?[^]*)?\b/i;
    const imageUrlMatch = userQuery.match(imageregex);
    if (imageUrlMatch) {
      // Extract the image URL
      const imageUrl = imageUrlMatch[0];

      // Remove the image URL from the user query
      const queryText = userQuery.replace(imageregex, "").trim();

      // Grok
      await grok(queryText, imageUrl);
    }

    // RAG
    // 1. If /browse flag is used by the user, run userQuery through ragAgent to generate search query;
    // 2. Then, run the generated query into rag(query) function;
    // 3. Change the userQuery with the returned message from rag(), which contains the original user query, and the retrieved data.
    if (message.content.includes("/browse")) {
      console.log(`[mention.js] ${message.author.username} used browse.`);
      userQuery = userQuery.replace("/browse", "");
      const optimizedQuery = await ragAgent(userQuery);
      const ragResponseString = await rag(userQuery, optimizedQuery);
      userQuery = ragResponseString;
    }

    // FORGET
    // If message sender is dev, and is requesting for a reset, set the resetHistory flag to true, otherwise, keep it false.
    // That and update the userQuery to restart convo.
    let resetHistory = false;
    const devId = "301967097901350923";
    if (message.content.includes("/forget") && message.author.id === devId) {
      resetHistory = true;
      userQuery = "Hi there!";
      console.log(`[mention.js] dev has requested to wipe message history.`);
    }

    // Acknowledge message by reacting and logging
    message.react(reactions[Math.floor(Math.random() * reactions.length)]);
    const dateInUTC7 = new Date(Date.now()).toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });
    console.log(
      `${message.author.username} asked Lain on ${dateInUTC7}: ${userQuery}`,
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
          // If ongoingMessage exceeds 2000 characters, split it
          const remainingText = ongoingMessage.slice(2000);
          ongoingMessage = ongoingMessage.substring(0, 2000);
          await replyMessage.edit(ongoingMessage); // Edit the current message with the first 2000 characters

          // Send a new message with the remaining text and continue editing this new message
          replyMessage = await message.channel.send(
            remainingText.substring(0, 2000),
          );
          ongoingMessage = remainingText.substring(2000); // Prepare ongoingMessage for further text
        }
      }
      if (!isStreamComplete) {
        editTimer = setTimeout(editMessage, 50); // Continue the editMessage loop
      }
    };

    const sendTyping = async () => {
      console.log(`[mention.js] isStreamComplete: ${isStreamComplete}`); // Log the status of isStreamComplete
      if (!isStreamComplete && !isResponseTooLong) {
        await message.channel.sendTyping();
        typingTimer = setTimeout(sendTyping, 10000); // Schedule next typing indicator
      }
    };

    let streamTimeout;

    const handleData = async (data) => {
      clearTimeout(streamTimeout); // Clear the previous timeout whenever new data is received

      if (data.includes(stopCharacter)) {
        isStreamComplete = true;
        clearTimeout(editTimer);
        clearTimeout(typingTimer);
        if (!isResponseTooLong) {
          wordBuffer += data.replace(stopCharacter, "");
          await editMessage(); // Perform the final edit if response is not too long
        }
        console.log("[mention.js] Stream completed.");
        console.log(`---`);
        return;
      } else {
        wordBuffer += data;
      }

      // Set a timeout that will mark the stream as complete if no new data is received within 5 seconds
      streamTimeout = setTimeout(() => {
        isStreamComplete = true;
        clearTimeout(editTimer);
        clearTimeout(typingTimer);
        console.log("[mention.js] Stream timeout.");
      }, 5000);
    };

    // Start the edit and typing processes
    editTimer = setTimeout(editMessage, 500);
    await sendTyping(); // Call sendTyping immediately
    typingTimer = setTimeout(sendTyping, 10000); // Then schedule it to be called every 10 seconds

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
