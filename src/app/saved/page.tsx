"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark,
  Search,
  Trash2,
  Send,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ResearchProject, ResearchBrief } from "@/types/editorial";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function SavedResearchPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<ResearchBrief | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = () => {
    fetch("/api/research")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProjects(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this research project?")) return;

    try {
      const res = await fetch(`/api/research/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleOpenBriefModal = (project: ResearchProject) => {
    if (project.brief) {
      setSelectedBrief(project.brief);
      setSelectedProjectTitle(project.title);
      setModalOpen(true);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Saved Research Library
            </h2>
            <Badge variant="secondary" className="text-[10px] py-0.5">
              {projects.length} Saved
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Historical research briefs, verified fact sheets, and extracted source registries.
          </p>
        </div>

        <Link href="/research">
          <Button variant="accent" size="sm" className="gap-2 shadow-sm text-xs h-8">
            <span>+ New Research Brief</span>
          </Button>
        </Link>
      </div>

      {projects.length === 0 && !isLoading ? (
        /* Empty State */
        <EmptyState
          icon={Bookmark}
          title="No Saved Research Yet"
          description="Synthesized research briefs, verified citations, and story angles will be archived here for ongoing reference and newsletter drafting."
          actionLabel="Create First Research Brief"
          actionHref="/research"
          badge="Library Empty"
          tip="All research briefs persist across sessions and can be reopened in Newsletter Studio at any time."
        />
      ) : (
        <>
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research topics, models, or citations..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Project Cards Feed */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((proj) => (
              <Card
                key={proj.id}
                className="flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {proj.brief ? (
                          <Badge variant="emerald" className="text-[10px] py-0 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Brief Ready</span>
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] py-0">
                            Collecting
                          </Badge>
                        )}
                        <span className="text-xs text-zinc-500">
                          {formatTimeAgo(proj.updatedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold text-zinc-100 line-clamp-2">
                        {proj.title}
                      </CardTitle>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleDelete(proj.id, e)}
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-rose-400" />
                    </Button>
                  </div>

                  {proj.description && (
                    <CardDescription className="line-clamp-2 text-xs pt-1">
                      {proj.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Ingested Source Badges */}
                  <div className="rounded-xl bg-zinc-950/60 border border-zinc-850 p-3 text-xs text-zinc-400">
                    <span className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      {proj.sources?.length || 0} Ingested Sources:
                    </span>
                    <ul className="space-y-1">
                      {proj.sources?.slice(0, 3).map((s) => (
                        <li key={s.id} className="truncate text-[11px] text-zinc-400">
                          • {s.title}
                        </li>
                      ))}
                      {(proj.sources?.length || 0) > 3 && (
                        <li className="text-[10px] text-zinc-400 italic">
                          +{(proj.sources?.length || 0) - 3} more sources
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {proj.brief && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs gap-1.5"
                        onClick={() => handleOpenBriefModal(proj)}
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-400" />
                        <span>View Brief</span>
                      </Button>
                    )}

                    <Link href={`/studio?projectId=${proj.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5">
                        <Send className="h-3 w-3" />
                        <span>Open in Studio</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && searchQuery && (
            <div className="text-center py-16 text-zinc-500 text-sm">
              No research projects match "{searchQuery}".
            </div>
          )}
        </>
      )}

      {/* Brief Preview Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <Badge variant="emerald" className="w-fit text-[10px] mb-2">
            Verified Research Brief
          </Badge>
          <DialogTitle className="text-lg font-bold text-zinc-100">
            {selectedProjectTitle}
          </DialogTitle>
          <DialogDescription>
            Multi-source synthesized editorial breakdown
          </DialogDescription>
        </DialogHeader>

        {selectedBrief && (
          <div className="space-y-4 py-2 text-xs text-zinc-200">
            <div>
              <h4 className="font-semibold text-blue-400 mb-1 uppercase tracking-wider text-[11px]">
                What Happened?
              </h4>
              <p className="leading-relaxed font-serif text-zinc-300">
                {selectedBrief.whatHappened}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-purple-400 mb-1 uppercase tracking-wider text-[11px]">
                Why Does It Matter?
              </h4>
              <p className="leading-relaxed font-serif text-zinc-300">
                {selectedBrief.whyItMatters}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-emerald-400 mb-1 uppercase tracking-wider text-[11px]">
                Verified Facts
              </h4>
              <ul className="space-y-1 text-zinc-300">
                {selectedBrief.verifiedFacts.map((f, i) => (
                  <li key={i}>• {f.fact}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-400 mb-1 uppercase tracking-wider text-[11px]">
                Available Editorial Angles ({selectedBrief.editorialAngles.length})
              </h4>
              <div className="space-y-1.5">
                {selectedBrief.editorialAngles.map((a) => (
                  <div key={a.id} className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800">
                    <span className="font-semibold text-zinc-200">{a.title}</span>
                    <p className="text-[11px] text-zinc-400">{a.premise}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </motion.div>
  );
}
