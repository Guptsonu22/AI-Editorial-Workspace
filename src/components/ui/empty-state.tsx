"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  badge?: string;
  tip?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  badge,
  tip,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex min-h-[480px] w-full flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center backdrop-blur-sm",
        className
      )}
    >
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
        <Icon className="h-7 w-7 text-zinc-300" />
        {badge && (
          <span className="absolute -top-1.5 -right-2 rounded-full border border-blue-500/40 bg-blue-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300 shadow">
            {badge}
          </span>
        )}
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {children && <div className="mt-6 w-full max-w-lg">{children}</div>}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          actionHref ? (
            <a href={actionHref}>
              <Button variant="accent" className="shadow-sm">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button variant="accent" onClick={onAction} className="shadow-sm">
              {actionLabel}
            </Button>
          )
        )}

        {secondaryActionLabel && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>

      {tip && (
        <div className="mt-8 rounded-lg border border-zinc-850 bg-zinc-950/60 px-4 py-2 text-xs text-zinc-400 max-w-sm">
          <span className="font-semibold text-zinc-300">Editorial Standard:</span>{" "}
          {tip}
        </div>
      )}
    </motion.div>
  );
}
