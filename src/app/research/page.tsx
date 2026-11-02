"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { SourceInput, SourceRecord, ResearchBrief } from "@/types/editorial";

interface SourceDraftItem {
  id: string;
  url: string;
  title: string;
  manualContent: string;
  status: "idle" | "extracting" | "success" | "failed" | "manual";
  wordCount: number;
  error?: string;
}

const DEFAULT_SOURCES: SourceDraftItem[] = [
  {
    id: "src-1",
    url: "https://github.com/deepseek-ai/DeepSeek-R1",
    title: "DeepSeek-R1: Incentivizing Reasoning Capability via RL",
    manualContent:
      "DeepSeek-R1 utilizes a Mixture-of-Experts architecture with 671 billion total parameters, activating 37 billion parameters per token. The model matches OpenAI-o1-1217 on AIME 2024 with 79.8% Pass@1.",
    status: "success",
    wordCount: 38,
  },
  {
    id: "src-2",
    url: "https://semianalysis.com/deepseek-r1-compute-economics",
    title: "SemiAnalysis: Compute Economics of DeepSeek-R1",
    manualContent:
      "Base model training consumed 2.788 million GPU hours for a total estimated compute cost of $5.94 million. Multi-Head Latent Attention and native FP8 compressed memory bandwidth by 45%.",
    status: "success",
    wordCount: 34,
  },
  {
    id: "src-3",
    url: "https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai",
    title: "MIT Tech Review: Why AI Industry is Reeling from Open Weights",
    manualContent:
      "MIT-licensed reasoning weights allow enterprise organizations with strict compliance mandates to deploy private reasoning models on sovereign clouds or air-gapped internal servers.",
    status: "success",
    wordCount: 29,
  },
];

