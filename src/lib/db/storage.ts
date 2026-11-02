// ==============================================================================
// Dual-Mode Storage Service
// Thread-safe atomic JSON file persistence with automatic Supabase / PostgreSQL cloud adapter
// ==============================================================================

import fs from "fs";
import path from "path";
import {
  ResearchProject,
  ResearchProjectSummary,
  ResearchBrief,
  NewsletterArticle,
  WritingDraft,
  WritingDraftSummary,
  DashboardPayload,
  DashboardStats,
} from "@/types/editorial";
import { SEED_PROJECTS, SEED_ARTICLES, SEED_DRAFTS } from "./seed-data";

interface DatabaseSchema {
  projects: ResearchProject[];
  articles: NewsletterArticle[];
  drafts: WritingDraft[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "editorial-store.json");

// ------------------------------------------------------------------------------
// 1. Supabase Cloud Adapter (Production / Serverless Persistence)
// ------------------------------------------------------------------------------
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return !!(url && key && url.startsWith("https://") && !url.includes("placeholder"));
}

async function supabaseRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// ------------------------------------------------------------------------------
// 2. Local File Database (Zero-Config Development Persistence)
// ------------------------------------------------------------------------------
function initializeStore(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_PATH)) {
      const initialData: DatabaseSchema = {
        projects: SEED_PROJECTS,
        articles: SEED_ARTICLES,
        drafts: SEED_DRAFTS,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }

    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    return parsed;
  } catch (err) {
    console.warn("Storage read error, falling back to in-memory seeds:", err);
    return {
      projects: SEED_PROJECTS,
      articles: SEED_ARTICLES,
      drafts: SEED_DRAFTS,
      lastUpdated: new Date().toISOString(),
    };
  }
}

function persistStore(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Critical error persisting editorial store:", err);
  }
}

// ------------------------------------------------------------------------------
// Research Project CRUD
// ------------------------------------------------------------------------------

export async function getAllProjects(): Promise<ResearchProject[]> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest("editorial_projects?select=*&order=updated_at.desc");
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        sources: r.sources,
        brief: r.brief,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local file store:", err);
    }
  }

  const store = initializeStore();
  return store.projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getProjectById(id: string): Promise<ResearchProject | null> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest(`editorial_projects?id=eq.${id}&select=*`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          sources: r.sources,
          brief: r.brief,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase query failed, falling back to local file store:", err);
    }
  }

  const store = initializeStore();
  const found = store.projects.find((p) => p.id === id);
  return found || null;
}

