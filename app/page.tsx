'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, FileText, CheckCircle } from 'lucide-react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToServer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (blob: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'voice-note.webm');

    try {
      const res = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setNote(data);
      } else {
        alert(data.error || 'Failed to process audio');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between p-6 md:p-24 font-sans">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Meet Lima • AI Voice Assistant
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Lima Voice Notes</h1>
          <p className="text-zinc-400 text-sm">Speak your thoughts and watch Lima structure them into notes and action items.</p>
        </div>

        {/* Recorder Box */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl backdrop-blur-md">
          {!isRecording && !loading && (
            <button
              onClick={startRecording}
              className="group flex flex-col items-center gap-4 focus:outline-none"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-600/30 group-hover:scale-105">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-300">Tap to talk to Lima</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="group flex flex-col items-center gap-4 focus:outline-none animate-pulse"
            >
              <div className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-rose-600/30">
                <Square className="w-7 h-7 text-white fill-current" />
              </div>
              <span className="text-sm font-medium text-rose-400">Lima is listening... Tap to finish</span>
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <span className="text-sm text-zinc-400">Lima is transcribing and organizing your note...</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {note && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-semibold text-indigo-400">{note.result.title}</h2>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Summary
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                {note.result.summary}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Action Items
              </h3>
              <ul className="space-y-2">
                {note.result.actionItems?.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-zinc-300 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 flex items-start gap-3">
                    <span className="text-indigo-400 font-mono text-xs mt-0.5">0{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-2">
              <details className="text-xs text-zinc-500 cursor-pointer">
                <summary className="hover:text-zinc-400 transition-colors">View raw transcript</summary>
                <p className="mt-2 p-3 bg-zinc-950 rounded-lg text-zinc-400 font-mono text-xs leading-relaxed border border-zinc-800">
                  {note.transcript}
                </p>
              </details>
            </div>
          </div>
        )}

      </div>
      
      <footer className="mt-12 text-xs text-zinc-600">
        Lima AI • Powered by Groq & Whisper
      </footer>
    </main>
  );
}
