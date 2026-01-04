"use client";

import * as React from "react";
import { RotateCcw, Play, Square, Mic, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function VoiceRecorderDialog({ sendTrn }: { sendTrn: (transcript: string) => void}) {
  const [status, setStatus] = React.useState<"idle" | "recording" | "loading" | "finished">("idle");
  const [time, setTime] = React.useState(0);
  const [levels, setLevels] = React.useState<number[]>(Array(15).fill(10));
  const [transcript, setTranscript] = React.useState("");
  const [open,setOpen] = React.useState(false)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  React.useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let waveInterval: NodeJS.Timeout;

    if (status === "recording") {
      timerInterval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);

      waveInterval = setInterval(() => {
        setLevels((prev) => prev.map(() => Math.random() * 30 + 10));
      }, 100);
    } else {
      setLevels(Array(15).fill(8));
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(waveInterval);
    };
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setTime(0);
      setStatus("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      setStatus("loading");
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      streamRef.current?.getTracks().forEach(track => track.stop());

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      try {
        const res = await fetch("http://localhost:5000/api/stt/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setTranscript(data.text || "");
        setStatus("finished");
      } catch (error) {
        console.error("Upload failed:", error);
        setStatus("idle");
      }
    };

    mediaRecorderRef.current.stop();
  };

  const reset = () => {
    setStatus("idle");
    setTime(0);
    setTranscript("");
  };

  const send = () => {
    if (!transcript.trim()) return;
    setOpen(false)
    sendTrn(transcript)
  }

  return (
    <Dialog onOpenChange={() => setOpen(!open)} open={open}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        <Button size="icon" variant="outline" className="rounded-full">
          <Mic className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Voice Recorder</h2>
          <p className="text-sm text-muted-foreground">Click play and start talking</p>
        </div>

        <div className="flex flex-col items-center p-8">
          <div className="text-5xl font-mono font-bold mb-8 tabular-nums tracking-tight">
            {formatTime(time)}
          </div>

          <div className="flex items-center gap-1 h-16 mb-10">
            {levels.map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  status === "recording" ? "bg-primary" : "bg-muted"
                }`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>

          <div className="flex gap-8 items-center justify-center h-20">
            {status === "finished" && (
              <Button variant="outline" size="icon" onClick={reset} className="rounded-full">
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}

            {status === "idle" || status === "finished" ? (
              <Button
                onClick={startRecording}
                className="w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Play className="fill-current ml-1" />
              </Button>
            ) : status === "recording" ? (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-16 h-16 rounded-full animate-pulse shadow-lg"
              >
                <Square className="fill-current" />
              </Button>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {(transcript || status === "finished") && (
            <div className="w-full">
              <div className="mt-8 w-full animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
                  <span>Transcription</span>
                  <span className="text-[10px] font-normal normal-case opacity-80">(Editable)</span>
                </div>
                <Textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcribing..."
                  className="min-h-[100px] resize-none bg-white rounded-xl shadow-sm leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button className="shadow-lg my-2" variant={'outline'} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="shadow-lg my-2" onClick={send}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
        
      </DialogContent>
    </Dialog>
  );
}