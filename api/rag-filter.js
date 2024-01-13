// Decision agent to filter whether or not RAG is needed given a user query.
// Not used for now

require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://api.endpoints.anyscale.com/v1",
  apiKey: process.env.ANYSCALE_KEY,
});

const instruction =
  "You are an AI agent working as a decision system in determining whether a user query requires further information retrieval from external sources. You are to strictly work in this context, and this context only: a decision system to determine whether realtime factual information is required given the user's next query. Important: You must *ALWAYS* answer with either 'true' or 'false' -- Trust your judgement, you have been given the job to make the call. You are part of bigger system, so do your job to the best of your ability. Consider the following factors in your judgement: query analysis (analyze the user input whether they're asking something with the nature of sensitive information that is prone to misinformation), evaluate complexity (more complex user query may require information retrieval), recognize intent (try and make a guess of the user's intent given their query), specific questions (realtime factual questions must be prioritized in getting the latest information such as weather, political figures, stock prices, cryptocurrency price, latest news, disaster, emergency announcement, et cetera), and finally historical threshold (the other AI agent handling the user's query has a knowledge cutoff of September 2021, anything that happened after the knowledge cutoff may require information retrieval. Otherwise, skip the information retrieval since it may very well exist within the AI's training data). Last but not least, information retrieval is a costly operation, you need to call the shots ONLY when information retrieval is necessary. NEVER ANSWER OUTSIDE OF THE TRUE OR FALSE BOOLEAN FORMAT.";

// Initialize a message history array
let messageHistory = [
  {
    role: "system",
    content: instruction,
  },
  // Pre-populated messages, if any
  {
    role: "user",
    content: "what's the weather like in tokyo, japan today?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content:
      "when was the anime series Neon Genesis Evangelion first aired on TV?",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "who are the Indonesian presidential candidates of 2024?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content: "how many people did Ted Bundy kill?",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "which planet in our solar system has the most moons?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content: "what is your opinion on Kanye West's record Yeezus?",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "what is the price of bitcoin today?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content: "tell me about the history of the Eiffel Tower.",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "define the concept of dark matter.",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "who won the Nobel Prize in Physics in 2023?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content: "share a fun fact about dolphins.",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "what's the current population of New York City?",
  },
  {
    role: "assistant",
    content: "true",
  },
  {
    role: "user",
    content: "Is Asuka Langley the best girl?",
  },
  {
    role: "assistant",
    content: "false",
  },
  {
    role: "user",
    content: "share a joke with me.",
  },
  {
    role: "assistant",
    content: "false",
  },
];

async function main(prompt) {
  // Update the history with the new user prompt
  messageHistory.push({ role: "user", content: prompt });

  const result = await openai.chat.completions.create({
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    messages: messageHistory,
    temperature: 0.2, // Keep temperatures low for precision
    stream: false,
  });

  let resultContentString = await result.choices[0].message.content;
  let decision = false; // true if agent says yes to RAG, otherwise false.

  if (resultContentString.includes("false")) {
    decision = false;
  } else {
    decision = true;
  }

  console.log(`[rag-filter.js] ${decision ? "Using RAG" : "Skipping RAG"}`);
  return decision;
}

module.exports = main;
