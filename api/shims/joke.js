// lain-bot: shims are javascript functions that call an API and returns the result with context;
// lain-bot: use naturalize to understand API responses.
// lain-bot: result must always have a prompt and a URL.

// returns a random image from selected subreddits

const subreddits = [
  "hmm",
  "hmmm",
  "memes",
  "dankmemes",
  "PewdiepieSubmissions",
];

const naturalize = require("../naturalize.js");
const fetch = require("node-fetch");

async function getRandomPost() {
  const baseUrl = `https://meme-api.com/gimme/`;
  const sub = subreddits[Math.floor(Math.random() * subreddits.length)];
  const url = baseUrl + sub;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function main() {
    const data = await getRandomPost();
    if (data) {
        const imageUrl = data.url;
        const prompt = `Just say this sentence, nothing else: ${data.title}`;
        const result = {
            "prompt": prompt,
            "url": imageUrl,
        }
        return result;
    }
}

module.exports = main;