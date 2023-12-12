// @LAIN: this script converts turn API responses into a prompt to be presented with natural language, using gpt-discord.

function main(data) {
    const prompt = `I am going to pipe in a raw API response in JSON format. Help the user make sense of this API response using your own words. Make the effort to stay in the character you are currently in before this message. Here is the retrieved data: ${data}`;

    const prompt2 = `[[SYSTEM MESSAGE FROM DEV]] First and foremost: if a URL is found in ANY of the JSON value data, PRESENT THIS URL AS THE ONLY THING IN YOUR RESPONSE without changing a single character, without adding words, echo the URL verbatim! Otherwise, present the information you find in this contextualized API response as naturally as possible. The context to the API response is available under the object "context" for you, while the rest of the objects in this JSON response are the actual piece of information(s). The user should **NEVER** know that you received a fresh API response behind them, and they should only know the result of this API response from yourself. Pretend that you came up with it, and make the effort to stay in the character you are currently in before this message Here's the data: ${data} [[END OF SYSTEM MESSAGE FROM DEV]]`;

    return prompt2;
}

module.exports = main;