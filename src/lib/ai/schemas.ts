// ==============================================================================
// Zod Validation Schemas for AI Responses and API Payloads
// ==============================================================================

import { z } from "zod";

// ------------------------------------------------------------------------------
// Research Ingestion & Brief Schemas
// ------------------------------------------------------------------------------

export const SourceInputSchema = z.object({
  url: z.string().url("Must be a valid URL with http:// or https://"),
  title: z.string().optional(),
  manualContent: z.string().optional(),
});

export const CreateProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().optional(),
  sources: z
    .array(SourceInputSchema)
    .min(3, "At least three (3) sources are required before synthesizing a brief"),
});

export const KeyDevelopmentSchema = z.object({
  event: z.string().min(5),
  sourceIndex: z.number().int().positive(),
  timestamp: z.string().optional(),
});

export const VerifiedFactSchema = z.object({
  fact: z.string().min(5),
  sourceIndex: z.number().int().positive(),
  quote: z.string().optional(),
});

export const SpeculationItemSchema = z.object({
  claim: z.string().min(5),
  sourceIndex: z.number().int().positive(),
  editorialNote: z.string().min(5),
});

export const EditorialAngleSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  premise: z.string().min(10),
  targetAudience: z.enum([
    "Engineers & Builders",
    "Founders & Executives",
    "Tech Policy & Investors",
    "General Audience",
  ]),
});

export const CitationLinkSchema = z.object({
  sourceIndex: z.number().int().positive(),
  sourceId: z.string(),
  title: z.string(),
  url: z.string().url(),
});

export const ResearchBriefOutputSchema = z.object({
  whatHappened: z.string().min(20),
  whyItMatters: z.string().min(20),
  whoShouldCare: z.object({
    engineers: z.string().min(10),
    founders: z.string().min(10),
    enterprises: z.string().min(10),
  }),
  keyDevelopments: z.array(KeyDevelopmentSchema).min(2),
  verifiedFacts: z.array(VerifiedFactSchema).min(2),
  speculation: z.array(SpeculationItemSchema),
  builderOpportunities: z.array(z.string()).min(2),
  editorialAngles: z.array(EditorialAngleSchema).min(3),
  insufficientEvidenceNotes: z.string().optional(),
});

// ------------------------------------------------------------------------------
// Newsletter Studio Schemas
// ------------------------------------------------------------------------------

export const GenerateNewsletterSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  angleId: z.string().min(1, "Angle ID is required"),
  targetWordCount: z.number().int().min(250).max(650).default(400),
  tone: z
    .enum(["analytical", "technical", "executive"])
    .default("analytical"),
  customInstructions: z.string().optional(),
});

export const NewsletterOutputSchema = z.object({
  headline: z.string().min(10).max(180),
  content: z.string().min(150),
  wordCount: z.number().int().positive(),
  sourceLinks: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      sourceIndex: z.number().int().positive(),
    })
  ),
});

// ------------------------------------------------------------------------------
// Writing Assistant Schemas
// ------------------------------------------------------------------------------

export const AnalyzeWritingSchema = z.object({
  content: z.string().min(10, "Content must have at least 10 characters to analyze"),
  title: z.string().optional(),
  draftId: z.string().optional(),
});
