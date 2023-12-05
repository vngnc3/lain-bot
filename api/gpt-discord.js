require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function main(prompt, onData) {
    return new Promise(async (resolve, reject) => {
        const stream = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        try {
            for await (const chunk of stream) {
                if (chunk.choices[0]?.delta?.content) {
                    onData(chunk.choices[0].delta.content);
                }
            }
            resolve(); // Resolve the promise when the stream ends
        } catch (error) {
            reject(error); // Reject the promise in case of an error
        }
    });
}

module.exports = main;