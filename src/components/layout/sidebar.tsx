"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Search,
  PenTool,
  Send,
  Bookmark,
  Settings,
  Sparkles,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/",
    icon: Compass,
  },
  {
    title: "Research Assistant",
    href: "/research",
    icon: Search,
    badge: "Core",
  },
  {
    title: "Writing Assistant",
    href: "/writing",
    icon: PenTool,
    badge: "Linter",
  },
  {
    title: "Newsletter Studio",
    href: "/studio",
    icon: Send,
  },
  {
    title: "Saved Research",
    href: "/saved",
    icon: Bookmark,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      {/* Brand & Publication Header */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 shadow-md shadow-blue-500/20 text-white font-bold text-sm">
          AI
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-1.5">
            Editorial Workspace
          </span>
          <span className="text-[11px] font-medium text-zinc-400">
            This Week in AI
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Workspaces
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-blue-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      isActive
                        ? "bg-blue-950 text-blue-300 border border-blue-800/60"
                        : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Editorial Standards Card */}
        <div className="mt-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Citation Standard</span>
          </div>
          <p className="leading-relaxed text-[11px] text-zinc-400">
            Every brief enforces a minimum of 3 verified sources and zero hallucinated facts.
          </p>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Ready
          </span>
          <span className="font-mono text-[11px] text-zinc-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
