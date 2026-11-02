import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200",
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
        outline: "text-zinc-300 border-zinc-700/80",
        emerald:
          "border-emerald-500/30 bg-emerald-950/60 text-emerald-300",
        amber:
          "border-amber-500/30 bg-amber-950/60 text-amber-300",
        purple:
          "border-purple-500/30 bg-purple-950/60 text-purple-300",
        sky:
          "border-sky-500/30 bg-sky-950/60 text-sky-300",
        rose:
          "border-rose-500/30 bg-rose-950/60 text-rose-300",
        indigo:
          "border-indigo-500/30 bg-indigo-950/60 text-indigo-300",
        violet:
          "border-violet-500/30 bg-violet-950/60 text-violet-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
