import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, buffer);

    // 1. Transcribe audio using Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3',
      response_format: 'json',
    });

    fs.unlinkSync(tempFilePath);

    const rawText = transcription.text;

    // 2. Structure transcript with Groq's Llama model
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an AI executive assistant. Analyze the raw voice transcript and return a clean JSON response with three fields: "title" (string), "summary" (string), and "actionItems" (array of strings). Return ONLY valid JSON.'
        },
        { role: 'user', content: rawText }
      ],
      response_format: { type: 'json_object' }
    });

    const parsedResult = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      transcript: rawText,
      result: parsedResult
    });

  } catch (error: any) {
    console.error('Error processing audio:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
