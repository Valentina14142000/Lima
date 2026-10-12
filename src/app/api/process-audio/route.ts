import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 1. Transcribe audio using Groq's free Whisper endpoint
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
    });

    const transcriptText = transcription.text;

    // 2. Structure action items and summaries using Groq Llama 3
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that analyzes transcripts and extracts key summary points, action items, and deadlines into clean JSON format.",
        },
        { role: "user", content: transcriptText },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const structuredData = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      transcript: transcriptText,
      result: structuredData,
    });
  } catch (error: any) {
    console.error("Audio processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process audio" },
      { status: 500 }
    );
  }
}
