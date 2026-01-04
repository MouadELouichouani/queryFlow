"use client";

import * as React from "react";
import { Play, Pause, X, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

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
  const circlesRef = React.useRef<HTMLDivElement>(null);

  // Generate animated circles
  React.useEffect(() => {
    if (!circlesRef.current || !open) return;

    const container = circlesRef.current;
    container.innerHTML = '';

    const colors = [
      'rgba(59, 130, 246, 0.3)',  // blue
      'rgba(168, 85, 247, 0.3)',  // purple
      'rgba(236, 72, 153, 0.3)',  // pink
      'rgba(34, 197, 94, 0.3)',   // green
    ];

    for (let i = 0; i < 4; i++) {
      const circle = document.createElement('div');
      circle.className = 'absolute rounded-full animate-pulse';
      circle.style.width = `${100 + i * 30}px`;
      circle.style.height = `${100 + i * 30}px`;
      circle.style.backgroundColor = colors[i];
      circle.style.animationDelay = `${i * 0.2}s`;
      circle.style.animationDuration = `${1.5 + i * 0.3}s`;
      container.appendChild(circle);
    }

    // Add center circle
    const centerCircle = document.createElement('div');
    centerCircle.className = 'absolute rounded-full bg-gradient-to-br from-primary to-purple-600';
    centerCircle.style.width = '80px';
    centerCircle.style.height = '80px';
    container.appendChild(centerCircle);
  }, [open]);

  // Initialize audio
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
        
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
          setIsLoading(false);
        };

        audio.onerror = () => {
          setAudioError("Failed to load audio");
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Error loading audio:", error);
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, open]);

  // Animation loop for progress
  const updateProgress = React.useCallback(() => {
    if (!audioRef.current || !isPlaying) return;

    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  }, [isPlaying]);

  // Play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // Handle slider change
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on close
  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-gradient-to-b from-background to-secondary/10 backdrop-blur-sm">
        {/* Header */}
        <div className="relative p-6 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Audio Player
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Listening to response
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full hover:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center p-8">
          {/* Animated Circles */}
          <div className="relative mb-8">
            <div 
              ref={circlesRef}
              className="relative flex items-center justify-center h-60 w-60"
            >
              {/* Play/Pause Button */}
              <Button
                onClick={togglePlay}
                disabled={isLoading || !!audioError}
                className="absolute w-16 h-16 rounded-full bg-white dark:bg-black shadow-2xl hover:scale-105 transition-all z-10"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading or Error States */}
          {isLoading && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
                <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.1s' }} />
                <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Generating audio...
              </p>
            </div>
          )}

          {audioError && (
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-500">{audioError}</p>
            </div>
          )}

          {/* Text Preview */}
          <div className="w-full mb-8">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Text Preview
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/10 max-h-32 overflow-y-auto">
              <p className="text-sm leading-relaxed">
                {text.length > 200 ? `${text.substring(0, 200)}...` : text}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatTime(currentTime)}</span>
              <span className="font-medium">{formatTime(duration)}</span>
            </div>
            
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              onValueChange={handleTimeChange}
              className="w-full"
              disabled={isLoading || !!audioError}
            />

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1"
                disabled={isLoading || !!audioError}
              />
              <span className="text-sm text-muted-foreground min-w-[2.5rem]">
                {volume}%
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              disabled={isLoading || !!audioError || !isPlaying}
              className="rounded-full"
            >
              Restart
            </Button>
            
            <Button
              variant="default"
              onClick={togglePlay}
              disabled={isLoading || !!audioError}
              className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}