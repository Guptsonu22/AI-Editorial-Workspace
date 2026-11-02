"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserSettings } from "@/types/editorial";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [publication, setPublication] = useState("This Week in AI");
  const [wordCountTarget, setWordCountTarget] = useState(400);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings(json.data);
          setPublication(json.data.targetPublication || "This Week in AI");
          setWordCountTarget(json.data.defaultTargetWordCount || 400);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `editorial-workspace-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Backup failed:", err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Workspace Settings
          </h2>
          <Badge variant="secondary" className="text-[11px] py-0.5">
            System Config
          </Badge>
        </div>
        <p className="text-sm text-zinc-400">
          Manage AI providers, fallback execution rules, and editorial publication defaults.
        </p>
      </div>

      {/* Active AI Provider Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span>AI Model & Execution Engine</span>
          </CardTitle>
          <CardDescription>
            Configured server-side via environment variables in .env.local
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-zinc-100 block">
                Active Provider:{" "}
                <span className="text-blue-400 capitalize">
                  {settings?.aiProvider || "Governed Heuristic Engine"}
                </span>
              </span>
              <p className="text-xs text-zinc-400">
                {settings?.aiProvider === "anthropic"
                  ? "Connected via ANTHROPIC_API_KEY. Claude 3.5 Sonnet handles synthesis."
                  : settings?.aiProvider === "openai"
                  ? "Connected via OPENAI_API_KEY. GPT-4o handles synthesis."
                  : "Zero-dependency High-Fidelity Heuristic Engine active. Operates offline and without external API keys."}
              </p>
            </div>

            {settings?.aiProvider === "anthropic" || settings?.aiProvider === "openai" ? (
              <Badge variant="emerald" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Live API Active</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-xs text-blue-300 border-blue-900/40">
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <span>Heuristic Active</span>
              </Badge>
            )}
          </div>

          <Alert className="text-xs">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-xs font-semibold">
              Security Guarantee
            </AlertTitle>
            <AlertDescription className="text-xs text-zinc-400">
              API keys are never exposed in browser bundles. All requests are routed through Next.js server-side API endpoints with strict Zod validation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Editorial Target Defaults */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-400" />
            <span>Publication Defaults</span>
          </CardTitle>
          <CardDescription>
            Target newsletter branding and length parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1 block">
                Publication Name
              </label>
              <Input
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
                placeholder="This Week in AI"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1 block">
                Default Word Count Target: {wordCountTarget}w
              </label>
              <Input
                type="number"
                min={300}
                max={500}
                step={25}
                value={wordCountTarget}
                onChange={(e) => setWordCountTarget(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persistence & Data Backup */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Persistence & Database Layer</span>
          </CardTitle>
          <CardDescription>
            Atomic file persistence in .data/editorial-store.json (Supabase Postgres supported)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-zinc-100 block">
                Local File Database Active
              </span>
              <p className="text-xs text-zinc-400">
                All research projects, sources, briefs, drafts, and newsletter articles are persisted across server reboots.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBackup}
              className="gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>Download JSON Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
