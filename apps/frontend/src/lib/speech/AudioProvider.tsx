import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import { API } from "common/src/api/endpoints.ts";

export const AudioProvider: FC<PropsWithChildren> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleTrack = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const track = custom.detail;
      if (track.trim() === "" || !audioRef.current) return;
      const audio = audioRef.current;

      // stop anything currently playing
      audio.pause();
      audio.src = "";
      audio.load();

      // play the track
      audio.src = track;
      audio.load();
      audio.play().catch((err) => console.error("Playback error:", err));
    };

    const handlePrompt = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const prompt = custom.detail;
      console.log(`Proompting Wongbot... (Prompt: ${prompt})`);
      if (prompt.trim() === "" || !audioRef.current) return;
      const audio = audioRef.current;

      // stop anything currently playing
      audio.pause();
      audio.src = "";
      audio.load();

      // build the get url so <audio> will stream it
      const params = new URLSearchParams({ prompt });
      audio.src = `${API.WONGBOT.STREAM.ROUTE}?${params}`;
      audio.load();
      audio.play().catch((err) => console.error("Playback error:", err));
    };

    const handleStop = (e: Event) => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      audio.pause();
      // clearing src & re-loading cancels the fetch under the hood
      audio.src = "";
      audio.load();
    };

    window.addEventListener("prompt_wongbot", handlePrompt);
    window.addEventListener("stop_audio_track", handleStop);
    window.addEventListener("play_audio_track", handleTrack);
    return () => {
      window.removeEventListener("prompt_wongbot", handlePrompt);
      window.removeEventListener("stop_audio_track", handleStop);
      window.removeEventListener("play_audio_track", handleTrack);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} className={"hidden"} />
      <>{children}</>
    </>
  );
};
