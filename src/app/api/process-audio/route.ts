import { NextRequest, NextResponse } from "next/server";
import Groq, { toFile } from "groq-sdk";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawFile = formData.get("file") as Blob | File | null;

    if (!rawFile || rawFile.size === 0) {
      return NextResponse.json(
        { error: "Audio recording was empty or missing. Please try recording again." },
        { status: 400 }
      );
    }

    const arrayBuffer = await rawFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Format binary audio stream for Groq Whisper
    const audioFile = await toFile(buffer, "audio.wav", {
      type: "audio/wav",
    });

    // 1. Audio Transcription via Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
    });

    const transcriptText = transcription.text;

    if (!transcriptText || transcriptText.trim() === "") {
      return NextResponse.json({
        transcript: "",
        result: { summary: "No speech detected in the recording.", actionItems: [], deadlines: [] },
      });
    }

    // 2. Action Item Extraction via Standard Free Groq Model
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that analyzes transcripts and extracts key summary points, action items, and deadlines into clean JSON format with keys: summary, actionItems, deadlines.",
        },
        {
          role: "user",
          content: transcriptText,
        },
      ],
      model: "llama-3.1-8b-instant",
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
