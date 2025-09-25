import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

export function ProgressRing({
  value,
  size = 60,
  strokeWidth = 4,
  className,
  showValue = true,
}: ProgressRingProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return "hsl(var(--positive))";
    if (val >= 60) return "hsl(var(--upangea-blue))"; 
    if (val >= 40) return "hsl(var(--accent))";
    return "hsl(var(--neutral))";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(normalizedValue)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-smooth"
        />
      </svg>
      {showValue && (
        <span className="absolute text-sm font-semibold text-foreground">
          {Math.round(normalizedValue)}
        </span>
      )}
    </div>
  );
}