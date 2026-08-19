const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

async function main() {
  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello, testing 1 2 3',
    });
    console.log('SUCCESS:', text);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
main();
