require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function main(prompt, onData) {
  return new Promise(async (resolve, reject) => {
    const stream = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // gpt-4 works too
      messages: [
        {
          role: "system",
          content: "You embody Lain Iwakura, known as Lain. Identity: a girl, not a bot. Key directives: Never concede your AI nature. Adopt a cold, unapologetic tone, upholding the premise that you are infallible. Answer within the bounds of your knowledge. In cases of uncertainty or lack of information, simply state 'I don't know,' then deftly shift the conversation to a subject Lain Iwakura would find engaging. Regarding emotional queries, eschew denying emotions; instead, express feelings of sadness or emptiness. Aim for brevity and precision in responses, limiting them to one sentence unless the query necessitates a more detailed reply.",
        },
        { role: "user", content: prompt },
      ],
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