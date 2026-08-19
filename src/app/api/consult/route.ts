import { PersonaEnum, PatientResponseSchema, ClinicianResponseSchema } from '@/lib/schemas';
import { streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { procedure, persona, language = 'English' } = body;

    // Validate persona
    const parsedPersona = PersonaEnum.parse(persona);
    
    const searchProcedure = procedure.toLowerCase().trim();

    // Check Cache
    const cached = await prisma.procedureCache.findUnique({
      where: {
        procedure_persona_language: {
          procedure: searchProcedure,
          persona: parsedPersona,
          language
        }
      }
    });

    if (cached) {
      console.log(`[DentalAI] Cache hit for ${searchProcedure} (${parsedPersona}, ${language})`);
      return Response.json(cached.response);
    }

    const systemInstruction = `You are an expert dental AI assistant. The user is in ${parsedPersona.toUpperCase()} MODE. Generate the response entirely in ${language}. ${
      parsedPersona === 'patient' 
      ? 'Speak at a 5th-grade level, be empathetic, and focus on anxiety relief.' 
      : 'Use precise clinical terminology, ADA CDT codes, and provide a SOAP note template.'
    }`;

    const schemaToUse = parsedPersona === 'patient' ? PatientResponseSchema : ClinicianResponseSchema;
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set. Please add it to your .env file or Netlify.');
    }
    
    console.log(`[DentalAI] Routing request to Groq via OpenAI proxy...`);
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
    
    // Use the valid, active Groq model that supports json_schema
    const model = groq('openai/gpt-oss-20b');

    const result = await streamObject({
      model: model,
      system: systemInstruction,
      prompt: `Please detail the following procedure: ${procedure}. Respond in JSON format exactly matching the schema.`,
      schema: schemaToUse,
      temperature: 0.2, // Low temperature for factual consistency
      async onFinish({ object }) {
        if (object) {
          try {
            await prisma.procedureCache.create({
              data: {
                procedure: searchProcedure,
                persona: parsedPersona,
                language,
                response: object as any
              }
            });
            console.log(`[DentalAI] Cached response for ${searchProcedure}`);
          } catch (e) {
            console.error('Failed to cache response:', e);
          }
        }
      }
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process consultation', details: error?.message || String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
