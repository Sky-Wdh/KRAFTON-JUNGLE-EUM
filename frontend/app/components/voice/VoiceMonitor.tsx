"use client";

import { useVoiceActivity } from "@/app/hooks";
import { Button, StatusIndicator, AudioLevelBar } from "@/app/components/ui";
import { SpeechLog } from "./SpeechLog";
import type { ConnectionState } from "@/app/services/audioSocket";

type VADStatus = "idle" | "listening" | "speaking" | "loading" | "error";

function getVADStatus(vad: {
  loading: boolean;
  errored: string | false;
  listening: boolean;
  userSpeaking: boolean;
}): VADStatus {
  if (vad.loading) return "loading";
  if (vad.errored) return "error";
  if (!vad.listening) return "idle";
  if (vad.userSpeaking) return "speaking";
  return "listening";
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const config: Record<ConnectionState, { dot: string; text: string; label: string }> = {
    connected: {
      dot: "bg-black dark:bg-white",
      text: "text-black dark:text-white",
      label: "Connected",
    },
    connecting: {
      dot: "bg-neutral-400 animate-pulse",
      text: "text-neutral-500",
      label: "Connecting...",
    },
    disconnected: {
      dot: "bg-neutral-300 dark:bg-neutral-700",
      text: "text-neutral-400 dark:text-neutral-500",
      label: "Disconnected",
    },
    error: {
      dot: "bg-red-500",
      text: "text-red-500",
      label: "Error",
    },
  };

  const { dot, text, label } = config[state];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
}

export function VoiceMonitor() {
  const vad = useVoiceActivity({ autoPlayback: true, useEchoServer: true });
  const status = getVADStatus(vad);

  return (
    <div className="w-full max-w-md mx-auto px-6 py-12">
      {/* Main Card */}
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">
        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <ConnectionBadge state={vad.connectionState} />
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center mb-8">
          <StatusIndicator status={status} size="lg" />
        </div>

        {/* Audio Level */}
        <div className="flex justify-center mb-10">
          <AudioLevelBar level={vad.audioLevel} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => vad.start()}
            disabled={vad.listening || vad.loading}
          >
            Start
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => vad.pause()}
            disabled={!vad.listening}
          >
            Stop
          </Button>
        </div>

        {/* Error Message */}
        {vad.errored && (
          <div className="mb-6 p-4 border border-red-200 dark:border-red-900 rounded-xl bg-red-50 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {vad.errored.toString()}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 my-6" />

        {/* Activity Log */}
        <SpeechLog entries={vad.speechLog} maxHeight="180px" />
      </div>

      {/* Subtitle Overlay */}
      {vad.subtitle && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-fade-in">
          <div className="bg-black/90 dark:bg-white/90 backdrop-blur-md rounded-2xl px-8 py-5 shadow-2xl">
            <p className="text-white dark:text-black text-center text-lg font-medium leading-relaxed">
              {vad.subtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
