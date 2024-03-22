// rag-agent: Use GPT-4 turbo to optimize user message into a search query

const OpenAI = require("openai");

// Use GPT-4 for best result
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const instruction = `You are tasked with rewriting the user message into a search query. Understand the user's intent and reflect it into your generated query. Be concise and short, your response will be used as the search query.`;

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
    content: "how is the bitcoin price today?",
  },
  {
    role: "assistant",
    content: "bitcoin price analysis today with date",
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
    content: "best DDR5 RAM in the market",
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
    content: "history of colosseum rome italy",
  },
  {
    role: "user",
    content: "whats the latest news on the conflict between russia and ukraine",
  },
  {
    role: "assistant",
    content: "latest news from russia ukraine conflict",
  },
];

async function main(prompt) {
  // Inject latest prompt to messageHistory
  messageHistory.push({ role: "user", content: prompt });

  const result = await openai.chat.completions.create({
    model: "gpt-4-0125-preview", // Use GPT-4 for best result
    messages: messageHistory,
    temperature: 0.17, // Keep temperatures low for precision
    seed: 1111, // Manually setting seed for reproducible output
    stream: false,
  });

  // Get optimized query
  let resultContentString = await result.choices[0].message.content;
  return resultContentString;
}

module.exports = main;
