// lain-bot: shims are javascript functions that call an API and returns the result with context;
// lain-bot: use naturalize to understand API responses. otherwise, pipe the result directly.
// lain-bot: result must always have a prompt and a URL.

// returns a random archillect image;

const naturalize = require("../naturalize.js");
const fetch = require("node-fetch");

async function archillectLatest() {
  const url = "https://archillect.mhsattarian.workers.dev/api/last";

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
    const data = await archillectLatest();
    if (data) {
      const randomArchillect = Math.floor(Math.random() * data.lastID);
      const url = `https://archillect.com/${randomArchillect}`;
      const result = {
        "prompt": "In one word, describe an image you might find on Archillect. Keep being Lain.",
        "url": url
      }
      return result;
    }
  }

module.exports = main;