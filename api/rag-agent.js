const OpenAI = require("openai");
const rag = require("../api/rag.js");

const openai = new OpenAI({
  baseURL: "https://api.endpoints.anyscale.com/v1",
  apiKey: process.env.ANYSCALE_KEY,
});

const instruction = `You are an AI agent tasked to rewrite the user message into the most direct and most concise query to a search engine. Your objective is to understand the user's intent and rewrite it into the perfect query for use in a search engine. Never add notes, opinion, or any other information that the user did not provide you in the first place.`;

let messageHistory = [
  {
    role: "system",
    content: instruction,
  },
  // Few shots example
  {
    role: "user",
    content: "what's the weather like in tokyo, japan today?",
  },
  {
    role: "assistant",
    content:
      "Weather in Tokyo, Japan today in metric unit, with temperature, humidity and chance of rain",
  },
  {
    role: "user",
    content: "how is the bitcoin price movement today?",
  },
  {
    role: "assistant",
    content: "bitcoin price analysis today",
  },
  {
    role: "user",
    content: "who are the Indonesian presidential candidates of 2024?",
  },
  {
    role: "assistant",
    content: "list of Indonesian presidential candidate 2024",
  },
  {
    role: "user",
    content: "what's the best DDR5 RAM available today",
  },
  {
    role: "assistant",
    content: "best DDR5 RAM in the market, january 2024",
  },
  {
    role: "user",
    content: "i want to know more about the assassination of shinzo abe",
  },
  {
    role: "assistant",
    content: "the assassination of shinzo abe",
  },
  {
    role: "user",
    content: "what is the history behind the colosseum in rome, italy",
  },
  {
    role: "assistant",
    content: "history colosseum rome italy",
  },
  {
    role: "user",
    content: "whats the latest news on the conflict between russia and ukraine",
  },
  {
    role: "assistant",
    content: "latest news russia ukraine conflict",
  },
];

async function main(prompt) {
  // Inject latest prompt to messageHistory
  messageHistory.push({ role: "user", content: prompt });

  const result = await openai.chat.completions.create({
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    messages: messageHistory,
    temperature: 0.2, // Keep temperatures low for precision
    seed: 1111, // Manually setting seed for reproducible output
    stream: false,
  });

  // Get optimized query
  let resultContentString = await result.choices[0].message.content;
  return resultContentString;
}

module.exports = main;