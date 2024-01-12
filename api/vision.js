require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function main(imageUrl) {
  console.log(`[vision.js] Querying gpt-4-vision-preview...`);
  let visionResponse =
    "** SYSTEM MESSAGE || THE USER HAS ATTACHED AN IMAGE TO THIS MESSAGE. USE THE FOLLOWING IMAGE DESCRIPTION TO UNDERSTAND THE IMAGE ATTACHED IN THIS MESSAGE: ";

  const suffix = " || END OF SYSTEM MESSAGE **";

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    temperature: 0.2,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe what's in the image." },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
  });

  // Set response
  visionResponse += response.choices[0].message.content + suffix;
  console.log(`[vision.js] Done.`);
  return visionResponse;
}

module.exports = main;
