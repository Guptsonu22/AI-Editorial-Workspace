import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-100 text-zinc-950 shadow-sm hover:bg-zinc-200 hover:shadow",
        secondary:
          "bg-zinc-800 text-zinc-100 border border-zinc-700/80 hover:bg-zinc-700/80 hover:border-zinc-600",
        outline:
          "border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-850 hover:text-zinc-100 hover:border-zinc-700",
        ghost: "text-zinc-400 hover:bg-zinc-850 hover:text-zinc-100",
        destructive:
          "bg-rose-950/80 text-rose-200 border border-rose-800/60 hover:bg-rose-900/90",
        accent:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-500 hover:shadow-blue-500/20",
        emerald:
          "bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