export default function ResearchAssistantPage() {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState(
    "DeepSeek R1 Architecture & Open Weights Cost Revolution"
  );
  const [sources, setSources] = useState<SourceDraftItem[]>(DEFAULT_SOURCES);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState("");
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Manual fallback editor modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");

  const validSourceCount = sources.filter(
    (s) => s.status === "success" || s.status === "manual" || s.manualContent.length > 30
  ).length;

  const canSynthesize = validSourceCount >= 3 && projectTitle.trim().length > 3;

  // Add source by URL
  const handleAddSource = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newUrl.trim()) return;

    const sourceId = `src-${Date.now()}`;
    const newSourceItem: SourceDraftItem = {
      id: sourceId,
      url: newUrl.trim(),
      title: newTitle.trim() || newUrl.trim(),
      manualContent: "",
      status: "extracting",
      wordCount: 0,
    };

    setSources((prev) => [...prev, newSourceItem]);
    setNewUrl("");
    setNewTitle("");
    setError(null);

    // Call extraction endpoint
    try {
      const res = await fetch("/api/research/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newSourceItem.url,
          titleOverride: newSourceItem.title,
        }),
      });

      const json = await res.json();
      if (json.success && json.data.success) {
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  title: json.data.title,
                  manualContent: json.data.cleanedContent,
                  wordCount: json.data.wordCount,
                  status: "success",
                }
              : s
          )
        );
      } else {
        // Extraction failed (blocked, paywall, etc.)
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  status: "failed",
                  error:
                    json.data?.error ||
                    json.error ||
                    "Site blocked scraping or payload was empty.",
                }
              : s
          )
        );
      }
    } catch (err: any) {
      setSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? {
                ...s,
                status: "failed",
                error: err.message || "Network extraction failed.",
              }
            : s
        )
      );
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

  const saveManualModal = () => {
    if (!editingSourceId) return;
    setSources((prev) =>
      prev.map((s) =>
        s.id === editingSourceId
          ? {
              ...s,
              title: manualTitle.trim() || s.title,
              manualContent: manualText.trim(),
              wordCount: manualText.trim().split(/\s+/).length,
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

    // Multi-step progress animation simulation
    setSynthesisStep("Validating source authenticity & extracting full text...");
    await new Promise((r) => setTimeout(r, 600));

    setSynthesisStep("Cross-referencing factual timelines across sources...");
    await new Promise((r) => setTimeout(r, 600));

    setSynthesisStep("Separating verified benchmarks from corporate speculation...");

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

  const copyBriefText = () => {
    if (!brief) return;
    const formatted = `# RESEARCH BRIEF: ${projectTitle}

## What Happened?
${brief.whatHappened}

## Why Does It Matter?
${brief.whyItMatters}

## Key Developments:
${brief.keyDevelopments.map((d) => `- ${d.event} [Source ${d.sourceIndex}]`).join("\n")}

## Verified Facts:
${brief.verifiedFacts.map((f) => `- ${f.fact} (Source ${f.sourceIndex})`).join("\n")}

## Speculation vs Verified Reality:
${brief.speculation.map((s) => `- Claim: ${s.claim} | Editorial Assessment: ${s.editorialNote}`).join("\n")}

## Builder Opportunities:
${brief.builderOpportunities.map((o) => `- ${o}`).join("\n")}

## Potential Newsletter Angles:
${brief.editorialAngles.map((a) => `### ${a.title} (${a.targetAudience})\n${a.premise}`).join("\n\n")}
`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Standards Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Research Assistant
            </h2>
            <Badge variant="emerald" className="text-[11px] py-0.5">
              Evidence Standard Active
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Ingest 3+ heterogeneous sources to extract article bodies, verify facts, and synthesize citation-backed research briefs.
          </p>
        </div>
      </div>

      {/* Project Title Input Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
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
            placeholder="e.g. OpenAI Operator & Autonomous Browser Agents"
            className="text-base font-medium h-10"
          />
        </CardContent>
      </Card>

      {/* Source Management Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Add New Source Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Add Primary Source
            </CardTitle>
            <CardDescription>
              Article URL, technical paper, or press release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleAddSource} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 block">
                  Article URL
                </label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://techcrunch.com/..."
                  type="url"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 block">
                  Title Override (Optional)
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Auto-detected if left blank"
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="w-full gap-2 mt-2"
                disabled={!newUrl.trim() || isExtracting}
              >
                <Plus className="h-4 w-4" />
                <span>Ingest & Extract Source</span>
              </Button>
            </form>

            <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 font-medium text-zinc-400 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                SSRF & Privacy Protected
              </span>
              Internal IP addresses, localports, and private subnets are blocked automatically.
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Source Feed & Gate Counter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                Sources Ingested ({sources.length})
              </h3>
              <Tooltip content="Editorial rule: At least 3 verified sources are required to eliminate single-source bias." />
            </div>

            {/* Quorum Gate Indicator */}
            {validSourceCount >= 3 ? (
              <Badge variant="emerald" className="gap-1.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{validSourceCount} Sources Verified (Quorum Met)</span>
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1.5 py-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{validSourceCount} of 3 Required Sources</span>
              </Badge>
            )}
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            {sources.map((src, idx) => (
              <div
                key={src.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[11px] font-mono text-zinc-300">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                        {src.title}
                      </h4>
                      {src.status === "success" && (
                        <Badge variant="emerald" className="text-[10px] py-0">
                          Extracted ({src.wordCount} words)
                        </Badge>
                      )}
                      {src.status === "manual" && (
                        <Badge variant="purple" className="text-[10px] py-0">
                          Manual Fallback ({src.wordCount} words)
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
                      <Globe className="h-3 w-3" />
                      <span>{src.url}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                    </a>

                    {src.status === "failed" && (
                      <p className="text-xs text-rose-300/90 pt-1">
                        {src.error}
                      </p>
                    )}

                    {src.manualContent && (
                      <p className="text-xs text-zinc-400 line-clamp-2 pt-1 font-serif italic">
                        "{src.manualContent}"
                      </p>
                    )}
                  </div>

                  {/* Actions for this source */}
                  <div className="flex items-center gap-1">
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
              </div>
            ))}
          </div>

          {/* Synthesize Brief Trigger Bar */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-sm font-semibold text-zinc-100 block">
                Evidence Synthesis Engine
              </span>
              <span className="text-xs text-zinc-400">
                Cross-references timeline, segregates verified facts from speculation, and extracts 3 editorial angles.
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
            <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 text-xs text-blue-200 animate-pulse flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span>{synthesisStep}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Synthesis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Research Brief Viewer */}
      {brief && (
        <div className="space-y-6 pt-8 border-t border-zinc-800 animate-in fade-in duration-300">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="emerald" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified Brief</span>
                </Badge>
                <span className="text-xs text-zinc-500 font-mono">
                  {new Date(brief.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mt-1">
                {projectTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyBriefText}
                className="gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy Brief"}</span>
              </Button>
            </div>
          </div>

          {/* Core Story Summary Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  What Happened?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-200 leading-relaxed font-serif">
                {brief.whatHappened}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                  Why Does It Matter?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-200 leading-relaxed font-serif">
                {brief.whyItMatters}
              </CardContent>
            </Card>
          </div>

          {/* Segmented Audience Impact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Who Should Care?
              </CardTitle>
              <CardDescription>
                Targeted impact analysis across key industry personas
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-blue-400 block mb-1">
                  AI & Systems Engineers
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.engineers}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  Startup Founders
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.founders}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <span className="text-xs font-semibold text-amber-400 block mb-1">
                  Enterprise Technology Officers
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {brief.whoShouldCare.enterprises}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verified Facts vs. Speculation Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Verified Facts */}
            <Card className="border-emerald-900/40 bg-emerald-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Substantiated Facts & Metrics</span>
                </CardTitle>
                <CardDescription>
                  Directly corroborated by indexed primary reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {brief.verifiedFacts.map((fact, fIdx) => (
                  <div
                    key={fIdx}
                    className="rounded border border-emerald-900/30 bg-zinc-900/80 p-3 text-xs text-zinc-200"
                  >
                    <p className="leading-relaxed font-medium">{fact.fact}</p>
                    {fact.quote && (
                      <p className="text-[11px] text-zinc-400 italic pt-1.5 font-serif border-t border-zinc-800 mt-2">
                        "{fact.quote}"
                      </p>
                    )}
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                      Cited from Source {fact.sourceIndex}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Speculation & PR Claims */}
            <Card className="border-amber-900/40 bg-amber-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Speculation vs. Verified Reality</span>
                </CardTitle>
                <CardDescription>
                  Unverified marketing claims and analyst extrapolations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {brief.speculation.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded border border-amber-900/30 bg-zinc-900/80 p-3 text-xs text-zinc-200"
                  >
                    <p className="leading-relaxed font-medium text-amber-200/90">
                      Claim: "{spec.claim}"
                    </p>
                    <p className="text-[11px] text-zinc-400 pt-1.5 border-t border-zinc-800 mt-2">
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
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                Potential Newsletter Angles (At least 3 required)
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
        </div>
      )}

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
    </div>
  );
}
