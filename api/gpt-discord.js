require("dotenv").config();

const OpenAI = require("openai");
const openai = new OpenAI({
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_KEY,
});
const joshpanmode = false; // respond in all lowercase
const stopcharacter = "▵"; // used to signal end of stream to mention.js

// Initialize/inject a message history array
const instruction = require("./instruction");
const examples = require("./examples");
const chatInjection = instruction.concat(examples);

let messageHistory = [...chatInjection];

// Configure model
const openaiConfig = {
  model: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
  // messages added with every user interaction or new assistant response
  temperature: 0.79, // Raise the temperature a bit for variety in response
  presence_penalty: 0.99,
  stream: true,
};

// Approximate token from character count
function approximateTokens(totalChars) {
  // '#tokens <? #characters * (1/e) + safety_margin'
  const safetyMargin = 100;
  const e = 2.718281828459045;
  const tokens = totalChars * (1 / e) + safetyMargin;
  const roundedUpTokens = Math.ceil(tokens);
  return roundedUpTokens;
}
function approximateMaxChars(maxTokens) {
  const safetyMargin = 100;
  const e = 2.718281828459045;
  const maxChars = (maxTokens - safetyMargin) * e;
  return maxChars;
}

// Message history & token management
const contextWindow = 32768; // mistral-7b has 8K context window // mixtral-8x7b has 32K context window

function manageMessageHistoryAndTokens(newMessage) {
  if (newMessage) {
    messageHistory.push(newMessage);
  }

  let totalChars;
  let totalTokens;

  function updateTokens() {
    totalChars = messageHistory.reduce((acc, message) => acc + message.content.length, 0);
    totalTokens = approximateTokens(totalChars);
  }

  updateTokens();

  const bufferTokens = 500; // Buffer for model's response
  const maxTokensWithBuffer = contextWindow - bufferTokens;

  while (totalTokens > maxTokensWithBuffer && messageHistory.length > chatInjection.length) {
    console.log('[gpt-discord.js] Attempting to remove oldest message.');
    // Remove the oldest message after chatInjection messages
    let removedMessage = messageHistory.splice(chatInjection.length, 1);
    // console.log(`Removed message: ${removedMessage[0].content}`); // Verbose message removal
    console.log('[gpt-discord.js] 1 message removed.');
    updateTokens(); // Recalculate total tokens

    // Safety check - break out of the loop if no messages are being removed
    if (totalTokens === approximateTokens(messageHistory.reduce((acc, message) => acc + message.content.length, 0))) {
      // console.error('Error: Unable to reduce token count. Exiting loop.');
      break;
    }
  }

  if (totalTokens <= maxTokensWithBuffer) {
    console.log(`[gpt-discord.js] OK: Total tokens ${Number(totalTokens)}/${Number(contextWindow)}.`);
  } else {
    console.error(`[gpt-discord.js] Error: messageHistory exceeds context window (${totalTokens} tokens).`);
  }
}

function resetMessageHistory() {
  // Reset the message history while keeping the chatInjection messages
  messageHistory = [...chatInjection];
}

// Inactivity reset configuration
let inactivityTimer;
const inactivityLimitMs = 1800000; // 30 minutes inactivity timeout

// Function to reset message history after X minutes of inactivity
function resetAfterInactivity() {
  // Clear any existing inactivity timer to restart the countdown
  clearTimeout(inactivityTimer);

  // Set a new timer
  inactivityTimer = setTimeout(() => {
    console.log('[gpt-discord.js] Inactivity limit reached. Resetting message history.');
    resetMessageHistory();
  }, inactivityLimitMs);
}

let streamTimeout;
const streamLimitMs = 5000;

async function main(prompt, onData, resetHistory = false) {
  if (resetHistory) {
    resetMessageHistory();
  } else {
    // Reset message history after inactivity if not explicitly resetting
    resetAfterInactivity();
  }

  // Refactored to use the new message management function
  manageMessageHistoryAndTokens({ role: "user", content: prompt });

  let responseBuffer = ""; // Buffer to store response chunks

  return new Promise(async (resolve, reject) => {
    // Update openaiConfig with current message history before creating the stream
    openaiConfig.messages = messageHistory;

    const stream = await openai.chat.completions.create(openaiConfig);

    try {
      for await (const chunk of stream) {
        clearTimeout(streamTimeout); // Clear the previous timeout whenever new data is received

        if (chunk.choices[0]?.delta?.content) {
          let chunkContent = chunk.choices[0].delta.content;
          if (joshpanmode) {
            chunkContent = chunkContent.toLowerCase();
          }
          onData(chunkContent);
          responseBuffer += chunkContent; // Append chunk to the buffer
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          console.log("[gpt-discord.js] Stream completed.");
          onData(" " + stopcharacter);
        }

        // Set a timeout that will mark the stream as complete if no new data is received within x seconds
        streamTimeout = setTimeout(() => {
          // console.log("[gpt-discord.js] Stream timeout.");
          onData(" " + stopcharacter);
        }, streamLimitMs);
      }
    } catch (error) {
      console.error("Stream error:", error);
      reject(error);
    } finally {
      // Ensure the Promise is resolved when the stream ends, regardless of finish_reason
      // Push the complete response to the message history
      manageMessageHistoryAndTokens({
        role: "assistant",
        content: responseBuffer,
      });

      resolve();
    }

    // Log at the end of cycle
    console.log(
      `[gpt-discord.js] Messages in context : ${messageHistory.length}`
    );
  });
}

module.exports = main;
