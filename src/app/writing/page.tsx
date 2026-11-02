"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Split,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { EditorialMetrics, WritingSuggestion, SuggestionType } from "@/types/editorial";

const INITIAL_DEMO_TEXT = `When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning, due to the fact that for over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions of dollars in bespoke capital expenditures. DeepSeek-R1 dismantled that orthodoxy with a reported $5.94 million base training budget and an MIT-licensed release that matches OpenAI’s o1 across gold-standard mathematical benchmarks.

The breakthrough is structural rather than purely computational in nature. Built on a Mixture-of-Experts architecture comprising 671 billion parameters, R1 activates only 37 billion parameters for any given token, which is very advantageous. By coupling Multi-Head Latent Attention with dual-pipe parallel computation and native FP8 mixed precision, memory bandwidth bottlenecks were compressed by over 45% by the engineering team. The operational dividends are staggering: commercial API access was launched at just $0.14 per million input tokens—a paradigm shift representing a 95% discount compared to prevailing proprietary alternatives.

For builders and technology leaders, the implications are profound. At the end of the day, until now, deploying multi-step chain-of-thought verification required accepting prohibitive token costs and routing proprietary customer data through third-party cloud endpoints. With distilled 7B and 14B checkpoints running on consumer silicon and the full 671B model deployable in air-gapped private clouds, the strategic moat has shifted decisively from raw model weights to proprietary data and domain integration.

The lesson for editorial curators and engineering leaders is unmistakable: brute-force compute scaling is no longer the sole path to intelligence. Algorithmic efficiency, cold-start reinforcement learning, and open weights have democratized frontier reasoning, permanently resetting the unit economics of AI-native software.`;

