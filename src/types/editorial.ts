// ==============================================================================
// Domain Types: AI Editorial Workspace
// ==============================================================================

export type ExtractionStatus = "pending" | "success" | "failed" | "manual";

export interface SourceInput {
  url: string;
  title?: string;
  manualContent?: string;
}

export interface SourceRecord {
  id: string;
  projectId: string;
  url: string;
  title: string;
  author?: string;
  publishedAt?: string;
  rawContent?: string;
  cleanedContent: string;
  wordCount: number;
  extractionStatus: ExtractionStatus;
  extractionError?: string;
  createdAt: string;
}

export interface KeyDevelopment {
  event: string;
  sourceIndex: number;
  sourceTitle?: string;
  timestamp?: string;
  isSupported?: boolean;
}

export interface VerifiedFact {
  fact: string;
  sourceIndex: number;
  sourceTitle?: string;
  quote?: string;
  evidenceSnippet?: string;
  isSupported?: boolean;
  unsupportedReason?: string;
}

export interface SpeculationItem {
  claim: string;
  sourceIndex: number;
  sourceTitle?: string;
  editorialNote: string;
  isSupported?: boolean;
}

export interface EditorialAngle {
  id: string;
  title: string;
  premise: string;
  targetAudience: "Engineers & Builders" | "Founders & Executives" | "Tech Policy & Investors" | "General Audience";
}

export interface CitationLink {
  sourceIndex: number;
  sourceId: string;
  title: string;
  url: string;
}

export interface ResearchBrief {
  id: string;
  projectId: string;
  whatHappened: string;
  whyItMatters: string;
  whoShouldCare: {
    engineers: string;
    founders: string;
    enterprises: string;
  };
  keyDevelopments: KeyDevelopment[];
  verifiedFacts: VerifiedFact[];
  speculation: SpeculationItem[];
  builderOpportunities: string[];
  editorialAngles: EditorialAngle[];
  citations: CitationLink[];
  insufficientEvidenceNotes?: string;
  createdAt: string;
}

export type ProjectStatus = "collecting" | "analyzing" | "completed" | "archived";

export interface ResearchProject {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  sources: SourceRecord[];
  brief?: ResearchBrief;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  sourceCount: number;
  hasBrief: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Writing Assistant Types
// ------------------------------------------------------------------------------

export type SuggestionType =
  | "long_sentence"
  | "difficult_sentence"
  | "passive_voice"
  | "jargon"
  | "filler_phrase"
  | "repetition"
  | "complexity";

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export interface WritingSuggestion {
  id: string;
  draftId?: string;
  type: SuggestionType;
  originalText: string;
  suggestedText: string;
  explanation: string;
  whyItMatters: string;
  startIndex: number;
  endIndex: number;
  status: SuggestionStatus;
  createdAt: string;
}

export interface EditorialMetrics {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readabilityLabel: string;
  hardSentenceCount: number;
  veryHardSentenceCount: number;
  passiveVoiceCount: number;
  jargonCount: number;
  fillerCount: number;
  complexityCount?: number;
  repetitionCount?: number;
}

export type DraftStatus = "draft" | "analyzed" | "finalized";

export interface WritingDraft {
  id: string;
  articleId?: string;
  title: string;
  content: string;
  originalContent: string;
  metrics: EditorialMetrics;
  suggestions: WritingSuggestion[];
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WritingDraftSummary {
  id: string;
  title: string;
  wordCount: number;
  readabilityLabel: string;
  gradeLevel: number;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Newsletter Studio Types
// ------------------------------------------------------------------------------

export type NewsletterStatus = "draft" | "in_review" | "ready" | "published";

export interface NewsletterArticle {
  id: string;
  projectId: string;
  projectTitle: string;
  angleId?: string;
  angleTitle?: string;
  headline: string;
  originalHeadline?: string;
  content: string;
  originalContent?: string;
  wordCount: number;
  targetWordCount: number;
  status: NewsletterStatus;
  sourceLinks: Array<{
    title: string;
    url: string;
    sourceIndex: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Dashboard & System Types
// ------------------------------------------------------------------------------

export interface DashboardStats {
  totalResearchProjects: number;
  totalSourcesCollected: number;
  totalDraftsAnalyzed: number;
  totalNewsletterArticles: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  recentResearch: ResearchProjectSummary[];
  recentDrafts: WritingDraftSummary[];
  recentArticles: NewsletterArticle[];
}

export interface UserSettings {
  aiProvider: "anthropic" | "openai" | "heuristic";
  hasAnthropicKey: boolean;
  hasOpenAiKey: boolean;
  targetPublication: string;
  defaultTargetWordCount: number;
}
