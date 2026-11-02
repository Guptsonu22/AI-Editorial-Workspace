"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Link2,
  FileCheck2,
  Send,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/tooltip";
import { DashboardPayload } from "@/types/editorial";
import { formatTimeAgo } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load dashboard metrics");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Top Banner / Welcome */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Editorial Command Center
            </h2>
            <Badge variant="emerald" className="text-[10px] py-0.5">
              Live Workspace
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Synthesize multi-source raw research into evidence-backed newsletter editions.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <Link href="/research">
            <Button variant="accent" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Start Research Brief</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Metric Cards Row */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-36" />
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:border-zinc-700/80 transition-all duration-150 hover:shadow-lg hover:shadow-blue-950/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Research Projects
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/40 border border-blue-800/40">
                  <FolderKanban className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {data?.stats.totalResearchProjects ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Active editorial inquiries
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-zinc-700/80 transition-all duration-150 hover:shadow-lg hover:shadow-emerald-950/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Sources Ingested
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                  <Link2 className="h-4 w-4 text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {data?.stats.totalSourcesCollected ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Verified external articles
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-zinc-700/80 transition-all duration-150 hover:shadow-lg hover:shadow-purple-950/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Drafts Analyzed
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950/40 border border-purple-800/40">
                  <FileCheck2 className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {data?.stats.totalDraftsAnalyzed ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Polished in Writing Assistant
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-zinc-700/80 transition-all duration-150 hover:shadow-lg hover:shadow-amber-950/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Newsletter Articles
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950/40 border border-amber-800/40">
                  <Send className="h-4 w-4 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {data?.stats.totalNewsletterArticles ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Publication-ready editions
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Quick Action Hub */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Editorial Workflow Pipeline
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/research"
            className="group block rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all duration-150 hover:border-blue-500/50 hover:bg-zinc-900/80"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-blue-300 transition-colors">
                1. Ingest & Verify Sources
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Input 3+ URLs to scrape articles, clean boilerplate, and synthesize an evidence brief with zero hallucinations.
            </p>
          </Link>

          <Link
            href="/studio"
            className="group block rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all duration-150 hover:border-amber-500/50 hover:bg-zinc-900/80"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                2. Generate Newsletter Draft
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select an angle from your brief to draft a tightly scoped 300–500 word publication piece with traceable source links.
            </p>
          </Link>

          <Link
            href="/writing"
            className="group block rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all duration-150 hover:border-purple-500/50 hover:bg-zinc-900/80"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors">
                3. Hemingway Prose Polish
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspect passive voice, jargon, and long sentences with atomic accept/reject suggestions and live readability metrics.
            </p>
          </Link>
        </div>
      </motion.div>

      {/* Two Column Activity Feed */}
      <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-2">
        {/* Recent Research Projects */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-850 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Research Projects
              </CardTitle>
              <CardDescription>
                Evidence briefs synthesized across primary sources
              </CardDescription>
            </div>
            <Link href="/saved">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-400">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 pt-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : data?.recentResearch && data.recentResearch.length > 0 ? (
              data.recentResearch.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100 line-clamp-1">
                        {proj.title}
                      </span>
                      {proj.hasBrief && (
                        <Badge variant="emerald" className="text-[10px] py-0">
                          Brief Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{proj.sourceCount} sources</span>
                      <span>•</span>
                      <span>{formatTimeAgo(proj.updatedAt)}</span>
                    </div>
                  </div>
                  <Link href={`/saved?project=${proj.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Open Brief
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No research projects yet. Click Start Research Brief above.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Drafts in Writing Assistant */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-850 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Writing Drafts
              </CardTitle>
              <CardDescription>
                Articles undergoing readability and stylistic refinement
              </CardDescription>
            </div>
            <Link href="/writing">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-400">
                Open Editor
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 pt-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : data?.recentDrafts && data.recentDrafts.length > 0 ? (
              data.recentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1 pr-3">
                    <span className="text-sm font-medium text-zinc-100 line-clamp-1">
                      {draft.title}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{draft.wordCount} words</span>
                      <span>•</span>
                      <span className="text-purple-400">
                        {draft.readabilityLabel}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(draft.updatedAt)}</span>
                    </div>
                  </div>
                  <Link href={`/writing?draftId=${draft.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Resume Polish
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No active drafts. Drafts created in Studio or Writing Assistant appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
