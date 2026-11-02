"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  Copy,
  Save,
  BookOpen,
  HelpCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Split,
  Eye,
  CheckCircle2,
  PenTool,
  Edit3,
  Layers,
  History,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialMetrics, WritingSuggestion, SuggestionType } from "@/types/editorial";

interface HistoryEntry {
  content: string;
  suggestions: WritingSuggestion[];
  description: string;
}

const INITIAL_DEMO_TEXT = `When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning, due to the fact that for over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions of dollars in bespoke capital expenditures. DeepSeek-R1 dismantled that orthodoxy with a reported $5.94 million base training budget and an MIT-licensed release that matches OpenAI’s o1 across gold-standard mathematical benchmarks.

The breakthrough is structural rather than purely computational in nature. Built on a Mixture-of-Experts architecture comprising 671 billion parameters, R1 activates only 37 billion parameters for any given token, which is very advantageous. By coupling Multi-Head Latent Attention with dual-pipe parallel computation and native FP8 mixed precision, memory bandwidth bottlenecks were compressed by over 45% by the engineering team. The operational dividends are staggering: commercial API access was launched at just $0.14 per million input tokens—a paradigm shift representing a 95% discount compared to prevailing proprietary alternatives.

For builders and technology leaders, the implications are profound. At the end of the day, until now, deploying multi-step chain-of-thought verification required accepting prohibitive token costs and routing proprietary customer data through third-party cloud endpoints. Engineering teams must endeavor to facilitate sovereign deployment while remaining cognizant of data privacy requirements. With distilled 7B and 14B checkpoints running on consumer silicon and the full 671B model deployable in air-gapped private clouds, the strategic moat has shifted decisively from raw model weights to proprietary data and domain integration.

The lesson for editorial curators and engineering leaders is unmistakable: brute-force compute scaling is no longer the sole path to intelligence. Algorithmic efficiency, cold-start reinforcement learning, and open weights have democratized frontier reasoning, permanently resetting the unit economics of AI-native software.`;

