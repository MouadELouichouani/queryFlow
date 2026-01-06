"use client";

import * as React from "react";
import { Play, Pause, X, Volume2, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerDialogProps {
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AudioPlayerDialog({ text, open, onOpenChange }: AudioPlayerDialogProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioError, setAudioError] = React.useState<string | null>(null);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const animationRef = React.useRef<number>(0);

  // Initialize audio logic
  React.useEffect(() => {
    if (!text || !open) return;

    const initAudio = async () => {
      setIsLoading(true);
      setAudioError(null);
      
      try {
        const res = await fetch("http://localhost:5000/api/tts/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error("TTS request failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) URL.revokeObjectURL(audioRef.current.src);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };

        audio.onerror = () => {
          setAudioError("Failed to load audio");
          setIsLoading(false);
        };
      } catch (error) {
        setAudioError("Failed to generate audio");
        setIsLoading(false);
      }
    };

    initAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [text, open]);

  const updateProgress = React.useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 gap-0 overflow-hidden">
        
        {/* Header - Strictly B&W */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold tracking-tight">Audio Preview</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* Animated Area */}
          <div className="relative h-48 w-48 flex items-center justify-center mb-8">
            {/* Colorful pulse rings - Only visible when playing */}
            {isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute rounded-full border-2 opacity-0 animate-ping",
                      i === 0 ? "border-blue-400" : i === 1 ? "border-purple-400" : "border-pink-400"
                    )}
                    style={{
                      width: '100%',
                      height: '100%',
                      animationDuration: `${2 + i}s`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Center Circle Button */}
            {/* Animated Area */}
            <div className="relative h-64 w-64 flex items-center justify-center mb-4">
              {/* Concentric Sound Waves (Visible only when playing) */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Wave 1 - Blueish */}
                  <div className="absolute h-32 w-32 rounded-full bg-blue-400/20 animate-[ping_2s_linear_infinite]" />
                  {/* Wave 2 - Purplish */}
                  <div className="absolute h-32 w-32 rounded-full bg-purple-400/20 animate-[ping_2s_linear_infinite_0.5s]" />
                  {/* Wave 3 - Pinkish */}
                  <div className="absolute h-32 w-32 rounded-full bg-pink-400/20 animate-[ping_2s_linear_infinite_1s]" />
                  
                  {/* Static background glow to blend colors */}
                  <div className="absolute h-40 w-40 rounded-full from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl animate-pulse" />
                </div>
              )}

              {/* Main Button */}
              <Button
                onClick={togglePlay}
                disabled={isLoading || !!audioError}
                size="icon"
                className={cn(
                  "relative h-28 w-28 rounded-full shadow-2xl transition-all duration-500 z-10 border-8",
                  "border-white dark:border-zinc-950", // Thick border creates a "cutout" look
                  isPlaying 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black scale-110 animate-pulse shadow-purple-500/20" 
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white scale-100",
                  isLoading && "animate-pulse"
                )}
              >
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-1">
                    {/* Minimalist visualizer bars inside the button */}
                    {/* <span className="w-1.5 h-6 bg-current rounded-full animate-[bounce_1s_infinite_0s]" />
                    <span className="w-1.5 h-8 bg-current rounded-full animate-[bounce_1s_infinite_0.2s]" />
                    <span className="w-1.5 h-6 bg-current rounded-full animate-[bounce_1s_infinite_0.4s]" /> */}
                  </div>
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Text Summary */}
          <div className="w-full border rounded-lg p-3 mb-6">
             <p className="text-xs dark:text-white/60 text-black/60 italic">
               "{text}"
             </p>
          </div>

          {/* Controls - Monochrome Slider */}
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 1}
                step={0.1}
                onValueChange={handleTimeChange}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 flex-1">
                <Volume2 className="h-4 w-4 text-zinc-400" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    setVolume(v[0]);
                    if (audioRef.current) audioRef.current.volume = v[0] / 100;
                  }}
                  className="w-24"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-9 w-9 p-0"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-full px-6 font-semibold"
                  onClick={togglePlay}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {audioError && (
          <div className="bg-red-50 dark:bg-red-950/20 p-3 text-center">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{audioError}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}