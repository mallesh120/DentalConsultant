import { streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';

async function main() {
  const customFetch = async (url, options) => {
    if (options.body) {
      const body = JSON.parse(options.body);
      if (body.response_format && body.response_format.type === 'json_schema') {
        body.response_format = { type: 'json_object' };
        options.body = JSON.stringify(body);
      }
    }
    return fetch(url, options);
  };

  const openai = createOpenAI({ 
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    fetch: customFetch
  });

  try {
    const result = await streamObject({
      model: openai('llama-3.1-8b-instant'),
      prompt: 'Hello. Reply in JSON.',
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
