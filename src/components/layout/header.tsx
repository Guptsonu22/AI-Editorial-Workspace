"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Cpu, ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [provider, setProvider] = useState<string>("heuristic");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.aiProvider) {
          setProvider(json.data.aiProvider);
        }
      })
      .catch(() => {});
  }, []);

  const getBreadcrumbTitle = (path: string) => {
    if (path === "/") return "Editorial Dashboard";
    if (path.startsWith("/research")) return "Research Assistant";
    if (path.startsWith("/writing")) return "Writing Assistant";
    if (path.startsWith("/studio")) return "Newsletter Studio";
    if (path.startsWith("/saved")) return "Saved Research Library";
    if (path.startsWith("/settings")) return "Workspace Settings";
    return "Editorial Workspace";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-medium text-zinc-400">
            Workspace
          </span>
          <span className="hidden sm:inline text-zinc-600">/</span>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100 truncate max-w-[200px] sm:max-w-none">
            {getBreadcrumbTitle(pathname)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model State Pill */}
        <div className="hidden sm:flex items-center gap-2">
          {provider === "anthropic" ? (
            <Badge variant="purple" className="flex items-center gap-1.5 py-1">
              <Cpu className="h-3 w-3" />
              <span>Claude 3.5 Sonnet</span>
            </Badge>
          ) : provider === "openai" ? (
            <Badge variant="emerald" className="flex items-center gap-1.5 py-1">
              <Cpu className="h-3 w-3" />
              <span>GPT-4o Connected</span>
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 py-1 text-zinc-400 border-zinc-700/60"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Governed Heuristic Engine</span>
            </Badge>
          )}
        </div>

        {/* Global Quick Action */}
        <Link href="/research">
          <Button size="sm" variant="accent" className="gap-1.5 shadow-sm text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
