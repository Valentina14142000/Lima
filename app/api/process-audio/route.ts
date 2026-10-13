import { NextRequest, NextResponse } from 'next/server';
import Groq, { toFile } from 'groq-sdk';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Detect the real container from the first bytes instead of trusting the browser's label.
function sniff(b: Buffer): { ext: string; type: string } | null {
  if (b.length < 12) return null;
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { ext: 'webm', type: 'audio/webm' };
  if (b.toString('ascii', 4, 8) === 'ftyp') return { ext: 'm4a', type: 'audio/mp4' };
  if (b.toString('ascii', 0, 4) === 'OggS') return { ext: 'ogg', type: 'audio/ogg' };
  if (b.toString('ascii', 0, 4) === 'RIFF') return { ext: 'wav', type: 'audio/wav' };
  if (b.toString('ascii', 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return { ext: 'mp3', type: 'audio/mpeg' };
  return null;
}

const PREFERRED = ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'];

// Ask Groq which models this key can use, then try the best available ones in order.
async function chatWithFallback(groq: Groq, transcript: string) {
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an executive assistant. Read the voice transcript and return ONLY valid JSON with keys: "title" (short string), "summary" (string), "actionItems" (array of strings).',
    },
    { role: 'user' as const, content: transcript },
  ];
  let ids: string[] = [];
  try {
    const list = await groq.models.list();
    ids = (list.data ?? []).map((m) => m.id);
  } catch {
    /* fall back to the preferred list below */
  }
  const usable = ids.filter((id) => !/whisper|guard|tts|playai|orpheus|embed/i.test(id));
  const candidates = [
    process.env.GROQ_CHAT_MODEL,
    ...PREFERRED.filter((m) => usable.includes(m)),
    ...usable,
    ...(usable.length ? [] : PREFERRED),
  ]
    .filter((m, i, a): m is string => !!m && a.indexOf(m) === i)
    .slice(0, 6);

  let last: unknown;
  for (const model of candidates) {
    try {
      return await groq.chat.completions.create({ model, response_format: { type: 'json_object' }, messages });
    } catch (e) {
      last = e;
      const status = (e as { status?: number }).status;
      if (status && status !== 404 && status !== 400) throw e;
    }
  }
  throw last ?? new Error('No chat model is available for this Groq key.');
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Server is missing GROQ_API_KEY.' }, { status: 500 });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const form = await req.formData();
    const raw = (form.get('file') ?? form.get('audio')) as Blob | null;
    if (!raw || raw.size < 2000) {
      return NextResponse.json(
        { error: 'The recording was empty or too short. Speak for at least a second, then tap stop.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await raw.arrayBuffer());
    const kind = sniff(buffer);
    if (!kind) {
      return NextResponse.json(
        { error: 'This browser produced an audio format that could not be read. Try Chrome or Safari 18+.' },
        { status: 415 },
      );
    }

    const audioFile = await toFile(buffer, `recording.${kind.ext}`, { type: kind.type });
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
    });
    const transcript = (transcription.text ?? '').trim();

    if (!transcript) {
      return NextResponse.json({
        transcript: '',
        result: { title: 'No speech detected', summary: 'No speech was detected in the recording.', actionItems: [] },
      });
    }

    const completion = await chatWithFallback(groq, transcript);

    let result: { title?: string; summary?: string; actionItems?: string[] } = {};
    try {
      result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch {
      result = { title: 'Voice note', summary: transcript, actionItems: [] };
    }
    return NextResponse.json({
      transcript,
      result: {
        title: result.title || 'Voice note',
        summary: result.summary || transcript,
        actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
      },
    });
  } catch (error) {
    const e = error as { message?: string; status?: number };
    console.error('process-audio error:', e);
    return NextResponse.json({ error: e.message || 'Failed to process audio' }, { status: 500 });
  }
}