export default function WritingAssistantPage() {
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get("draftId");

  const [title, setTitle] = useState("DeepSeek-R1 Newsletter Editorial (Draft Edition)");
  const [content, setContent] = useState(INITIAL_DEMO_TEXT);
  const [originalContent, setOriginalContent] = useState(INITIAL_DEMO_TEXT);
  const [metrics, setMetrics] = useState<EditorialMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<"editor" | "diff">("editor");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // If draftId is in URL, fetch from API
  useEffect(() => {
    if (draftIdParam) {
      fetch(`/api/writing/${draftIdParam}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setTitle(json.data.title);
            setContent(json.data.content);
            setOriginalContent(json.data.originalContent || json.data.content);
            setMetrics(json.data.metrics);
            setSuggestions(json.data.suggestions || []);
          }
        })
        .catch(() => {});
    } else {
      // Analyze default text on mount
      analyzeText(INITIAL_DEMO_TEXT);
    }
  }, [draftIdParam]);

  const analyzeText = async (textToAnalyze: string) => {
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
        setSuggestions(json.data.suggestions);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Accept a single suggestion: atomically replaces target in text and updates status
  const handleAcceptSuggestion = (sugg: WritingSuggestion) => {
    if (!sugg.suggestedText) {
      // Deletion case (for filler like 'it is important to note that')
      const updated = content.replace(sugg.originalText, "").replace(/\s\s+/g, " ");
      setContent(updated);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === sugg.id ? { ...s, status: "accepted" } : s))
      );
      analyzeText(updated);
      return;
    }

    // Clean drop-in replacement
    if (content.includes(sugg.originalText)) {
      const updated = content.replace(sugg.originalText, sugg.suggestedText);
      setContent(updated);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === sugg.id ? { ...s, status: "accepted" } : s))
      );
      // Re-run analysis on modified text to update metrics
      analyzeText(updated);
    } else {
      // If direct string match fails due to prior edits, mark accepted
      setSuggestions((prev) =>
        prev.map((s) => (s.id === sugg.id ? { ...s, status: "accepted" } : s))
      );
    }
  };

  const handleRejectSuggestion = (suggId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggId ? { ...s, status: "rejected" } : s))
    );
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      analyzeText(originalContent);
    }
  };

  // Filtered suggestions for the review feed
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const filteredSuggestions = pendingSuggestions.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "long") return s.type === "long_sentence" || s.type === "difficult_sentence";
    if (activeFilter === "passive") return s.type === "passive_voice";
    if (activeFilter === "jargon") return s.type === "jargon";
    if (activeFilter === "filler") return s.type === "filler_phrase";
    if (activeFilter === "repetition") return s.type === "repetition";
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
        return <Badge variant="rose">Jargon / Buzzword</Badge>;
      case "filler_phrase":
        return <Badge variant="emerald">Filler Phrase</Badge>;
      case "repetition":
        return <Badge variant="secondary">Repetitive Word</Badge>;
      default:
        return <Badge variant="outline">Complexity</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Writing Assistant
            </h2>
            <Badge variant="purple" className="text-[11px] py-0.5">
              Hemingway Linter
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time sentence length inspection, passive voice detection, and atomic suggestion acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Editor Mode</span>
            </button>
            <button
              onClick={() => setViewMode("diff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === "diff"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Side-by-Side Diff</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyClean}
            className="gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-1.5"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saveSuccess ? "Saved!" : "Save Draft"}</span>
          </Button>
        </div>
      </div>

      {/* Document Title Header */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-semibold bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-0 h-10"
        placeholder="Document Title..."
      />

      {/* Metrics Strip */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
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
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
              Reading Time
            </span>
            <span className="text-xl font-bold font-mono text-zinc-100">
              {metrics.readingTimeMinutes} min
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              ~220 wpm velocity
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
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
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
              Flesch Grade
            </span>
            <span className="text-xl font-bold font-mono text-purple-400">
              {metrics.fleschKincaidGrade}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              Grade Level
            </span>
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
                Readability Indicator
              </span>
              <Tooltip content="Readability scores (Flesch-Kincaid) are automated mathematical heuristics provided as editorial guidance, not a definitive quality measurement." />
            </div>
            <span className="text-sm font-semibold text-zinc-200 block truncate">
              {metrics.readabilityLabel}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              Reading Ease: {metrics.fleschReadingEase} / 100
            </span>
          </div>
        </div>
      )}

      {/* Editor & Inspector Dual Pane */}
      {viewMode === "editor" ? (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left: The Writing Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-0 overflow-hidden border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-950/40 text-xs text-zinc-400">
                <span>Direct Prose Editor</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {content.length} characters
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  analyzeText(e.target.value);
                }}
                className="w-full min-h-[520px] rounded-none border-none bg-transparent p-5 font-serif text-base text-zinc-100 leading-relaxed resize-y focus-visible:ring-0"
                placeholder="Paste or write your draft here..."
              />
            </Card>

            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>Never automatically overwrites text. Every suggestion is accepted atomically.</span>
              <button
                onClick={handleResetToOriginal}
                className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Original</span>
              </button>
            </div>
          </div>

          {/* Right: The Editorial Inspector */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Editorial Critique</span>
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
                    className="text-xs h-8"
                  >
                    Re-Analyze
                  </Button>
                </div>

                {/* Filter Chips */}
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
                    Lengthy ({suggestions.filter((s) => s.status === "pending" && (s.type === "long_sentence" || s.type === "difficult_sentence")).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("passive")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeFilter === "passive"
                        ? "bg-sky-400 text-zinc-950 font-semibold"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Passive ({suggestions.filter((s) => s.status === "pending" && s.type === "passive_voice").length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("jargon")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeFilter === "jargon"
                        ? "bg-rose-400 text-zinc-950 font-semibold"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Jargon ({suggestions.filter((s) => s.status === "pending" && s.type === "jargon").length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("filler")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeFilter === "filler"
                        ? "bg-emerald-400 text-zinc-950 font-semibold"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Fillers ({suggestions.filter((s) => s.status === "pending" && s.type === "filler_phrase").length})
                  </button>
                </div>
              </CardHeader>

              {/* Suggestions Cards Feed */}
              <CardContent className="p-4 space-y-3.5 max-h-[580px] overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((sugg) => (
                    <div
                      key={sugg.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2.5 transition-all hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between">
                        {getBadgeForType(sugg.type)}
                      </div>

                      {/* Original Flagged Text */}
                      <div className="rounded bg-zinc-900/90 border border-zinc-800/80 p-2 text-xs text-zinc-300 font-serif italic">
                        "{sugg.originalText}"
                      </div>

                      {/* Explanation & Why it matters */}
                      <div className="space-y-1 text-xs text-zinc-400">
                        <p className="leading-relaxed">
                          <span className="font-semibold text-zinc-300">Issue:</span>{" "}
                          {sugg.explanation}
                        </p>
                        <p className="leading-relaxed text-[11px] text-zinc-500">
                          <span className="font-semibold text-zinc-400">Why it matters:</span>{" "}
                          {sugg.whyItMatters}
                        </p>
                      </div>

                      {/* Proposed Rewrite */}
                      {sugg.suggestedText && (
                        <div className="rounded bg-blue-950/20 border border-blue-900/40 p-2 text-xs text-blue-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                            Suggested Rewrite:
                          </span>
                          <p className="font-medium">{sugg.suggestedText}</p>
                        </div>
                      )}

                      {/* Action Buttons: Accept / Reject */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-900">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectSuggestion(sugg.id)}
                          className="text-xs h-7 text-zinc-500 hover:text-zinc-300"
                        >
                          <X className="h-3 w-3 mr-1" />
                          <span>Dismiss</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAcceptSuggestion(sugg)}
                          className="text-xs h-7 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/60"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          <span>Accept</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mx-auto" />
                    <p className="font-medium text-zinc-300">
                      Clean Editorial Bill of Health!
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                      No active issues in the selected filter category. Prose is concise and direct.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Side-by-Side Diff View */
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <Badge variant="secondary" className="w-fit text-[10px] mb-1">
                Original Draft Snapshot
              </Badge>
              <CardTitle className="text-sm font-semibold text-zinc-300">
                Initial Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-serif text-sm leading-relaxed text-zinc-400 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
              {originalContent}
            </CardContent>
          </Card>

          <Card className="border-emerald-900/40 bg-zinc-900/70">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <Badge variant="emerald" className="w-fit text-[10px] mb-1">
                Polished Edition
              </Badge>
              <CardTitle className="text-sm font-semibold text-emerald-300">
                Current Revised Text
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-serif text-sm leading-relaxed text-zinc-100 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
              {content}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
