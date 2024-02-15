require("dotenv").config();

const OpenAI = require("openai");
const openai = new OpenAI({
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_KEY,
})
const joshpanmode = false; // respond in all lowercase
const stopcharacter = "▵"; // used to signal end of stream to mention.js

// Initialize/inject a message history array
const instruction = require("./instruction");
const examples = require("./examples");
const chatInjection = instruction.concat(examples);

let messageHistory = chatInjection;

// Configure model
const openaiConfig = {
  model: "teknium/OpenHermes-2p5-Mistral-7B",
  messages: messageHistory,
  temperature: 0.79, // Raise the temperature a bit for variety in response
  presence_penalty: 0.99,
  stream: true,
};

// Approximate token from character count
function approximateTokens(totalChars) {
  // '#tokens <? #characters * (1/e) + safety_margin'
  const safetyMargin = 100;
  const e = 2.718281828459045;
  const tokens = totalChars * (1/e) + safetyMargin;
  return tokens;
}
function approximateMaxChars(maxTokens) {
  const safetyMargin = 100;
  const e = 2.718281828459045;
  const maxChars = (maxTokens - safetyMargin) * e;
  return maxChars;
}

// Message history & token management
const contextWindow = 8192; // mistral-7b has 8K context window

function checkMessageHistory() {
  console.log("[gpt-discord.js] Checking message history...");

  let totalChars = messageHistory.reduce(
    (acc, message) => acc + message.content.length,
    0
  );

  console.log(
    `[gpt-discord.js] Approximated tokens : ${approximateTokens(totalChars)}`
  );

  const maxChars = approximateMaxChars(contextWindow);

  if (totalChars > maxChars) {
    console.log("[gpt-discord.js] Context window is too large, removing oldest message.");
    messageHistory.splice(chatInjection.length, 1); // Remove the oldest user/assistant message after chatInjection messages
    totalChars = messageHistory.reduce(
      (acc, message) => acc + message.content.length,
      0
    );
  }
}

function resetMessageHistory() {
  // Reset the message history while keeping the chatInjection messages
  messageHistory = chatInjection;
}

let streamTimeout;
const streamLimitMs = 5000;

async function main(prompt, onData, resetHistory = false) {
  if (resetHistory) {
    resetMessageHistory();
  }

  // Update the history with the new user prompt
  messageHistory.push({ role: "user", content: prompt });
  checkMessageHistory();

  let responseBuffer = ""; // Buffer to store response chunks

  return new Promise(async (resolve, reject) => {
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
          console.log("[gpt-discord.js] Stream timeout.");
          onData(" " + stopcharacter);
        }, streamLimitMs);
      }
    } catch (error) {
      console.error("Stream error:", error);
      reject(error);
    } finally {
      // Ensure the Promise is resolved when the stream ends, regardless of finish_reason
      // Push the complete response to the message history
      messageHistory.push({ role: "assistant", content: responseBuffer });
      checkMessageHistory();

      resolve();
    }

    // Log at the end of cycle
    console.log(
      `[gpt-discord.js] Messages in context : ${messageHistory.length}`
    );
  });
}

module.exports = main;
