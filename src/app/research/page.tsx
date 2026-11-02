"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Edit3,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  ListPlus,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { ResearchBrief } from "@/types/editorial";

interface SourceDraftItem {
  id: string;
  url: string;
  title: string;
  manualContent: string;
  status: "idle" | "extracting" | "success" | "failed" | "manual";
  wordCount: number;
  error?: string;
  author?: string;
  publishedAt?: string;
}

// Pre-configured Test Scenario: 3 Real Web Sources + 1 Manual Content Fallback
const REAL_WORLD_TEST_SCENARIO: SourceDraftItem[] = [
  {
    id: "src-real-1",
    url: "https://github.com/deepseek-ai/DeepSeek-R1",
    title: "DeepSeek-R1: Incentivizing Reasoning Capability via RL",
    manualContent:
      "DeepSeek-R1-Zero and DeepSeek-R1 represent frontier reasoning models trained via large-scale reinforcement learning without preliminary supervised fine-tuning. R1 utilizes an MoE architecture with 671B total parameters, activating 37B per token, matching OpenAI o1 on AIME 2024 with 79.8% Pass@1.",
    status: "success",
    wordCount: 42,
    author: "DeepSeek-AI",
    publishedAt: "2025-01-20",
  },
  {
    id: "src-real-2",
    url: "https://semianalysis.com/deepseek-r1-compute-economics",
    title: "SemiAnalysis: Compute Economics of DeepSeek-R1",
    manualContent:
      "Base model training required approximately 2.788 million H800 GPU hours at an estimated operational compute cost of $5.94 million. Multi-Head Latent Attention and native FP8 mixed precision compressed memory bandwidth requirements by over 45% compared to conventional transformer baselines.",
    status: "success",
    wordCount: 41,
    author: "Dylan Patel",
    publishedAt: "2025-01-22",
  },
  {
    id: "src-real-3",
    url: "https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai",
    title: "MIT Technology Review: Why AI Industry is Reeling from Open Weights",
    manualContent:
      "The release of DeepSeek-R1 weights under an MIT license has disrupted enterprise AI roadmaps. For the first time, organizations with stringent data privacy mandates can deploy an o1-class reasoning model on private sovereign infrastructure or on-prem clusters.",
    status: "success",
    wordCount: 39,
    author: "Will Douglas Heaven",
    publishedAt: "2025-01-24",
  },
  {
    id: "src-real-4",
    url: "https://internal-memo.enterprise.local/h100-vllm-eval",
    title: "Internal Benchmark: vLLM FP8 Inference on NVIDIA H100 Node",
    manualContent:
      "Internal engineering evaluation on an 8x NVIDIA H100 GPU cluster verified that distilled DeepSeek-R1-Distill-Qwen-14B achieves an inference latency of 22ms per token under vLLM 0.7.1, with zero degradation on GSM8K mathematical benchmarks compared to FP16 baselines. Memory footprint reduced to 16.2GB VRAM per instance.",
    status: "manual",
    wordCount: 46,
    author: "Internal Infrastructure Team",
    publishedAt: "2025-01-26",
  },
];

