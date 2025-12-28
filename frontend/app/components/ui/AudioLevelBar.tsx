interface AudioLevelBarProps {
  level: number;
  className?: string;
}

export function AudioLevelBar({ level, className = "" }: AudioLevelBarProps) {
  const percentage = Math.min(Math.max(level * 100, 0), 100);
  const isActive = percentage > 5;

  return (
    <div className={`w-full max-w-xs ${className}`}>
      {/* Bar container */}
      <div className="relative h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        {/* Level bar */}
        <div
          className={`
            h-full rounded-full
            transition-all duration-75 ease-out
            ${isActive
              ? "bg-black dark:bg-white"
              : "bg-neutral-400 dark:bg-neutral-600"
            }
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Level indicator dots */}
      <div className="flex justify-between mt-2 px-0.5">
        {[...Array(5)].map((_, i) => {
          const threshold = (i + 1) * 20;
          const isLit = percentage >= threshold;
          return (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 rounded-full
                transition-colors duration-100
                ${isLit
                  ? "bg-black dark:bg-white"
                  : "bg-neutral-300 dark:bg-neutral-700"
                }
              `}
            />
          );
        })}
      </div>
    </div>
  );
}
