// lain-bot: shims are javascript functions that call an API and returns the result with context;
// lain-bot: use naturalize to understand API responses.
// lain-bot: result must always have a prompt and a URL.

// this script returns a JSON object containing hello world;

const naturalize = require("../naturalize.js");

function main() {
    const data = {
        "context": "this is just a test API response returning a key-value pair of hello and world.",
        "hello": "world"
    };
    const jsonData = JSON.stringify(data, 4, null);
    const prompt = naturalize(jsonData);
    const result = {
        "prompt": prompt,
        "url": null
    }
    return result;
}

module.exports = main;