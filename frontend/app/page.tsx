import { VoiceMonitor } from "@/app/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">EUM</span>
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Real-time Voice AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <VoiceMonitor />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center justify-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Powered by faster-whisper + gRPC
          </p>
        </div>
      </footer>
    </div>
  );
}