export default function WritingAssistantPage() {
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get("draftId");

  const [title, setTitle] = useState("DeepSeek-R1 Newsletter Editorial (Draft Edition)");
  const [content, setContent] = useState(INITIAL_DEMO_TEXT);
  const [originalContent, setOriginalContent] = useState(INITIAL_DEMO_TEXT);
  const [metrics, setMetrics] = useState<EditorialMetrics | null>(null);
  const [originalMetrics, setOriginalMetrics] = useState<EditorialMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [canvasMode, setCanvasMode] = useState<"highlighted" | "edit">("highlighted");
  const [viewMode, setViewMode] = useState<"editor" | "diff">("editor");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedArticleId, setLinkedArticleId] = useState<string | null>(null);

  // If draftId is in URL, fetch from API
  useEffect(() => {
    if (draftIdParam) {
      fetch(`/api/writing/${draftIdParam}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setTitle(json.data.title);
            setContent(json.data.content);
            const orig = json.data.originalContent || json.data.content;
            setOriginalContent(orig);
            setMetrics(json.data.metrics);
            setOriginalMetrics(json.data.metrics);
            setSuggestions(json.data.suggestions || []);
            setLinkedArticleId(json.data.articleId || null);
          }
        })
        .catch(() => {});
    } else {
      analyzeText(INITIAL_DEMO_TEXT, true);
    }
  }, [draftIdParam]);

  const analyzeText = async (textToAnalyze: string, isInitial: boolean = false) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/writing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToAnalyze,
          title,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMetrics(json.data.metrics);
        if (isInitial || !originalMetrics) {
          setOriginalMetrics(json.data.metrics);
        }
        setSuggestions(json.data.suggestions);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setTitle("DeepSeek-R1 Newsletter Editorial (Draft Edition)");
    setContent(INITIAL_DEMO_TEXT);
    setOriginalContent(INITIAL_DEMO_TEXT);
    setHistory([]);
    setSelectedSuggestionId(null);
    analyzeText(INITIAL_DEMO_TEXT, true);
  };

  // Accept a single suggestion: atomically replaces target in text and updates status
  const handleAcceptSuggestion = (sugg: WritingSuggestion) => {
    // Record current state for undo
    setHistory((prev) => [
      ...prev,
      {
        content,
        suggestions,
        description: `Accepted rewrite for: "${sugg.originalText.slice(0, 30)}..."`,
      },
    ]);

    let updated = content;
    if (!sugg.suggestedText) {
      updated = content.replace(sugg.originalText, "").replace(/\s\s+/g, " ");
    } else if (content.includes(sugg.originalText)) {
      updated = content.replace(sugg.originalText, sugg.suggestedText);
    }

    setContent(updated);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sugg.id ? { ...s, status: "accepted" } : s))
    );
    setSelectedSuggestionId(null);
    analyzeText(updated);
  };

  const handleRejectSuggestion = (suggId: string) => {
    const target = suggestions.find((s) => s.id === suggId);
    setHistory((prev) => [
      ...prev,
      {
        content,
        suggestions,
        description: `Dismissed suggestion: "${target?.originalText.slice(0, 30) || "Passage"}..."`,
      },
    ]);

    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggId ? { ...s, status: "rejected" } : s))
    );
    if (selectedSuggestionId === suggId) {
      setSelectedSuggestionId(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setContent(last.content);
    setSuggestions(last.suggestions);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    analyzeText(last.content);
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: linkedArticleId || undefined,
          title,
          content,
          originalContent,
          status: "analyzed",
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Save draft error:", err);
    }
  };

  const handleCopyClean = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToOriginal = () => {
    if (confirm("Reset current draft back to the original unmodified text?")) {
      setContent(originalContent);
      setHistory([]);
      setSelectedSuggestionId(null);
      analyzeText(originalContent);
    }
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const filteredSuggestions = pendingSuggestions.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "long")
      return s.type === "long_sentence" || s.type === "difficult_sentence";
    if (activeFilter === "passive") return s.type === "passive_voice";
    if (activeFilter === "jargon") return s.type === "jargon";
    if (activeFilter === "filler") return s.type === "filler_phrase";
    if (activeFilter === "repetition") return s.type === "repetition";
    if (activeFilter === "complexity") return s.type === "complexity";
    return true;
  });

  const getBadgeForType = (type: SuggestionType) => {
    switch (type) {
      case "difficult_sentence":
        return <Badge variant="purple">Very Hard Sentence</Badge>;
      case "long_sentence":
        return <Badge variant="amber">Long Sentence</Badge>;
      case "passive_voice":
        return <Badge variant="sky">Passive Voice</Badge>;
      case "jargon":
        return <Badge variant="rose">Unexplained Jargon</Badge>;
      case "filler_phrase":
        return <Badge variant="emerald">Filler Words</Badge>;
      case "repetition":
        return <Badge variant="secondary">Repetitive Word</Badge>;
      case "complexity":
        return <Badge variant="indigo">Complex Phrasing</Badge>;
      default:
        return <Badge variant="outline">Writing Check</Badge>;
    }
  };

  const getHighlightClassForType = (type: SuggestionType, isSelected: boolean) => {
    const ring = isSelected ? "ring-2 ring-blue-400 font-medium " : "";
    switch (type) {
      case "difficult_sentence":
        return `${ring}bg-purple-950/40 text-purple-200 border-b-2 border-purple-500 hover:bg-purple-900/40`;
      case "long_sentence":
        return `${ring}bg-amber-950/40 text-amber-200 border-b-2 border-amber-500 hover:bg-amber-900/40`;
      case "passive_voice":
        return `${ring}bg-sky-950/40 text-sky-200 border-b-2 border-sky-500 hover:bg-sky-900/40`;
      case "jargon":
        return `${ring}bg-rose-950/40 text-rose-200 border-b-2 border-rose-500 hover:bg-rose-900/40`;
      case "filler_phrase":
        return `${ring}bg-emerald-950/40 text-emerald-200 border-b-2 border-emerald-500 hover:bg-emerald-900/40`;
      case "repetition":
        return `${ring}bg-violet-950/40 text-violet-200 border-b-2 border-violet-500 hover:bg-violet-900/40`;
      case "complexity":
        return `${ring}bg-indigo-950/40 text-indigo-200 border-b-2 border-indigo-500 hover:bg-indigo-900/40`;
      default:
        return `${ring}bg-zinc-800 text-zinc-200 border-b-2 border-zinc-500`;
    }
  };

  const handleSelectHighlight = (id: string) => {
    setSelectedSuggestionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Render text with interactive sentence-level highlighting
  const renderHighlightedCanvas = () => {
    const paragraphs = content.split("\n\n");

    return (
      <div className="space-y-4 font-serif text-base leading-relaxed text-zinc-100 p-5 min-h-[520px]">
        {paragraphs.map((para, pIdx) => {
          // Identify matching suggestions in this paragraph
          const matches: { sugg: WritingSuggestion; start: number; end: number }[] = [];

          for (const sugg of pendingSuggestions) {
            if (!sugg.originalText) continue;
            let searchIdx = 0;
            while (true) {
              const found = para.indexOf(sugg.originalText, searchIdx);
              if (found === -1) break;
              matches.push({
                sugg,
                start: found,
                end: found + sugg.originalText.length,
              });
              searchIdx = found + sugg.originalText.length;
            }
          }

          if (matches.length === 0) {
            return (
              <p key={pIdx} className="leading-relaxed">
                {para}
              </p>
            );
          }

          // Sort matches by starting index
          matches.sort((a, b) => a.start - b.start);

          // Build non-overlapping span segments
          const segments: React.ReactNode[] = [];
          let cursor = 0;

          matches.forEach((m, mIdx) => {
            if (m.start > cursor) {
              segments.push(
                <span key={`plain-${pIdx}-${cursor}`}>{para.slice(cursor, m.start)}</span>
              );
            }

            if (m.start >= cursor) {
              const isSelected = selectedSuggestionId === m.sugg.id;
              const highlightClass = getHighlightClassForType(m.sugg.type, isSelected);

              segments.push(
                <mark
                  key={`mark-${pIdx}-${m.start}-${mIdx}`}
                  onClick={() => handleSelectHighlight(m.sugg.id)}
                  className={`inline rounded cursor-pointer transition-all px-1 py-0.5 my-0.5 ${highlightClass}`}
                  title={`[${m.sugg.type.replace("_", " ")}] Click to inspect rewrite`}
                >
                  {para.slice(m.start, m.end)}
                </mark>
              );
              cursor = m.end;
            }
          });

          if (cursor < para.length) {
            segments.push(
              <span key={`plain-${pIdx}-${cursor}`}>{para.slice(cursor)}</span>
            );
          }

          return (
            <p key={pIdx} className="leading-relaxed">
              {segments}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-16"
    >
      {/* Page Title & View Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-850 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Writing Assistant
            </h2>
            <Badge variant="purple" className="text-[10px] py-0.5">
              Hemingway Engine
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Sentence-level highlighting, deterministic linguistic rules, contextual AI rewrites, and atomic suggestions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {linkedArticleId && (
            <Link href="/studio">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-blue-400 border-blue-900/50 hover:bg-blue-950/40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Studio</span>
              </Button>
            </Link>
          )}

          {/* Analyze Draft Button */}
          <Button
            variant="accent"
            size="sm"
            onClick={() => analyzeText(content)}
            isLoading={isAnalyzing}
            className="gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analyze Draft</span>
          </Button>

          {/* Undo Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="gap-1.5"
            title="Undo last accepted or rejected suggestion"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Undo {history.length > 0 ? `(${history.length})` : ""}</span>
          </Button>

          {/* Editor vs Diff Mode Switcher */}
          {content.trim().length > 0 && (
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
              <button
                onClick={() => setViewMode("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === "editor"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setViewMode("diff")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === "diff"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Split className="h-3.5 w-3.5" />
                <span>Diff View</span>
              </button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyClean}
            className="gap-1.5"
            disabled={!content.trim()}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-1.5"
            disabled={!content.trim()}
          >
            {saveSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{saveSuccess ? "Saved!" : "Save Draft"}</span>
          </Button>
        </div>
      </div>

      {content.trim().length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={PenTool}
          title="Writing Assistant Canvas Ready"
          description="Paste an unedited manuscript or write directly to activate the Hemingway Linter. Evaluates long sentences, passive constructions, tech buzzwords, and reading ease."
          actionLabel="Load Sample Unedited Manuscript"
          onAction={handleLoadSample}
          badge="Linter Ready"
          tip="The assistant never mutates or overwrites drafts automatically. Every suggestion is accepted atomically by the author."
        />
      ) : (
        <>
          {/* Document Title Header */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-0 h-10"
            placeholder="Document Title..."
          />

          {/* Metrics Strip */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Word Count
                </span>
                <span className="text-xl font-bold font-mono text-zinc-100">
                  {metrics.wordCount}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Target: 300–500w
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Chars & Sentences
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    {metrics.charCount}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / {metrics.sentenceCount} sent
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {metrics.sentenceCount} total sentences
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Avg Sentence
                </span>
                <span className="text-xl font-bold font-mono text-zinc-100">
                  {metrics.avgSentenceLength} w
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Target: 15–20 words
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Est. Reading Time
                </span>
                <span className="text-xl font-bold font-mono text-zinc-100">
                  {metrics.readingTimeMinutes} min
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  ~220 wpm velocity
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Flesch Grade
                </span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  {metrics.fleschKincaidGrade}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Ease: {metrics.fleschReadingEase} / 100
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                    Readability Indicator
                  </span>
                  <Tooltip content="Readability scores (Flesch-Kincaid) are automated mathematical heuristics provided as editorial guidance, not a definitive quality score." />
                </div>
                <span className="text-xs font-semibold text-zinc-200 block truncate mt-1">
                  {metrics.readabilityLabel}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Editorial Guidance
                </span>
              </div>
            </div>
          )}

          {/* Editor & Inspector Dual Pane */}
          {viewMode === "editor" ? (
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* Left Column (7 cols): The Writing Canvas */}
              <div className="lg:col-span-7 space-y-3">
                <Card className="p-0 overflow-hidden border-zinc-800 bg-zinc-900/60">
                  {/* Canvas Mode Switcher Bar */}
                  <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-950/40 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-md border border-zinc-800 bg-zinc-900/90 p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setCanvasMode("highlighted")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            canvasMode === "highlighted"
                              ? "bg-zinc-800 text-zinc-100 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Layers className="h-3.5 w-3.5 text-blue-400" />
                          <span>Interactive Highlights</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCanvasMode("edit")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            canvasMode === "edit"
                              ? "bg-zinc-800 text-zinc-100 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Direct Text Edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-zinc-500">
                        {content.length} characters • {metrics?.wordCount || 0} words
                      </span>
                    </div>
                  </div>

                  {/* Highlights Legend (visible in highlighted mode) */}
                  {canvasMode === "highlighted" && (
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-zinc-850 bg-zinc-950/20 text-[10px] text-zinc-400">
                      <span className="text-zinc-500 font-semibold uppercase tracking-wider">
                        Color Key:
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-500" /> Very Hard
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> Long Sentence
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-sky-500" /> Passive Voice
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Filler Words
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500" /> Jargon
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-violet-500" /> Repetition
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" /> Complexity
                      </span>
                    </div>
                  )}

                  {/* Canvas Body: Highlighted or Raw Textarea */}
                  {canvasMode === "highlighted" ? (
                    renderHighlightedCanvas()
                  ) : (
                    <Textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                      }}
                      onBlur={() => analyzeText(content)}
                      className="w-full min-h-[520px] rounded-none border-none bg-transparent p-5 font-serif text-base text-zinc-100 leading-relaxed resize-y focus-visible:ring-0"
                      placeholder="Paste or write your draft here..."
                    />
                  )}
                </Card>

                <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                  <span>
                    Click any highlighted sentence to view proposed rewrites. Never automatically overwrites prose.
                  </span>
                  <button
                    onClick={handleResetToOriginal}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset to Original</span>
                  </button>
                </div>
              </div>

              {/* Right Column (5 cols): The Writing Issue Sidebar */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border-zinc-800 bg-zinc-900/80">
                  <CardHeader className="pb-3 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span>Writing Issue Sidebar</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-400">
                          {pendingSuggestions.length} active suggestions identified
                        </CardDescription>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeText(content)}
                        isLoading={isAnalyzing}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Re-Analyze</span>
                      </Button>
                    </div>

                    {/* Filter Pills for all 6+ checks */}
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "all"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        All ({pendingSuggestions.length})
                      </button>
                      <button
                        onClick={() => setActiveFilter("long")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "long"
                            ? "bg-amber-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Long Sentences (
                        {
                          suggestions.filter(
                            (s) =>
                              s.status === "pending" &&
                              (s.type === "long_sentence" ||
                                s.type === "difficult_sentence")
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setActiveFilter("passive")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "passive"
                            ? "bg-sky-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Passive Voice (
                        {
                          suggestions.filter(
                            (s) =>
                              s.status === "pending" && s.type === "passive_voice"
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setActiveFilter("filler")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "filler"
                            ? "bg-emerald-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Filler Words (
                        {
                          suggestions.filter(
                            (s) =>
                              s.status === "pending" &&
                              s.type === "filler_phrase"
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setActiveFilter("jargon")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "jargon"
                            ? "bg-rose-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Jargon (
                        {
                          suggestions.filter(
                            (s) => s.status === "pending" && s.type === "jargon"
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setActiveFilter("repetition")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "repetition"
                            ? "bg-purple-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Repetition (
                        {
                          suggestions.filter(
                            (s) =>
                              s.status === "pending" && s.type === "repetition"
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setActiveFilter("complexity")}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          activeFilter === "complexity"
                            ? "bg-indigo-400 text-zinc-950 font-semibold"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Complexity (
                        {
                          suggestions.filter(
                            (s) =>
                              s.status === "pending" && s.type === "complexity"
                          ).length
                        }
                        )
                      </button>
                    </div>
                  </CardHeader>

                  {/* Suggestions Cards Feed */}
                  <CardContent className="p-4 space-y-3.5 max-h-[580px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((sugg) => {
                          const isSelected = selectedSuggestionId === sugg.id;

                          return (
                            <motion.div
                              key={sugg.id}
                              id={sugg.id}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, x: -12 }}
                              transition={{ duration: 0.18 }}
                              onClick={() => setSelectedSuggestionId(sugg.id)}
                              className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-950/20 shadow-md shadow-blue-500/10"
                                  : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getBadgeForType(sugg.type)}
                                  <span className="font-mono text-[10px] text-zinc-500">
                                    #{sugg.id}
                                  </span>
                                </div>
                              </div>

                              {/* Original Passage Flagged */}
                              <div className="rounded-lg bg-zinc-900/90 border border-zinc-800/80 p-2.5 text-xs text-zinc-300 font-serif italic">
                                "{sugg.originalText}"
                              </div>

                              {/* Explanation & Why it matters */}
                              <div className="space-y-1 text-xs text-zinc-400">
                                <p className="leading-relaxed">
                                  <span className="font-semibold text-zinc-300">
                                    Issue:
                                  </span>{" "}
                                  {sugg.explanation}
                                </p>
                                <p className="leading-relaxed text-[11px] text-zinc-500">
                                  <span className="font-semibold text-zinc-400">
                                    Why it matters:
                                  </span>{" "}
                                  {sugg.whyItMatters}
                                </p>
                              </div>

                              {/* Proposed Rewrite */}
                              {sugg.suggestedText ? (
                                <div className="rounded-lg bg-blue-950/20 border border-blue-900/40 p-2.5 text-xs text-blue-200">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                                    Proposed Rewrite:
                                  </span>
                                  <p className="font-medium font-serif">
                                    {sugg.suggestedText}
                                  </p>
                                </div>
                              ) : (
                                <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-2 text-xs text-zinc-400 italic">
                                  Editorial proposal: Delete this filler phrase to streamline the sentence.
                                </div>
                              )}

                              {/* Action Buttons: Accept / Reject */}
                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-900">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectSuggestion(sugg.id);
                                  }}
                                  className="text-xs h-7 text-zinc-500 hover:text-zinc-300"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  <span>Reject</span>
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptSuggestion(sugg);
                                  }}
                                  className="text-xs h-7 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/60"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  <span>Accept Rewrite</span>
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mx-auto" />
                          <p className="font-medium text-zinc-300">
                            Clean Editorial Bill of Health!
                          </p>
                          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                            No active issues in the selected category. Prose is concise, active, and technically rigorous.
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Side-by-Side Diff Comparison View */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-zinc-300">
                    Editorial Revision Audit:
                  </span>
                  <Badge variant="emerald" className="gap-1">
                    <Check className="h-3 w-3" />
                    <span>
                      {
                        suggestions.filter((s) => s.status === "accepted")
                          .length
                      }{" "}
                      Accepted
                    </span>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <X className="h-3 w-3" />
                    <span>
                      {
                        suggestions.filter((s) => s.status === "rejected")
                          .length
                      }{" "}
                      Dismissed
                    </span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span>{pendingSuggestions.length} Pending</span>
                  </Badge>
                  {originalMetrics && metrics && (
                    <span className="font-mono text-zinc-400 pl-2">
                      Word Delta:{" "}
                      <span
                        className={
                          metrics.wordCount <= originalMetrics.wordCount
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {metrics.wordCount - originalMetrics.wordCount} words
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyClean}
                    className="gap-1.5 text-xs h-8"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy Polished Edition"}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode("editor")}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Return to Editor</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Original Unedited Snapshot */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardHeader className="pb-2 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="w-fit text-[10px] mb-1">
                        Original Draft Snapshot
                      </Badge>
                      {originalMetrics && (
                        <span className="font-mono text-[11px] text-zinc-400">
                          {originalMetrics.wordCount} words • FRE:{" "}
                          {originalMetrics.fleschReadingEase}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-sm font-semibold text-zinc-300">
                      Initial Submission (Pre-Review)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 font-serif text-sm leading-relaxed text-zinc-400 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                    {originalContent}
                  </CardContent>
                </Card>

                {/* Polished Edition */}
                <Card className="border-emerald-900/40 bg-zinc-900/70">
                  <CardHeader className="pb-2 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <Badge variant="emerald" className="w-fit text-[10px] mb-1">
                        Polished Edition
                      </Badge>
                      {metrics && (
                        <span className="font-mono text-[11px] text-emerald-400">
                          {metrics.wordCount} words • FRE:{" "}
                          {metrics.fleschReadingEase}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-sm font-semibold text-emerald-300">
                      Current Revised Text (Active)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 font-serif text-sm leading-relaxed text-zinc-100 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                    {content}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
