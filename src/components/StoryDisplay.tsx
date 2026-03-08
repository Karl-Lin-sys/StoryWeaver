import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { generateSpeech } from '../lib/gemini';

interface StoryDisplayProps {
  storyText: string;
}

export function StoryDisplay({ storyText }: StoryDisplayProps) {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset audio when story changes
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [storyText]);

  const handlePlayAudio = async () => {
    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const base64Audio = await generateSpeech(storyText);
      if (base64Audio) {
        const url = `data:audio/pcm;rate=24000;base64,${base64Audio}`;
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-medium text-black">The Opening</h2>
        <button
          onClick={handlePlayAudio}
          disabled={isGeneratingAudio}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAudio ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Voice...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              {audioUrl ? <Play className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Read Aloud
            </>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto prose prose-slate prose-p:leading-relaxed prose-p:font-serif prose-p:text-lg text-black/80">
        <p>{storyText}</p>
      </div>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </div>
  );
}
