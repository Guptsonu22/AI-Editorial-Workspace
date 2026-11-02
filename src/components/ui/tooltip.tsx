import * as React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || <HelpCircle className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />}
      {isVisible && (
        <span
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-xl z-50 pointer-events-none animate-in fade-in-50 duration-150 leading-relaxed text-left",
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-800/60", className)}
      {...props}
    />
  );
}
