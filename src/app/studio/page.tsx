"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Save,
  PenTool,
  Sliders,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { ResearchProject, EditorialAngle, NewsletterArticle } from "@/types/editorial";
import { countWords } from "@/lib/extraction/extractor";

export default function NewsletterStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId");
  const initialAngleId = searchParams.get("angleId");

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");
  const [selectedAngleId, setSelectedAngleId] = useState<string>(initialAngleId || "");
  const [targetWordCount, setTargetWordCount] = useState<number>(400);
  const [tone, setTone] = useState<"analytical" | "technical" | "executive">("analytical");

  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);

  // Fetch all saved research projects
  useEffect(() => {
    fetch("/api/research")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProjects(json.data);
          if (!selectedProjectId && json.data.length > 0) {
            setSelectedProjectId(json.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const angles = activeProject?.brief?.editorialAngles || [];

  // Auto-select first angle if none chosen
  useEffect(() => {
    if (angles.length > 0 && !selectedAngleId) {
      setSelectedAngleId(angles[0].id);
    }
  }, [angles, selectedAngleId]);

  // Load existing article if project has one
  useEffect(() => {
    if (activeProject && !content) {
      fetch("/api/studio")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.length > 0) {
            const match = json.data.find((a: NewsletterArticle) => a.projectId === activeProject.id);
            if (match) {
              setArticleId(match.id);
              setHeadline(match.headline);
              setContent(match.content);
              if (match.angleId) setSelectedAngleId(match.angleId);
            }
          }
        })
        .catch(() => {});
    }
  }, [activeProject]);

  const currentWordCount = countWords(content);
  const isOptimalWordCount = currentWordCount >= 300 && currentWordCount <= 500;

  // Generate 300–500 word newsletter draft
  const handleGenerate = async () => {
    if (!selectedProjectId || !selectedAngleId) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          angleId: selectedAngleId,
          targetWordCount,
          tone,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setArticleId(json.data.id);
        setHeadline(json.data.headline);
        setContent(json.data.content);
      }
    } catch (err) {
      console.error("Studio generate error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Bridge: Send directly to Writing Assistant for Hemingway review
  const handleSendToWritingAssistant = async () => {
    if (!content.trim()) return;

    try {
      // Save draft into storage first
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: articleId || undefined,
          title: headline || "Untitled Newsletter Draft",
          content,
          originalContent: content,
          status: "draft",
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(`/writing?draftId=${json.data.id}`);
      }
    } catch (err) {
      console.error("Failed to forward draft to Writing Assistant:", err);
    }
  };

  const handleCopyMarkdown = () => {
    const fullMarkdown = `# ${headline}\n\n${content}`;
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Newsletter Studio
            </h2>
            <Badge variant="amber" className="text-[11px] py-0.5">
              Target: 300–500 Words
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Synthesize evidence briefs into compelling, publication-grade newsletter editions with traceable source links.
          </p>
        </div>

        {content && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="gap-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={handleSendToWritingAssistant}
              className="gap-1.5 shadow-sm"
            >
              <PenTool className="h-4 w-4" />
              <span>Send to Writing Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Control Console: Project & Angle Selection */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-400" />
            <span>Editorial Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Project Picker */}
            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                1. Select Research Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedAngleId("");
                }}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.sources?.length || 0} sources)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Word Count */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  2. Target Length: {targetWordCount} words
                </label>
                <span className="text-[10px] text-zinc-400">Strict: 300–500w</span>
              </div>
              <input
                type="range"
                min={300}
                max={500}
                step={25}
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Editorial Tone */}
            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                3. Editorial Voice
              </label>
              <div className="flex rounded-md border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
                {(["analytical", "technical", "executive"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex-1 py-1.5 rounded capitalize font-medium transition-colors ${
                      tone === t
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Angle Picker Cards */}
          {angles.length > 0 ? (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-zinc-300 block">
                4. Select Story Angle ({angles.length} synthesized in brief)
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {angles.map((ang) => (
                  <div
                    key={ang.id}
                    onClick={() => setSelectedAngleId(ang.id)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selectedAngleId === ang.id
                        ? "border-blue-500 bg-blue-950/20 text-blue-100 shadow-sm"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[9px] py-0">
                        {ang.targetAudience}
                      </Badge>
                      {selectedAngleId === ang.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-200 line-clamp-1 block">
                      {ang.title}
                    </span>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                      {ang.premise}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-3 text-xs text-amber-300">
              This project does not have a synthesized brief yet. Please open Research Assistant and generate a brief first.
            </div>
          )}

          {/* Trigger Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="accent"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedProjectId || !selectedAngleId}
              className="gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Article...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Newsletter Draft</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor & Publication Workspace */}
      {content && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Draft Status
              </span>
              {isOptimalWordCount ? (
                <Badge variant="emerald" className="text-xs">
                  Optimal Length ({currentWordCount} words)
                </Badge>
              ) : (
                <Badge variant="amber" className="text-xs">
                  {currentWordCount} words (Target: 300–500w)
                </Badge>
              )}
            </div>

            <div className="text-xs text-zinc-500 font-mono">
              Reading Time: ~{(currentWordCount / 220).toFixed(1)} min
            </div>
          </div>

          <Card className="overflow-hidden border-zinc-800 bg-zinc-900/70 p-6 space-y-4">
            {/* Headline Editor */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 block">
                Headline
              </label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="text-xl font-bold bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-0 h-10 text-zinc-100"
                placeholder="Article Headline..."
              />
            </div>

            {/* Newsletter Body Editor */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 block">
                Article Body (Markdown Supported)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="font-serif text-base text-zinc-100 leading-relaxed bg-zinc-950/60 p-5 rounded-lg border-zinc-800"
              />
            </div>

            {/* Traceable Source Hyperlinks Footer */}
            {activeProject?.sources && (
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Traceable Supporting Sources
                </span>
                <ul className="space-y-1.5 text-xs">
                  {activeProject.sources.map((src, idx) => (
                    <li key={src.id} className="flex items-center gap-2 text-zinc-400">
                      <span className="font-mono text-zinc-500">[{idx + 1}]</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