export async function saveProject(project: ResearchProject): Promise<ResearchProject> {
  project.updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      await supabaseRequest("editorial_projects", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          sources: project.sources,
          brief: project.brief,
          created_at: project.createdAt,
          updated_at: project.updatedAt,
        }),
      });
      return project;
    } catch (err) {
      console.warn("Supabase save failed, persisting to local store:", err);
    }
  }

  const store = initializeStore();
  const existingIdx = store.projects.findIndex((p) => p.id === project.id);
  if (existingIdx >= 0) {
    store.projects[existingIdx] = project;
  } else {
    store.projects.unshift(project);
  }
  persistStore(store);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabaseRequest(`editorial_projects?id=eq.${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("Supabase delete failed, falling back to local file store:", err);
    }
  }

  const store = initializeStore();
  const initialLen = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length !== initialLen) {
    persistStore(store);
    return true;
  }
  return false;
}

export async function attachBriefToProject(
  projectId: string,
  brief: ResearchBrief
): Promise<ResearchProject | null> {
  const store = initializeStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return null;

  project.brief = brief;
  project.status = "completed";
  project.updatedAt = new Date().toISOString();

  await saveProject(project);
  return project;
}

// ------------------------------------------------------------------------------
// Writing Draft CRUD
// ------------------------------------------------------------------------------

export async function getAllDrafts(): Promise<WritingDraft[]> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest("editorial_drafts?select=*&order=updated_at.desc");
      return rows.map((r: any) => ({
        id: r.id,
        articleId: r.article_id,
        title: r.title,
        content: r.content,
        originalContent: r.original_content,
        metrics: r.metrics,
        suggestions: r.suggestions,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.warn("Supabase fetch drafts failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  return store.drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getDraftById(id: string): Promise<WritingDraft | null> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest(`editorial_drafts?id=eq.${id}&select=*`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          articleId: r.article_id,
          title: r.title,
          content: r.content,
          originalContent: r.original_content,
          metrics: r.metrics,
          suggestions: r.suggestions,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getDraftById failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  const found = store.drafts.find((d) => d.id === id);
  return found || null;
}

export async function saveDraft(draft: WritingDraft): Promise<WritingDraft> {
  draft.updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      await supabaseRequest("editorial_drafts", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: draft.id,
          article_id: draft.articleId,
          title: draft.title,
          content: draft.content,
          original_content: draft.originalContent,
          metrics: draft.metrics,
          suggestions: draft.suggestions,
          status: draft.status,
          created_at: draft.createdAt,
          updated_at: draft.updatedAt,
        }),
      });
      return draft;
    } catch (err) {
      console.warn("Supabase saveDraft failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  const existingIdx = store.drafts.findIndex((d) => d.id === draft.id);
  if (existingIdx >= 0) {
    store.drafts[existingIdx] = draft;
  } else {
    store.drafts.unshift(draft);
  }
  persistStore(store);
  return draft;
}

// ------------------------------------------------------------------------------
// Newsletter Article CRUD
// ------------------------------------------------------------------------------

export async function getAllArticles(): Promise<NewsletterArticle[]> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest("editorial_articles?select=*&order=updated_at.desc");
      return rows.map((r: any) => ({
        id: r.id,
        projectId: r.project_id,
        projectTitle: r.project_title,
        angleId: r.angle_id,
        angleTitle: r.angle_title,
        headline: r.headline,
        originalHeadline: r.original_headline,
        content: r.content,
        originalContent: r.original_content,
        wordCount: r.word_count,
        targetWordCount: r.target_word_count,
        status: r.status,
        sourceLinks: r.source_links,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.warn("Supabase getAllArticles failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  return store.articles.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getArticleById(id: string): Promise<NewsletterArticle | null> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRequest(`editorial_articles?id=eq.${id}&select=*`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          projectId: r.project_id,
          projectTitle: r.project_title,
          angleId: r.angle_id,
          angleTitle: r.angle_title,
          headline: r.headline,
          originalHeadline: r.original_headline,
          content: r.content,
          originalContent: r.original_content,
          wordCount: r.word_count,
          targetWordCount: r.target_word_count,
          status: r.status,
          sourceLinks: r.source_links,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getArticleById failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  const found = store.articles.find((a) => a.id === id);
  return found || null;
}

export async function saveArticle(article: NewsletterArticle): Promise<NewsletterArticle> {
  article.updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      await supabaseRequest("editorial_articles", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: article.id,
          project_id: article.projectId,
          project_title: article.projectTitle,
          angle_id: article.angleId,
          angle_title: article.angleTitle,
          headline: article.headline,
          original_headline: article.originalHeadline,
          content: article.content,
          original_content: article.originalContent,
          word_count: article.wordCount,
          target_word_count: article.targetWordCount,
          status: article.status,
          source_links: article.sourceLinks,
          created_at: article.createdAt,
          updated_at: article.updatedAt,
        }),
      });
      return article;
    } catch (err) {
      console.warn("Supabase saveArticle failed, falling back to local store:", err);
    }
  }

  const store = initializeStore();
  const existingIdx = store.articles.findIndex((a) => a.id === article.id);
  if (existingIdx >= 0) {
    store.articles[existingIdx] = article;
  } else {
    store.articles.unshift(article);
  }
  persistStore(store);
  return article;
}

// ------------------------------------------------------------------------------
// Unified Dashboard Aggregates
// ------------------------------------------------------------------------------

export async function getDashboardData(): Promise<DashboardPayload> {
  const projects = await getAllProjects();
  const drafts = await getAllDrafts();
  const articles = await getAllArticles();

  const totalSources = projects.reduce(
    (acc, p) => acc + (p.sources?.length || 0),
    0
  );

  const stats: DashboardStats = {
    totalResearchProjects: projects.length,
    totalSourcesCollected: totalSources,
    totalDraftsAnalyzed: drafts.length,
    totalNewsletterArticles: articles.length,
  };

  const recentResearch: ResearchProjectSummary[] = projects
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      sourceCount: p.sources?.length || 0,
      hasBrief: !!p.brief,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

  const recentDrafts: WritingDraftSummary[] = drafts
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      title: d.title,
      wordCount: d.metrics?.wordCount || 0,
      readabilityLabel: d.metrics?.readabilityLabel || "Unanalyzed",
      gradeLevel: d.metrics?.fleschKincaidGrade || 0,
      updatedAt: d.updatedAt,
    }));

  return {
    stats,
    recentResearch,
    recentDrafts,
    recentArticles: articles.slice(0, 5),
  };
}
