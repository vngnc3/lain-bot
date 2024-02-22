// Basic openai setup with stream

require('dotenv').config()
const OpenAI = require('openai'); // Import OpenAI library

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY});

async function main(prompt) {
    const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        stream: true,
    });
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}

main('What do you think about Kanye West?');