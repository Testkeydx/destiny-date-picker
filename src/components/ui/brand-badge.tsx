import { cn } from "@/lib/utils";

interface BrandBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "glass" | "minimal";
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm", 
  lg: "px-4 py-2 text-base",
};

const variantClasses = {
  default: "bg-gradient-primary text-white shadow-sm",
  glass: "bg-surface-glass backdrop-blur-sm border border-white/20 text-foreground",
  minimal: "bg-transparent text-foreground-muted border border-border",
};

export function BrandBadge({ 
  className, 
  size = "md", 
  variant = "default" 
}: BrandBadgeProps) {
  return (
    <a
      href="https://upangea.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-glow",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      Powered by UPangea
    </a>
  );
}