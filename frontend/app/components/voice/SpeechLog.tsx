import type { SpeechLogEntry } from "@/app/types";

interface SpeechLogProps {
  entries: SpeechLogEntry[];
  maxHeight?: string;
}

const typeStyles: Record<SpeechLogEntry["type"], string> = {
  start: "text-black dark:text-white",
  end: "text-black dark:text-white",
  error: "text-red-500",
  info: "text-neutral-500 dark:text-neutral-400",
};

export function SpeechLog({ entries, maxHeight = "200px" }: SpeechLogProps) {
  if (entries.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Activity Log
        </h3>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {entries.length} events
        </span>
      </div>

      <div
        className="overflow-y-auto scrollbar-thin"
        style={{ maxHeight }}
      >
        <div className="space-y-1">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`
                flex items-start gap-3 py-2 px-3
                rounded-lg transition-colors
                hover:bg-neutral-100 dark:hover:bg-neutral-900
                ${index === entries.length - 1 ? "animate-fade-in" : ""}
              `}
            >
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5 shrink-0">
                {entry.timestamp}
              </span>
              <p className={`text-sm font-mono ${typeStyles[entry.type]}`}>
                {entry.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
