import { NextRequest, NextResponse } from 'next/server';
import { CurioBot } from '@/lib/curiobot';

const curioBot = new CurioBot();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, phase, userId, experimentId, conversationHistory } = body;

    if (!message || !phase) {
      return NextResponse.json(
        { error: 'Message and phase are required' },
        { status: 400 }
      );
    }

    // Generate CurioBot response
    const response = await curioBot.generateResponse(
      message,
      phase,
      conversationHistory || []
    );

    // In a real implementation, you would:
    // 1. Save the conversation to the database
    // 2. Update user progress
    // 3. Handle experiment state changes
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
