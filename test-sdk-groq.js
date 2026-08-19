require('dotenv').config();
const { createOpenAI } = require('@ai-sdk/openai');
const { streamObject } = require('ai');
const { z } = require('zod');

async function test() {
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
  });

  const model = groq('groq/compound-mini', { structuredOutputs: false });

  try {
    const result = await streamObject({
      model,
      schema: z.object({ message: z.string() }),
      prompt: "Say Hello",
    });

    for await (const chunk of result.partialObjectStream) {
      console.log(chunk);
    }
  } catch (e) {
    console.error("SDK Error:", e.message || e);
  }
}
test();
