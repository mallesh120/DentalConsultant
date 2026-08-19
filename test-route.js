import { streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';

async function main() {
  const hf = createOpenAI({ 
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseURL: 'https://router.huggingface.co/hf-inference/v1'
  });
  try {
    const result = await streamObject({
      model: hf.chat('HuggingFaceH4/zephyr-7b-beta'), 
      prompt: 'Hello. Output JSON.',
      schema: z.object({ msg: z.string() })
    });
    for await (const chunk of result.partialObjectStream) {
       console.log(chunk);
    }
    console.log('Finished');
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
main();
