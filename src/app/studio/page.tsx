"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  RotateCcw,
  X,
  Split,
  Eye,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HelpCircle,
  Clock,
  Layers,
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
import {
  ResearchProject,
  EditorialAngle,
  NewsletterArticle,
  WritingSuggestion,
  EditorialMetrics,
  SuggestionType,
} from "@/types/editorial";
import { countWords } from "@/lib/extraction/extractor";

interface StudioHistoryEntry {
  content: string;
  suggestions: WritingSuggestion[];
  description: string;
}

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

  // Editorial Content States
  const [articleId, setArticleId] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [originalHeadline, setOriginalHeadline] = useState("");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  // UI Modes & Auxiliary States
  const [activeTab, setActiveTab] = useState<"editor" | "linter" | "diff">("editor");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBriefPreview, setShowBriefPreview] = useState(false);

  // Integrated Writing Assistant Review States
  const [linterSuggestions, setLinterSuggestions] = useState<WritingSuggestion[]>([]);
  const [linterMetrics, setLinterMetrics] = useState<EditorialMetrics | null>(null);
  const [originalLinterMetrics, setOriginalLinterMetrics] = useState<EditorialMetrics | null>(null);
  const [isLinting, setIsLinting] = useState(false);
  const [history, setHistory] = useState<StudioHistoryEntry[]>([]);

  // Load research projects on mount
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
  const activeAngle = angles.find((a) => a.id === selectedAngleId);

  // Auto-select first angle if none chosen
  useEffect(() => {
    if (angles.length > 0 && !selectedAngleId) {
      setSelectedAngleId(angles[0].id);
    }
  }, [angles, selectedAngleId]);

  // Load existing article if already created for this project
  useEffect(() => {
    if (activeProject && !content) {
      fetch("/api/studio")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.length > 0) {
            const match = json.data.find(
              (a: NewsletterArticle) => a.projectId === activeProject.id
            );
            if (match) {
              setArticleId(match.id);
              setHeadline(match.headline);
              setOriginalHeadline(match.originalHeadline || match.headline);
              setContent(match.content);
              setOriginalContent(match.originalContent || match.content);
              if (match.angleId) setSelectedAngleId(match.angleId);
            }
          }
        })
        .catch(() => {});
    }
  }, [activeProject]);

  const currentWordCount = countWords(content);
  const isOptimalWordCount = currentWordCount >= 300 && currentWordCount <= 500;

  // 1. Generate Article Draft
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
        setOriginalHeadline(json.data.headline);
        setContent(json.data.content);
        setOriginalContent(json.data.content);
        setHistory([]);
        setActiveTab("editor");

        // Immediately analyze draft for instant linter review
        runLinterAnalysis(json.data.content, true);
      }
    } catch (err) {
      console.error("Studio generate error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run linter analysis on draft
  const runLinterAnalysis = async (textToAnalyze: string, isInitial: boolean = false) => {
    if (!textToAnalyze.trim()) return;
    setIsLinting(true);

    try {
      const res = await fetch("/api/writing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToAnalyze,
          title: headline,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setLinterMetrics(json.data.metrics);
        if (isInitial || !originalLinterMetrics) {
          setOriginalLinterMetrics(json.data.metrics);
        }
        setLinterSuggestions(json.data.suggestions);
      }
    } catch (err) {
      console.error("Linter analysis error:", err);
    } finally {
      setIsLinting(false);
    }
  };

  // Accept a single suggestion: atomically updates text and records undo
  const handleAcceptSuggestion = (sugg: WritingSuggestion) => {
    setHistory((prev) => [
      ...prev,
      {
        content,
        suggestions: linterSuggestions,
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
    setLinterSuggestions((prev) =>
      prev.map((s) => (s.id === sugg.id ? { ...s, status: "accepted" } : s))
    );
    runLinterAnalysis(updated);
  };

  // Reject a suggestion: preserves original and records undo
  const handleRejectSuggestion = (suggId: string) => {
    const target = linterSuggestions.find((s) => s.id === suggId);
    setHistory((prev) => [
      ...prev,
      {
        content,
        suggestions: linterSuggestions,
        description: `Dismissed suggestion: "${target?.originalText.slice(0, 30) || "Passage"}..."`,
      },
    ]);

    setLinterSuggestions((prev) =>
      prev.map((s) => (s.id === suggId ? { ...s, status: "rejected" } : s))
    );
  };

  // Undo edit
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setContent(last.content);
    setLinterSuggestions(last.suggestions);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    runLinterAnalysis(last.content);
  };

  // Save the Final Newsletter Article
  const handleSaveFinalArticle = async () => {
    if (!content.trim() || !activeProject) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: articleId || undefined,
          projectId: activeProject.id,
          projectTitle: activeProject.title,
          angleId: selectedAngleId || undefined,
          angleTitle: activeAngle?.title,
          headline,
          content,
          targetWordCount,
          status: "ready",
          sourceLinks: activeProject.sources.map((s, idx) => ({
            title: s.title,
            url: s.url,
            sourceIndex: idx + 1,
          })),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save article error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Forward Draft to Full Writing Assistant
  const handleSendToWritingAssistant = async () => {
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: articleId || undefined,
          title: headline || "Untitled Newsletter Draft",
          content,
          originalContent: originalContent || content,
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

  const handleResetToOriginal = () => {
    if (confirm("Reset current draft back to the original unmodified text?")) {
      setContent(originalContent);
      setHeadline(originalHeadline);
      setHistory([]);
      runLinterAnalysis(originalContent);
    }
  };

  const pendingLinterSuggestions = linterSuggestions.filter((s) => s.status === "pending");
  const acceptedCount = linterSuggestions.filter((s) => s.status === "accepted").length;
  const dismissedCount = linterSuggestions.filter((s) => s.status === "rejected").length;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-16"
    >
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Newsletter Studio
            </h2>
            <Badge variant="amber" className="text-[10px] py-0.5">
              Target: 300–500 Words
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Synthesize evidence briefs into compelling, publication-grade newsletter editions with traceable source links.
          </p>
        </div>

        {content && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="gap-1.5 text-xs"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveFinalArticle}
              isLoading={isSaving}
              className="gap-1.5 text-xs"
            >
              {saveSuccess ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saveSuccess ? "Saved to Library!" : "Save Final Article"}</span>
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={handleSendToWritingAssistant}
              className="gap-1.5 shadow-sm text-xs"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Send to Writing Assistant</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Send}
          title="No Research Briefs Available"
          description="Newsletter Studio builds publication editions directly on top of verified research briefs. Synthesize a brief in Research Assistant to unlock angle selection and draft generation."
          actionLabel="Go to Research Assistant"
          actionHref="/research"
          badge="Brief Required"
          tip="Newsletter editions are anchored to indexed research sources to ensure every technical claim is verifiable."
        />
      ) : (
        <>
          {/* Control Console: Project & Angle Selection */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-400" />
                  <span>1. Editorial Parameters & Brief Selection</span>
                </CardTitle>

                {activeProject?.brief && (
                  <button
                    onClick={() => setShowBriefPreview(!showBriefPreview)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>{showBriefPreview ? "Hide Brief Details" : "Inspect Research Evidence"}</span>
                    {showBriefPreview ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Project Picker */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                    Research Brief
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedAngleId("");
                    }}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
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
                      Target Length: {targetWordCount} words
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
                    Editorial Voice
                  </label>
                  <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
                    {(["analytical", "technical", "executive"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`flex-1 py-1.5 rounded-md capitalize font-medium transition-colors ${
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

              {/* Collapsible Research Brief Inspection */}
              {showBriefPreview && activeProject?.brief && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-4 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-blue-900/30 pb-2">
                    <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Verified Evidence Grounding ({activeProject.sources.length} Sources)</span>
                    </span>
                    <span className="text-zinc-400">Synthesized Brief</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="font-semibold text-zinc-300 block mb-1">
                        What Happened:
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        {activeProject.brief.whatHappened}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-zinc-300 block mb-1">
                        Why It Matters:
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        {activeProject.brief.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-900/20">
                    <span className="font-semibold text-zinc-300 block mb-1.5">
                      Verified Facts Traceability:
                    </span>
                    <ul className="space-y-1 text-zinc-400">
                      {activeProject.brief.verifiedFacts.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{f.fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Angle Picker Cards */}
              {angles.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-zinc-300 block">
                    2. Select Story Angle ({angles.length} synthesized in brief)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {angles.map((ang) => (
                      <div
                        key={ang.id}
                        onClick={() => setSelectedAngleId(ang.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                          selectedAngleId === ang.id
                            ? "border-blue-500 bg-blue-950/20 text-blue-100 shadow-sm shadow-blue-500/10"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="outline" className="text-[9px] py-0 text-zinc-400">
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
                <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-3 text-xs text-amber-300">
                  This project does not have a synthesized brief yet. Please open Research Assistant and generate a brief first.
                </div>
              )}

              {/* Trigger Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="accent"
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedProjectId || !selectedAngleId}
                  className="gap-2 shadow-sm text-xs"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing 300–500w Editorial...</span>
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
              {/* Studio Workspace Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeTab === "editor"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Editorial Editor</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("linter");
                      runLinterAnalysis(content);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeTab === "linter"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Writing Feedback & Linter ({pendingLinterSuggestions.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("diff")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeTab === "diff"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Split className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Before & After Versions</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {isOptimalWordCount ? (
                    <Badge variant="emerald" className="text-xs">
                      {currentWordCount} words • Optimal Length (300–500w)
                    </Badge>
                  ) : (
                    <Badge variant="amber" className="text-xs">
                      {currentWordCount} words (Target: 300–500w)
                    </Badge>
                  )}
                  <span className="text-zinc-500 font-mono">
                    ~{(currentWordCount / 220).toFixed(1)} min read
                  </span>
                </div>
              </div>

              {/* Tab 1: Editorial Editor */}
              {activeTab === "editor" && (
                <Card className="overflow-hidden border-zinc-800 bg-zinc-900/70 p-6 space-y-4">
                  {/* Headline Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                        Headline
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        {headline.length} characters
                      </span>
                    </div>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="text-xl font-bold bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-0 h-10 text-zinc-100"
                      placeholder="Article Headline..."
                    />
                  </div>

                  {/* Newsletter Body Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                        Article Body (Markdown Enabled • Structured Editorial Output)
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {content.length} chars • {currentWordCount} words
                      </span>
                    </div>
                    <Textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                      }}
                      onBlur={() => runLinterAnalysis(content)}
                      rows={16}
                      className="font-serif text-base text-zinc-100 leading-relaxed bg-zinc-950/60 p-5 rounded-lg border-zinc-800"
                    />
                  </div>

                  {/* Traceable Source Hyperlinks Footer */}
                  {activeProject?.sources && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                        Traceable Supporting Sources & Evidence References
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

                  {/* Action Bar Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                    <button
                      onClick={handleResetToOriginal}
                      className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset to Original Draft</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setActiveTab("linter");
                          runLinterAnalysis(content);
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>Review Writing Feedback ({pendingLinterSuggestions.length})</span>
                      </Button>

                      <Button
                        variant="accent"
                        size="sm"
                        onClick={handleSaveFinalArticle}
                        isLoading={isSaving}
                        className="gap-1.5 text-xs shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Final Newsletter Article</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tab 2: Integrated Writing Feedback & Linter */}
              {activeTab === "linter" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>Editorial Critique & Suggestions</span>
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Evaluates long sentences, passive constructions, tech buzzwords, and reading ease.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className="text-xs gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Undo {history.length > 0 ? `(${history.length})` : ""}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runLinterAnalysis(content)}
                        isLoading={isLinting}
                        className="text-xs gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Re-Analyze</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSendToWritingAssistant}
                        className="text-xs gap-1.5"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                        <span>Open in Writing Assistant Canvas</span>
                      </Button>
                    </div>
                  </div>

                  {/* Linter Cards Grid */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {pendingLinterSuggestions.length > 0 ? (
                        pendingLinterSuggestions.map((sugg) => (
                          <motion.div
                            key={sugg.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              {getBadgeForType(sugg.type)}
                              <span className="font-mono text-[10px] text-zinc-500">
                                #{sugg.id}
                              </span>
                            </div>

                            {/* Original Flagged Passage */}
                            <div className="rounded-lg bg-zinc-900/90 border border-zinc-800 p-2.5 text-xs text-zinc-300 font-serif italic">
                              "{sugg.originalText}"
                            </div>

                            {/* Issue & Why it matters */}
                            <div className="space-y-1 text-xs text-zinc-400">
                              <p>
                                <span className="font-semibold text-zinc-300">Issue:</span>{" "}
                                {sugg.explanation}
                              </p>
                              <p className="text-[11px] text-zinc-500">
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
                                <p className="font-serif font-medium">
                                  {sugg.suggestedText}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-2 text-xs text-zinc-400 italic">
                                Editorial proposal: Delete this filler phrase to streamline the sentence.
                              </div>
                            )}

                            {/* Actions: Accept or Reject */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-900">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectSuggestion(sugg.id)}
                                className="text-xs h-7 text-zinc-500 hover:text-zinc-300"
                              >
                                <X className="h-3 w-3 mr-1" />
                                <span>Reject</span>
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAcceptSuggestion(sugg)}
                                className="text-xs h-7 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/60"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span>Accept Rewrite</span>
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12 text-zinc-500 text-xs space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mx-auto" />
                          <p className="font-medium text-zinc-300">
                            Clean Editorial Bill of Health!
                          </p>
                          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                            No active stylistic issues found in this article. Prose is concise, active, and technically rigorous.
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Tab 3: Before & After Version Comparison */}
              {activeTab === "diff" && (
                <div className="space-y-4">
                  {/* Delta Metrics Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-semibold text-zinc-300">
                        Editorial Revision Audit:
                      </span>
                      <Badge variant="emerald" className="gap-1">
                        <Check className="h-3 w-3" />
                        <span>{acceptedCount} Improvements Accepted</span>
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <X className="h-3 w-3" />
                        <span>{dismissedCount} Suggestions Dismissed</span>
                      </Badge>
                      <span className="font-mono text-zinc-400 pl-2">
                        Word Delta:{" "}
                        <span
                          className={
                            currentWordCount <= countWords(originalContent)
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }
                        >
                          {currentWordCount - countWords(originalContent)} words
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveFinalArticle}
                        isLoading={isSaving}
                        className="gap-1.5 text-xs h-8"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Final Article</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("editor")}
                        className="gap-1.5 text-xs h-8"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Return to Editor</span>
                      </Button>
                    </div>
                  </div>

                  {/* Side-by-Side Version Cards */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Original Generated Draft */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                      <CardHeader className="pb-2 border-b border-zinc-800">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="w-fit text-[10px] mb-1">
                            Original Generated Draft
                          </Badge>
                          <span className="font-mono text-[11px] text-zinc-400">
                            {countWords(originalContent)} words
                          </span>
                        </div>
                        <CardTitle className="text-sm font-semibold text-zinc-300">
                          {originalHeadline || headline}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 font-serif text-sm leading-relaxed text-zinc-400 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                        {originalContent}
                      </CardContent>
                    </Card>

                    {/* Polished Final Text */}
                    <Card className="border-emerald-900/40 bg-zinc-900/70">
                      <CardHeader className="pb-2 border-b border-zinc-800">
                        <div className="flex items-center justify-between">
                          <Badge variant="emerald" className="w-fit text-[10px] mb-1">
                            Polished Final Edition
                          </Badge>
                          <span className="font-mono text-[11px] text-emerald-400">
                            {currentWordCount} words
                          </span>
                        </div>
                        <CardTitle className="text-sm font-semibold text-emerald-300">
                          {headline}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 font-serif text-sm leading-relaxed text-zinc-100 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                        {content}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
