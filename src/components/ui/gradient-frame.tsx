import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientFrameProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "hero" | "surface" | "glass";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const variantClasses = {
  default: "bg-surface shadow-md border border-border/50",
  hero: "bg-gradient-hero shadow-lg",
  surface: "bg-gradient-surface shadow-md",
  glass: "bg-surface-glass backdrop-blur-sm border border-white/20 shadow-md",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6", 
  lg: "p-8",
  xl: "p-10",
};

export function GradientFrame({ 
  children, 
  className, 
  variant = "default", 
  padding = "md" 
}: GradientFrameProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}