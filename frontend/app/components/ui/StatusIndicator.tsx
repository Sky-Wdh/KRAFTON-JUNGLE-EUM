type Status = "idle" | "listening" | "speaking" | "loading" | "error";

interface StatusIndicatorProps {
  status: Status;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<Status, { label: string; animate: boolean }> = {
  idle: { label: "Ready", animate: false },
  listening: { label: "Listening", animate: true },
  speaking: { label: "Speaking", animate: true },
  loading: { label: "Loading", animate: true },
  error: { label: "Error", animate: false },
};

const sizeStyles = {
  sm: { outer: "w-12 h-12", inner: "w-4 h-4", text: "text-xs" },
  md: { outer: "w-20 h-20", inner: "w-6 h-6", text: "text-sm" },
  lg: { outer: "w-28 h-28", inner: "w-8 h-8", text: "text-base" },
};

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const styles = sizeStyles[size];
  const isActive = status === "listening" || status === "speaking";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular indicator */}
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`
            ${styles.outer} rounded-full
            border-2 transition-colors duration-300
            flex items-center justify-center
            ${isActive
              ? "border-black dark:border-white"
              : "border-neutral-300 dark:border-neutral-700"
            }
          `}
        >
          {/* Pulse ring animation */}
          {config.animate && (
            <div
              className={`
                absolute inset-0 rounded-full
                border-2 border-black dark:border-white
                animate-pulse-ring
              `}
            />
          )}

          {/* Inner dot */}
          <div
            className={`
              ${styles.inner} rounded-full
              transition-all duration-300
              ${isActive
                ? "bg-black dark:bg-white scale-100"
                : status === "error"
                  ? "bg-red-500 scale-100"
                  : "bg-neutral-300 dark:bg-neutral-700 scale-75"
              }
            `}
          />
        </div>
      </div>

      {/* Status label */}
      <span
        className={`
          ${styles.text} font-medium tracking-wide uppercase
          ${isActive
            ? "text-black dark:text-white"
            : "text-neutral-400 dark:text-neutral-500"
          }
        `}
      >
        {config.label}
      </span>
    </div>
  );
}
