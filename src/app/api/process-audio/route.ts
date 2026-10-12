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

    // Use Groq's official toFile helper to format the buffer correctly
    const audioFile = await toFile(buffer, "audio.wav", {
      type: "audio/wav",
    });

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

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze this transcript and extract key summary points, action items, and deadlines into a JSON object with keys: summary, actionItems, deadlines. Transcript: "${transcriptText}"`,
        },
      ],
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      reasoning_format: "hidden",
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
