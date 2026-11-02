import { NextRequest, NextResponse } from "next/server";
import { GenerateNewsletterSchema } from "@/lib/ai/schemas";
import { getProjectById, saveArticle } from "@/lib/db/storage";
import { aiEngine } from "@/lib/ai/client";
import { NewsletterArticle } from "@/types/editorial";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = GenerateNewsletterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { projectId, angleId, targetWordCount, tone, customInstructions } =
      parsed.data;

    // Retrieve project and brief
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Research project not found" },
        { status: 404 }
      );
    }

    if (!project.brief) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Project does not have a generated brief. Please generate a brief in Research Assistant first.",
        },
        { status: 400 }
      );
    }

    const angle = project.brief.editorialAngles.find((a) => a.id === angleId);
    if (!angle) {
      return NextResponse.json(
        { success: false, error: "Selected angle ID not found in project brief" },
        { status: 400 }
      );
    }

    // Synthesize the 300–500 word newsletter article
    const generated = await aiEngine.generateNewsletterArticle(
      project.title,
      project.brief,
      angle,
      targetWordCount
    );

    const articleId = `art-${Date.now()}`;
    const article: NewsletterArticle = {
      id: articleId,
      projectId: project.id,
      projectTitle: project.title,
      angleId: angle.id,
      angleTitle: angle.title,
      headline: generated.headline,
      content: generated.content,
      wordCount: generated.wordCount,
      targetWordCount,
      status: "ready",
      sourceLinks: project.brief.citations.map((c) => ({
        title: c.title,
        url: c.url,
        sourceIndex: c.sourceIndex,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveArticle(article);

    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    console.error("Newsletter generation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate newsletter article",
      },
      { status: 500 }
    );
  }
}
