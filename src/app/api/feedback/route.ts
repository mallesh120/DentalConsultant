import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { procedure, persona, language, isPositive, comment } = body;

    if (!procedure || !persona || !language || typeof isPositive !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        procedure,
        persona,
        language,
        isPositive,
        comment: comment || null,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
