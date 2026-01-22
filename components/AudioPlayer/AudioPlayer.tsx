"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface FoxyoAudioPlayerProps {
  src: string;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function AudioPlayer({ src }: FoxyoAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const displayVolume = isMuted ? 0 : volume;

  const [bars] = useState(
    () => Array.from({ length: 30 }, () => Math.random() * 0.9 + 0.3) // TODO: Increase the number of bars
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(audio.volume);
    setIsMuted(audio.muted);

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleVolumeChange = () => {
      if (audio) {
        setVolume(audio.volume);
        setIsMuted(audio.muted);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("volumechange", handleVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="flex flex-col gap-2 
        bg-[#F2F3F5] dark:bg-gray-800/80 p-3 rounded-xl 
        border border-gray-200 dark:border-gray-700/50 
        min-w-[280px] max-w-[400px] w-full shadow-sm"
    >
      <audio ref={audioRef} src={src} preload="metadata" data-plyr="false" />

      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-400 hover:bg-orange-500 text-white transition-colors shrink-0 shadow-sm"
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-1" />
          )}
        </button>

        <div
          className="flex-1 flex items-center gap-[3px] h-8 cursor-pointer group"
          onClick={togglePlay}
        >
          {bars.map((height, index) => {
            const barPercent = (index / bars.length) * 100;
            const isPlayed = barPercent < progress;

            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-colors duration-100 ${
                  isPlayed
                    ? "bg-orange-400"
                    : "bg-gray-400/50 dark:bg-gray-400/30"
                }`}
                style={{
                  height: `${height * 100}%`,
                  minHeight: "15%",
                }}
              />
            );
          })}
        </div>

        <div className="text-xs font-mono text-orange-300 dark:text-orange-300 tabular-nums min-w-[35px] text-right">
          {isPlaying
            ? formatDuration(currentTime)
            : formatDuration(duration || 0)}
        </div>
      </div>

      <div className="flex items-center gap-2 px-1 pt-1 border-t border-gray-200/50 dark:border-gray-700/50 mt-1">
        <button
          onClick={toggleMute}
          className="text-orange-200 dark:text-orange-200 hover:text-orange-300 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={16} />
          ) : (
            <Volume2 size={16} />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={displayVolume}
          onChange={handleVolumeSliderChange}
          className="w-full h-1.5 appearance-none rounded-full bg-orange-300 dark:bg-orange-500 focus:outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff8904 0%, #ff8904 ${
              displayVolume * 100
            }%, rgb(156 163 175 / 0.3) ${
              displayVolume * 100
            }%, rgb(156 163 175 / 0.3) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
