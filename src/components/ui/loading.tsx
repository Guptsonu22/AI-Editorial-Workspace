"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function Spinner({ size = "md", label, className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 text-zinc-400", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
      {label && <span className="text-xs font-medium text-zinc-400">{label}</span>}
    </div>
  );
}

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

export function LoadingScreen({
  message = "Loading Editorial Workspace...",
  subtext = "Fetching verified records and linguistic caches",
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
            {message}
          </h3>
          <p className="text-xs text-zinc-500">{subtext}</p>
        </div>
      </motion.div>
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-4 w-1/3 rounded bg-zinc-800/80" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800/50" />
        <div className="h-3 w-4/5 rounded bg-zinc-800/50" />
      </div>
      <div className="h-8 w-24 rounded bg-zinc-800/70" />
    </div>
  );
}
