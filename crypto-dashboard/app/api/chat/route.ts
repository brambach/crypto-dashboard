import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        {
          error: 'API_KEY_MISSING',
          message: 'Groq API key is not configured. Please add your GROQ_API_KEY to .env.local',
          details: 'Get your FREE API key from https://console.groq.com/keys',
        },
        { status: 401 }
      );
    }

    const groq = new Groq({ apiKey });
    const { message, cryptoData } = await req.json();

    if (!message || !cryptoData) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Message and crypto data are required',
        },
        { status: 400 }
      );
    }

    const cryptoContext = cryptoData
      .map(
        (crypto: any) =>
          `${crypto.name} (${crypto.symbol}): $${crypto.price.toFixed(2)} (24h change: ${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%)`
      )
      .join('\n');

    // Use Groq with Llama 3.3
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a crypto market analyst. Provide helpful, concise analysis based on current prices and trends. Be direct and insightful.',
        },
        {
          role: 'user',
          content: `Here is the current live crypto data:\n\n${cryptoContext}\n\nUser question: ${message}`,
        },
      ],
      stream: true,
      max_tokens: 1024,
    });

    // Create readable stream for client
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);

    // Handle Groq API errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error: 'INVALID_API_KEY',
          message: 'Invalid Groq API key',
          details: 'Check your GROQ_API_KEY in .env.local. Get a FREE key from https://console.groq.com/keys',
        },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: 'Rate limit exceeded. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
