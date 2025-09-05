import { FC, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useTheme } from "@/lib/theme-provider.tsx";
import { clsx } from "clsx";
import { Outlet } from "react-router";
import { SpeechProvider } from "@/lib/speech/use-speech.tsx";
import { AudioProvider } from "@/lib/speech/AudioProvider.tsx";

export const Route: FC = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const darkModeVoice = (e: Event) => {
      console.log("darkmodevoice triggered");
      console.log("current theme: ", theme);
      setTheme(theme === "light" ? "dark" : "light");
      console.log("current after set theme: ", theme);
    };

    window.addEventListener("darkMode", darkModeVoice);

    return () => {
      window.removeEventListener("darkMode", darkModeVoice);
    };
  }, [theme]);
  return (
    <>
      <AudioProvider>
        <SpeechProvider>
          <Toaster richColors theme={theme} />
          <div
            className={clsx(
              "h-dvh w-dvw overflow-auto bg-cover transition-[background-image] duration-500",
              theme === "dark" ? "bg-[url('/images/art/bg-dark.svg')]" : "bg-[url('/images/art/bg-light.svg')]"
            )}
          >
            <Outlet />
          </div>
        </SpeechProvider>
      </AudioProvider>
    </>
  );
};
