import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ScoreChipProps {
  children: ReactNode;
  variant?: "positive" | "neutral" | "negative";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  positive: "bg-positive/10 text-positive border-positive/20",
  neutral: "bg-neutral/10 text-neutral border-neutral/20", 
  negative: "bg-negative/10 text-negative border-negative/20",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function ScoreChip({ 
  children, 
  variant = "neutral", 
  size = "sm",
  className 
}: ScoreChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}