require("dotenv").config();

const OpenAI = require("openai");
const openai = new OpenAI({
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_KEY,
});

// Initialize a message history array
const instruction = require("./instruction");
const examples = require("./examples");
let systemMessage = [
  {
    role: "system",
    content: instruction,
  },
];

let messageHistory = systemMessage.concat(examples);

// Configure openai
const openaiConfig = {
  model: "teknium/OpenHermes-2p5-Mistral-7B",
  max_tokens: 2048,
  messages: messageHistory,
  temperature: 0.79, // Raise the temperature a bit for variety in response
  presence_penalty: 0.99,
  stream: true,
};

const joshpanmode = false; // write like josh pan, lowercase all response when set to true
const stopcharacter = "🞇"; // append whitespace and then this character at the very end of the stream.
const MAX_WORDS_LENGTH = 8000;
// maximum total words allowed in messageHistory including system instruction and current user prompt.
// mixtral8x7b has 32768 context window
// mistral7b has 8K context window

// Message history management
function wordCount(str) {
  return str.split(" ").filter(function (n) {
    return n != "";
  }).length;
}

function checkMessageHistory() {
  let totalWords = messageHistory.reduce(
    (acc, message) => acc + wordCount(message.content),
    0
  );

  while (totalWords > MAX_WORDS_LENGTH && messageHistory.length > 2) {
    messageHistory.splice(1, 1); // Remove the oldest user/assistant message
    totalWords = messageHistory.reduce(
      (acc, message) => acc + wordCount(message.content),
      0
    );
  }
}

function resetMessageHistory() {
  // Reset the message history while keeping the first system message
  messageHistory = [messageHistory[0]];
}

let streamTimeout;

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

        // Set a timeout that will mark the stream as complete if no new data is received within 5 seconds
        streamTimeout = setTimeout(() => {
          console.log("[gpt-discord.js] Stream timeout.");
          onData(" " + stopcharacter);
        }, 5000);
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
    console.log(
      `[gpt-discord.js] Words in context    : ${messageHistory.reduce(
        (acc, message) => acc + wordCount(message.content),
        0
      )}`
    );
  });
}

module.exports = main;
