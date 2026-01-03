"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AnimatedAudioRecorder() {
  const [open, setOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);

  // Fake live audio levels for animation
  const [levels, setLevels] = React.useState<number[]>([0.2, 0.4, 0.6, 0.3, 0.5]);

  React.useEffect(() => {
    let interval: NodeJS.Timer;
    if (isRecording) {
      interval = setInterval(() => {
        // Randomize heights for the bars to simulate voice
        setLevels(levels.map(() => Math.random() * 0.8 + 0.2));
      }, 200);
    } else {
      setLevels([0.2, 0.2, 0.2, 0.2, 0.2]);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Record Voice
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recording Your Voice</DialogTitle>
          <DialogDescription>
            Speak now! Your voice is being captured.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center mt-6 space-y-6">
          {/* Animated microphone background circle */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"
            } transition-colors duration-300 relative`}
          >
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
              <path d="M19 11v2a7 7 0 01-14 0v-2" />
              <path d="M12 19v3" />
              <path d="M8 22h8" />
            </svg>

            {/* Voice bars animation inside circle */}
            <div className="absolute bottom-4 flex items-end gap-1">
              {levels.map((level, idx) => (
                <div
                  key={idx}
                  className="w-2 bg-white rounded transition-all duration-150"
                  style={{ height: `${level * 50}px` }}
                />
              ))}
            </div>
          </div>

          {/* Start / Stop buttons */}
          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Start
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
