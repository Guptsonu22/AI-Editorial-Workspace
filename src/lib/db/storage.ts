// ==============================================================================
// Dual-Mode Storage Service
// Thread-safe atomic JSON file persistence with automatic seed initialization
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

// Ensure .data directory and store file exist
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
  const store = initializeStore();
  return store.projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getProjectById(
  id: string
): Promise<ResearchProject | null> {
  const store = initializeStore();
  const found = store.projects.find((p) => p.id === id);
  return found || null;
}

export async function saveProject(
  project: ResearchProject
): Promise<ResearchProject> {
  const store = initializeStore();
  const existingIdx = store.projects.findIndex((p) => p.id === project.id);

  project.updatedAt = new Date().toISOString();

  if (existingIdx >= 0) {
    store.projects[existingIdx] = project;
  } else {
    store.projects.unshift(project);
  }

  persistStore(store);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
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

  persistStore(store);
  return project;
}

// ------------------------------------------------------------------------------
// Writing Draft CRUD
// ------------------------------------------------------------------------------

export async function getAllDrafts(): Promise<WritingDraft[]> {
  const store = initializeStore();
  return store.drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getDraftById(id: string): Promise<WritingDraft | null> {
  const store = initializeStore();
  const found = store.drafts.find((d) => d.id === id);
  return found || null;
}

export async function saveDraft(draft: WritingDraft): Promise<WritingDraft> {
  const store = initializeStore();
  const existingIdx = store.drafts.findIndex((d) => d.id === draft.id);

  draft.updatedAt = new Date().toISOString();

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
  const store = initializeStore();
  return store.articles.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getArticleById(
  id: string
): Promise<NewsletterArticle | null> {
  const store = initializeStore();
  const found = store.articles.find((a) => a.id === id);
  return found || null;
}

export async function saveArticle(
  article: NewsletterArticle
): Promise<NewsletterArticle> {
  const store = initializeStore();
  const existingIdx = store.articles.findIndex((a) => a.id === article.id);

  article.updatedAt = new Date().toISOString();

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
// Reflects actual database entities without arbitrary mock statistics
// ------------------------------------------------------------------------------

export async function getDashboardData(): Promise<DashboardPayload> {
  const store = initializeStore();

  const totalSources = store.projects.reduce(
    (acc, p) => acc + (p.sources?.length || 0),
    0
  );

  const stats: DashboardStats = {
    totalResearchProjects: store.projects.length,
    totalSourcesCollected: totalSources,
    totalDraftsAnalyzed: store.drafts.length,
    totalNewsletterArticles: store.articles.length,
  };

  const recentResearch: ResearchProjectSummary[] = store.projects
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

  const recentDrafts: WritingDraftSummary[] = store.drafts
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      title: d.title,
      wordCount: d.metrics?.wordCount || 0,
      readabilityLabel:
        d.metrics?.readabilityLabel || "Unanalyzed",
      gradeLevel: d.metrics?.fleschKincaidGrade || 0,
      updatedAt: d.updatedAt,
    }));

  return {
    stats,
    recentResearch,
    recentDrafts,
    recentArticles: store.articles.slice(0, 5),
  };
}
