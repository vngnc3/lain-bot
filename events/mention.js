// gpt-discord
const gptStream = require("../api/gpt-discord.js");
const stopCharacter = "🞇"; // Same as defined in gpt-discord.js

// GPT-4-Vision
const vision = require("../api/vision.js");

// RAG
const rag = require("../api/rag.js");
const ragFilter = require("../api/rag-filter.js");

// Custom shims
const helloWorld = require("../api/shims/hello.js");
const archillect = require("../api/shims/archillect.js");
const joke = require("../api/shims/joke.js");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    const reactions = ["✅", "🆗", "🖤", "🥰", "🫡", "🤔", "🧠", "🐸"];

    // Limit messages to certain role
    const requiredRoleName = "WIRED"; // Replace with your specific role name

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

    // If all conditions met, store userQuery
    let userQuery = message.content.replace(/<@!?(\d+)>/, "").trim();

    // Grok image if attached
    async function grok(query, url) {
      console.log(`[mention.js] query: ${query}`);
      console.log(`[mention.js] imageUrl: ${url}`);

      // Call the vision function to process the image
      const grokImage = await vision(url);

      // Update userQuery with the processed information
      userQuery = query + " " + grokImage;
    }

    // Detect image attachment
    if (message.attachments.size > 0) {
      // Filter out image attachments
      const imageAttachments = message.attachments.filter((attachment) =>
        attachment.contentType.startsWith("image")
      );

      // Check if there are any image attachments
      if (imageAttachments.size > 0) {
        // Get the URL of the first image attachment, store the url
        imageUrl = imageAttachments.first().url;
        // Then, grok
        await grok(userQuery, imageUrl);
      }
    }

    // Detect inline image URL
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
    // 1. Run userQuery through RAG filter;
    // 2. If RAG is needed, query the RAG function;
    // 3. Otherwise, leave the query as is.
    if (ragFilter(userQuery) === true) {
      async function queryRag(query) {
        const ragOutput = await rag(query);
        userQuery += ragOutput;
      }
    }

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
          await message.channel.send(
            `> *Lain's response exceeded Discord's character limit. Try prompting for shorter responses for now.`
          );
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
          wordBuffer += data.replace(stopCharacter, "");
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