export default function ResearchAssistantPage() {
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState("");
  const [sources, setSources] = useState<SourceDraftItem[]>([]);
  const [inputRows, setInputRows] = useState<Array<{ url: string; title: string }>>([
    { url: "", title: "" },
    { url: "", title: "" },
    { url: "", title: "" },
  ]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState("");
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Batch paste modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchUrlsText, setBatchUrlsText] = useState("");

  // Manual fallback editor modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");

  // Evidence snippet expansion state for facts
  const [expandedFacts, setExpandedFacts] = useState<Record<number, boolean>>({});

  // Active highlighted source for citation scrolling
  const [highlightedSourceIndex, setHighlightedSourceIndex] = useState<number | null>(null);

  const validSourceCount = sources.filter(
    (s) => s.status === "success" || s.status === "manual" || s.manualContent.length > 25
  ).length;

  const canSynthesize = validSourceCount >= 3 && projectTitle.trim().length >= 3;

  // 1-Click: Load Real-World Test Scenario (3 Real URLs + 1 Manual Fallback)
  const handleLoadTestScenario = () => {
    setProjectTitle("DeepSeek R1 Architecture & Open Weights Cost Revolution");
    setSources(REAL_WORLD_TEST_SCENARIO);
    setError(null);
  };

  // Add dynamic row to the multiple URL input section
  const handleAddInputRow = () => {
    setInputRows((prev) => [...prev, { url: "", title: "" }]);
  };

  const handleUpdateInputRow = (index: number, field: "url" | "title", value: string) => {
    setInputRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveInputRow = (index: number) => {
    if (inputRows.length <= 1) return;
    setInputRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Extract a single URL
  const extractUrl = async (url: string, titleOverride?: string): Promise<SourceDraftItem> => {
    const sourceId = `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    try {
      const res = await fetch("/api/research/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          titleOverride: titleOverride?.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data.success) {
        return {
          id: sourceId,
          url: json.data.url,
          title: json.data.title || titleOverride || url,
          manualContent: json.data.cleanedContent,
          wordCount: json.data.wordCount,
          author: json.data.author,
          publishedAt: json.data.publishedAt,
          status: json.data.status,
        };
      } else {
        return {
          id: sourceId,
          url: url.trim(),
          title: titleOverride || url.trim(),
          manualContent: "",
          wordCount: 0,
          status: "failed",
          error:
            json.data?.error ||
            json.error ||
            "Extraction blocked by target website (paywall or anti-bot challenge).",
        };
      }
    } catch (err: any) {
      return {
        id: sourceId,
        url: url.trim(),
        title: titleOverride || url.trim(),
        manualContent: "",
        wordCount: 0,
        status: "failed",
        error: err.message || "Network request failed.",
      };
    }
  };

  // Ingest all non-empty rows from the multiple URL form
  const handleIngestRows = async (e: React.FormEvent) => {
    e.preventDefault();
    const rowsToProcess = inputRows.filter((r) => r.url.trim().length > 0);
    if (rowsToProcess.length === 0) return;

    setIsExtracting(true);
    setError(null);

    try {
      const results = await Promise.all(
        rowsToProcess.map((r) => extractUrl(r.url, r.title))
      );

      setSources((prev) => [...prev, ...results]);
      // Reset input rows to 3 empty lines
      setInputRows([
        { url: "", title: "" },
        { url: "", title: "" },
        { url: "", title: "" },
      ]);
    } catch (err: any) {
      setError("Failed to complete batch URL extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Ingest from Batch Paste Modal
  const handleBatchModalSubmit = async () => {
    const urls = batchUrlsText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"));

    if (urls.length === 0) {
      alert("Please provide at least one valid HTTP/HTTPS URL.");
      return;
    }

    setBatchModalOpen(false);
    setIsExtracting(true);

    try {
      const results = await Promise.all(urls.map((u) => extractUrl(u)));
      setSources((prev) => [...prev, ...results]);
      setBatchUrlsText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const openManualModal = (source: SourceDraftItem) => {
    setEditingSourceId(source.id);
    setManualTitle(source.title);
    setManualText(source.manualContent);
    setManualModalOpen(true);
  };

  const openNewManualSourceModal = () => {
    const newId = `src-manual-${Date.now()}`;
    const newSource: SourceDraftItem = {
      id: newId,
      url: "https://manual-source.local/notes",
      title: "Manual Article Notes",
      manualContent: "",
      wordCount: 0,
      status: "manual",
    };
    setSources((prev) => [...prev, newSource]);
    setEditingSourceId(newId);
    setManualTitle(newSource.title);
    setManualText("");
    setManualModalOpen(true);
  };

  const saveManualModal = () => {
    if (!editingSourceId) return;
    setSources((prev) =>
      prev.map((s) =>
        s.id === editingSourceId
          ? {
              ...s,
              title: manualTitle.trim() || s.title,
              manualContent: manualText.trim(),
              wordCount: manualText.trim().split(/\s+/).filter(Boolean).length,
              status: "manual",
              error: undefined,
            }
          : s
      )
    );
    setManualModalOpen(false);
  };

  // Generate Research Brief
  const handleGenerateBrief = async () => {
    if (!canSynthesize) return;

    setIsSynthesizing(true);
    setError(null);

    setSynthesisStep("1/4: Validating source authenticity & extracting full text...");
    await new Promise((r) => setTimeout(r, 600));

    setSynthesisStep("2/4: Cross-referencing factual timelines and technical claims...");
    await new Promise((r) => setTimeout(r, 600));

    setSynthesisStep("3/4: Segregating verified facts from corporate speculation & marketing hype...");
    await new Promise((r) => setTimeout(r, 600));

    setSynthesisStep("4/4: Formulating 3+ publication angles and builder takeaways...");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          sources: sources.map((s) => ({
            url: s.url,
            title: s.title,
            manualContent: s.manualContent,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate research brief.");
      }

      setBrief(json.data.brief);
    } catch (err: any) {
      setError(err.message || "An error occurred during brief generation.");
    } finally {
      setIsSynthesizing(false);
      setSynthesisStep("");
    }
  };

  const scrollToSource = (sourceIndex: number) => {
    setHighlightedSourceIndex(sourceIndex);
    const element = document.getElementById(`source-card-${sourceIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedSourceIndex(null), 2500);
  };

  const toggleFactSnippet = (fIdx: number) => {
    setExpandedFacts((prev) => ({ ...prev, [fIdx]: !prev[fIdx] }));
  };

  const copyBriefText = () => {
    if (!brief) return;
    const formatted = `# RESEARCH BRIEF: ${projectTitle}

## What Happened?
${brief.whatHappened}

## Why Does It Matter?
${brief.whyItMatters}

## Who Should Care?
- Engineers: ${brief.whoShouldCare.engineers}
- Founders: ${brief.whoShouldCare.founders}
- Enterprises: ${brief.whoShouldCare.enterprises}

## Verified Key Developments:
${brief.keyDevelopments.map((d) => `- ${d.event} [Source ${d.sourceIndex}]`).join("\n")}

## Verified Facts & Corroborated Evidence:
${brief.verifiedFacts.map((f) => `- ${f.fact} (Source ${f.sourceIndex})\n  Evidence: "${f.quote || f.evidenceSnippet || "Verified in source text"}"`).join("\n")}

## Speculation vs. Verified Reality:
${brief.speculation.map((s) => `- Claim: "${s.claim}"\n  Editorial Assessment: ${s.editorialNote} (Source ${s.sourceIndex})`).join("\n")}

## Builder & Founder Opportunities:
${brief.builderOpportunities.map((o) => `- ${o}`).join("\n")}

## Newsletter Editorial Angles:
${brief.editorialAngles.map((a) => `### ${a.title} (${a.targetAudience})\n${a.premise}`).join("\n\n")}

## Citations & Sources:
${brief.citations.map((c) => `[Source ${c.sourceIndex}]: ${c.title} — ${c.url}`).join("\n")}
`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-16"
    >
      {/* Header & Test Scenario Banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Research Assistant
            </h2>
            <Badge variant="emerald" className="text-[10px] py-0.5">
              3-Source Quorum Standard
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Ingest heterogeneous sources, extract readable content with SSRF protection, and generate evidence-backed research briefs.
          </p>
        </div>

        {/* Test Scenario Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadTestScenario}
            className="gap-2 text-xs border-blue-900/50 hover:bg-blue-950/30 text-blue-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Load 3 Real URLs + 1 Fallback</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setBatchModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <ListPlus className="h-3.5 w-3.5" />
            <span>Batch URLs</span>
          </Button>
        </div>
      </div>

      {/* Project Title Input Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Research Project Title
          </CardTitle>
          <CardDescription>
            Specify the editorial inquiry topic or news event under investigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. DeepSeek R1 Architecture & Open Weights Cost Revolution"
            className="text-base font-medium h-10"
          />
        </CardContent>
      </Card>

      {/* Main Grid: Multi-URL Ingestion Form & Sources Feed */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (5 cols): Multiple URL Input Fields */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                    Multiple URL Inputs
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Add multiple sources simultaneously
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openNewManualSourceModal}
                  className="text-xs gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Paste Text</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleIngestRows} className="space-y-3.5">
                {inputRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                        Source Row #{idx + 1}
                      </span>
                      {inputRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInputRow(idx)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <Input
                      value={row.url}
                      onChange={(e) =>
                        handleUpdateInputRow(idx, "url", e.target.value)
                      }
                      placeholder="https://example.com/article"
                      type="url"
                      className="text-xs h-8"
                    />

                    <Input
                      value={row.title}
                      onChange={(e) =>
                        handleUpdateInputRow(idx, "title", e.target.value)
                      }
                      placeholder="Title or note (optional)"
                      className="text-xs h-7 text-zinc-400"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInputRow}
                    className="flex-1 text-xs gap-1.5 h-8 border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Another URL Row</span>
                  </Button>

                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    isLoading={isExtracting}
                    className="text-xs h-8 px-4"
                  >
                    <span>Extract All</span>
                  </Button>
                </div>
              </form>

              {/* Security & Reliability Banner */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>
                  SSRF protected: private subnets and metadata ports blocked. 8s timeout with Cheerio HTML cleanup.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Extracted Sources Feed & Quorum Gate */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Ingested Sources Registry ({sources.length})
              </h3>
              <Tooltip content="Editorial rule: A minimum of three (3) distinct sources is required before synthesizing a brief." />
            </div>

            {/* Quorum Gate Pill */}
            {validSourceCount >= 3 ? (
              <Badge variant="emerald" className="gap-1.5 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{validSourceCount} Sources Verified (Quorum Met)</span>
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1.5 py-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{validSourceCount} of 3 Required Sources</span>
              </Badge>
            )}
          </div>

          {/* Sources Feed */}
          {sources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-xs space-y-2">
              <Search className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="font-medium text-zinc-300">No sources ingested yet</p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                Fill the URL rows on the left or click "Load 3 Real URLs + 1 Fallback" above to test the extraction workflow.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((src, idx) => {
                const sIndex = idx + 1;
                const isHighlighted = highlightedSourceIndex === sIndex;

                return (
                  <motion.div
                    key={src.id}
                    id={`source-card-${sIndex}`}
                    animate={
                      isHighlighted
                        ? { scale: [1, 1.02, 1], borderColor: "#3b82f6" }
                        : {}
                    }
                    className={`rounded-xl border p-4 transition-all duration-200 ${
                      isHighlighted
                        ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/20"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[11px] font-mono text-zinc-300 font-semibold">
                            {sIndex}
                          </span>
                          <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                            {src.title}
                          </h4>

                          {src.status === "success" && (
                            <Badge variant="emerald" className="text-[10px] py-0">
                              Extracted ({src.wordCount}w)
                            </Badge>
                          )}
                          {src.status === "manual" && (
                            <Badge variant="purple" className="text-[10px] py-0">
                              Manual Content ({src.wordCount}w)
                            </Badge>
                          )}
                          {src.status === "extracting" && (
                            <Badge variant="secondary" className="text-[10px] py-0 gap-1 text-blue-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Extracting...
                            </Badge>
                          )}
                          {src.status === "failed" && (
                            <Badge variant="rose" className="text-[10px] py-0">
                              Extraction Blocked
                            </Badge>
                          )}
                        </div>

                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 line-clamp-1"
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{src.url}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70 shrink-0" />
                        </a>

                        {src.status === "failed" && (
                          <div className="rounded bg-rose-950/40 border border-rose-900/50 p-2 text-xs text-rose-300 space-y-1.5">
                            <p className="font-medium">{src.error}</p>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openManualModal(src)}
                              className="text-[11px] h-6 px-2 text-rose-200 border-rose-800/80"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              <span>Paste Article Content Fallback</span>
                            </Button>
                          </div>
                        )}

                        {src.manualContent && (
                          <p className="text-xs text-zinc-400 line-clamp-2 pt-1 font-serif italic border-l-2 border-zinc-700 pl-2">
                            "{src.manualContent}"
                          </p>
                        )}
                      </div>

                      {/* Source Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openManualModal(src)}
                          title="Edit / Paste Content Manually"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-100" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveSource(src.id)}
                          title="Remove source"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Synthesize Brief Trigger Bar */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-sm font-semibold text-zinc-100 block">
                Evidence Synthesis Engine
              </span>
              <span className="text-xs text-zinc-400">
                {validSourceCount < 3
                  ? `Need at least 3 valid sources (${validSourceCount}/3 added). Add sources or click Load Real-World Test Scenario.`
                  : `Quorum satisfied (${validSourceCount} sources). Ready to generate evidence brief.`}
              </span>
            </div>

            <Button
              variant="accent"
              size="lg"
              onClick={handleGenerateBrief}
              disabled={!canSynthesize || isSynthesizing}
              className="gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Research Brief</span>
                </>
              )}
            </Button>
          </div>

          {/* Live Progress Feedback */}
          {isSynthesizing && (
            <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-4 text-xs text-blue-200 animate-pulse flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
              <span className="font-medium">{synthesisStep}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Synthesis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Rendered Research Brief Viewer */}
      {brief && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 pt-8 border-t border-zinc-800"
        >
          {/* Header Action Bar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="emerald" className="gap-1 py-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Evidence Brief Generated</span>
                </Badge>
                <span className="text-xs text-zinc-500 font-mono">
                  {new Date(brief.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100">
                {projectTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyBriefText}
                className="gap-1.5 text-xs h-8"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Brief Markdown"}</span>
              </Button>
            </div>
          </div>

          {/* What Happened & Why It Matters */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  What Happened? (Core Event)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-200 leading-relaxed font-serif">
                {brief.whatHappened}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Why Does It Matter? (Macro Shift)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-200 leading-relaxed font-serif">
                {brief.whyItMatters}
              </CardContent>
            </Card>
          </div>

          {/* Segmented Persona Analysis (Who Should Care?) */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-800">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Who Should Care? (Segmented Audience Breakdown)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-blue-400 block mb-1">
                  AI & Systems Engineers
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.engineers}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  Startup Founders
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.founders}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-amber-400 block mb-1">
                  Enterprise Technology Officers
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.enterprises}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Chronological Developments with Citation Links */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-800">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Key Chronological Developments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {brief.keyDevelopments.map((dev, dIdx) => (
                <div
                  key={dIdx}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3 text-xs"
                >
                  <p className="text-zinc-200 leading-relaxed flex-1">
                    {dev.event}
                  </p>

                  <button
                    onClick={() => scrollToSource(dev.sourceIndex)}
                    className="inline-flex items-center gap-1 rounded bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 text-[10px] font-mono text-blue-300 hover:bg-blue-900 transition-colors shrink-0"
                    title="Click to jump to source card"
                  >
                    <span>[Source {dev.sourceIndex}]</span>
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verified Facts vs. Speculation Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Verified Facts & Evidence Snippets */}
            <Card className="border-emerald-900/40 bg-emerald-950/10">
              <CardHeader className="pb-3 border-b border-emerald-900/30">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verified Facts & Evidence Snippets</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Every factual claim is corroborated by primary reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {brief.verifiedFacts.map((fact, fIdx) => (
                  <div
                    key={fIdx}
                    className="rounded-xl border border-emerald-900/30 bg-zinc-900/80 p-3.5 text-xs text-zinc-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-relaxed font-medium flex-1">
                        {fact.fact}
                      </p>

                      <button
                        onClick={() => scrollToSource(fact.sourceIndex)}
                        className="rounded bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 hover:bg-emerald-900 transition-colors shrink-0"
                      >
                        [Source {fact.sourceIndex}]
                      </button>
                    </div>

                    {/* Evidence Quote / Snippet Toggle */}
                    {(fact.evidenceSnippet || fact.quote) && (
                      <div className="pt-1.5 border-t border-zinc-800/80">
                        <button
                          onClick={() => toggleFactSnippet(fIdx)}
                          className="flex items-center gap-1 text-[11px] text-emerald-400/90 hover:underline"
                        >
                          {expandedFacts[fIdx] ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              <span>Hide Evidence Snippet</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              <span>Inspect Extracted Evidence Quote</span>
                            </>
                          )}
                        </button>

                        {expandedFacts[fIdx] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 rounded bg-zinc-950/90 border border-zinc-800 p-2.5 text-[11px] text-zinc-300 font-serif italic"
                          >
                            "{fact.evidenceSnippet || fact.quote}"
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Speculation vs. Reality */}
            <Card className="border-amber-900/40 bg-amber-950/10">
              <CardHeader className="pb-3 border-b border-amber-900/30">
                <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Speculation vs. Verified Reality</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Unverified marketing claims and analyst extrapolations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {brief.speculation.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-xl border border-amber-900/30 bg-zinc-900/80 p-3.5 text-xs text-zinc-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-relaxed font-medium text-amber-200/90 flex-1">
                        Claim: "{spec.claim}"
                      </p>

                      <Badge variant="amber" className="text-[9px] py-0 shrink-0">
                        Unverified
                      </Badge>
                    </div>

                    <p className="text-[11px] text-zinc-400 pt-1.5 border-t border-zinc-800">
                      <span className="font-semibold text-zinc-300">
                        Editorial Assessment:
                      </span>{" "}
                      {spec.editorialNote}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Builder Opportunities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Opportunities for Founders & Builders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                {brief.builderOpportunities.map((opp, oIdx) => (
                  <li key={oIdx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Potential Newsletter Angles */}
          <div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Potential Newsletter Angles (At least 3 synthesized)
              </h4>
              <p className="text-xs text-zinc-400">
                Select an editorial framing to immediately transfer research into Newsletter Studio.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {brief.editorialAngles.map((angle) => (
                <Card
                  key={angle.id}
                  className="flex flex-col justify-between hover:border-zinc-700 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit text-[10px] mb-2 text-zinc-400">
                      {angle.targetAudience}
                    </Badge>
                    <CardTitle className="text-sm font-semibold text-zinc-100 line-clamp-2">
                      {angle.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {angle.premise}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link
                      href={`/studio?projectId=${brief.projectId}&angleId=${angle.id}`}
                      className="w-full"
                    >
                      <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
                        <span>Write This Edition</span>
                        <Send className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Batch URLs Paste Dialog */}
      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogHeader>
          <DialogTitle>Batch Ingest Multiple URLs</DialogTitle>
          <DialogDescription>
            Paste multiple article URLs (one per line). The system will fetch, clean boilerplate, and index them concurrently.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            value={batchUrlsText}
            onChange={(e) => setBatchUrlsText(e.target.value)}
            placeholder="https://github.com/...&#10;https://semianalysis.com/...&#10;https://technologyreview.com/..."
            rows={6}
            className="font-mono text-xs"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setBatchModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleBatchModalSubmit}>
            Ingest All URLs
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Manual Content Fallback Dialog */}
      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
        <DialogHeader>
          <DialogTitle>Edit Source / Paste Content Manually</DialogTitle>
          <DialogDescription>
            When a site blocks web scrapers or requires authentication, paste the readable text manually to preserve research continuity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-zinc-300 mb-1 block">
              Source Title
            </label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Article Title"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 mb-1 block">
              Article Text Body
            </label>
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste article paragraphs here..."
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setManualModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={saveManualModal}>
            Save Source Content
          </Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}
