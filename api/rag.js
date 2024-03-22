// rag: actual online retrieval using internet-connected LLM

require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
});

// Configure model
// Perform rag by querying PPLX-SONAR-7B model through openrouter
const openaiConfig = {
  model: "perplexity/sonar-small-online",
  temperature: 0.05,
  presence_penalty: 0,
  stream: false,
};

function createResponseString(query, result) {
  return `** SYSTEM MESSAGE -- The user used the realtime retrieval tool with this query: "${query}"; And the tool returned this: "${result}"; Given the user query and the retrieved information, respond to the user's query as LAIN. -- END OF SYSTEM MESSAGE **`;
}

async function search(query) {
  console.log(`[rag.js] Performing search using query: ${query}`);
  openaiConfig.messages = [
    {
      role: "user",
      content: query,
    },
  ];
  const res = await openai.chat.completions.create(openaiConfig);
  console.log(res.choices[0].message.content);
  return res.choices[0].message.content;
}

async function main(ogquery, optimizedQuery) {
  // Return everything as a string, use createResponseString
  try {
    const response = await search(optimizedQuery);
    const responseString = createResponseString(ogquery, response);
    return responseString;
  } catch (error) {
    console.error(error);
  }
}

// Export
module.exports = main;
