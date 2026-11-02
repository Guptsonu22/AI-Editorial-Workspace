import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllArticles, saveArticle } from "@/lib/db/storage";
import { NewsletterArticle } from "@/types/editorial";
import { countWords } from "@/lib/extraction/extractor";

export const dynamic = "force-dynamic";

const SaveArticleSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  angleId: z.string().optional(),
  angleTitle: z.string().optional(),
  headline: z.string().min(5),
  content: z.string().min(20),
  targetWordCount: z.number().int().default(400),
  status: z.enum(["draft", "in_review", "ready", "published"]).default("ready"),
  sourceLinks: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        sourceIndex: z.number(),
      })
    )
    .default([]),
});

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = SaveArticleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const article: NewsletterArticle = {
      id: data.id || `art-${Date.now()}`,
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      angleId: data.angleId,
      angleTitle: data.angleTitle,
      headline: data.headline,
      content: data.content,
      wordCount: countWords(data.content),
      targetWordCount: data.targetWordCount,
      status: data.status,
      sourceLinks: data.sourceLinks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveArticle(article);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save article" },
      { status: 500 }
    );
  }
}
