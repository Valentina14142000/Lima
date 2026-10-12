import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  let tempFilePath = "";
  try {
    const formData = await req.formData();
    const rawFile = formData.get("file") as Blob | File | null;

    if (!rawFile || rawFile.size === 0) {
      return NextResponse.json(
        { error: "Audio recording was empty or missing. Please try recording again." },
        { status: 400 }
      );
    }

    const bytes = await rawFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    tempFilePath = join(tmpdir(), `upload-${Date.now()}.webm`);
    await writeFile(tempFilePath, buffer);

    const fileStream = createReadStream(tempFilePath);

    const transcription = await groq.audio.transcriptions.create({
      file: fileStream as any,
      model: "whisper-large-v3-turbo",
    });

    await unlink(tempFilePath).catch(() => {});

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
          role: "system",
          content:
            "You are an assistant that analyzes transcripts and extracts key summary points, action items, and deadlines into clean JSON format with keys: summary, actionItems, deadlines.",
        },
        { role: "user", content: transcriptText },
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
    });

    const structuredData = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      transcript: transcriptText,
      result: structuredData,
    });
  } catch (error: any) {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }
    console.error("Audio processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process audio" },
      { status: 500 }
    );
  }
}
