import { NextRequest, NextResponse } from "next/server";
import { CreateProjectSchema } from "@/lib/ai/schemas";
import { extractArticleContent } from "@/lib/extraction/extractor";
import { aiEngine } from "@/lib/ai/client";
import {
  getAllProjects,
  saveProject,
  attachBriefToProject,
} from "@/lib/db/storage";
import { ResearchProject, SourceRecord } from "@/types/editorial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { title, description, sources: sourceInputs } = parsed.data;

    // Strict validation: Require at least 3 sources
    if (sourceInputs.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Editorial Policy: A minimum of three (3) distinct sources are required before generating an evidence-backed Research Brief.",
        },
        { status: 400 }
      );
    }

    const projectId = `proj-${Date.now()}`;

    // Extract each source
    const extractedSources: SourceRecord[] = [];
    for (const input of sourceInputs) {
      const ext = await extractArticleContent(
        input.url,
        input.manualContent,
        input.title
      );

      extractedSources.push({
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        projectId,
        url: ext.url,
        title: ext.title || input.url,
        author: ext.author,
        publishedAt: ext.publishedAt,
        cleanedContent: ext.cleanedContent || input.manualContent || "",
        wordCount: ext.wordCount,
        extractionStatus: ext.status,
        extractionError: ext.error,
        createdAt: new Date().toISOString(),
      });
    }

    const newProject: ResearchProject = {
      id: projectId,
      title,
      description,
      status: "analyzing",
      sources: extractedSources,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save project initial state
    await saveProject(newProject);

    // Synthesize the structured Research Brief
    const brief = await aiEngine.generateResearchBrief(title, extractedSources);

    // Save brief and transition status to 'completed'
    const updated = await attachBriefToProject(projectId, brief);

    return NextResponse.json({
      success: true,
      data: {
        project: updated || newProject,
        brief,
      },
    });
  } catch (err: any) {
    console.error("Research brief synthesis error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err.message || "Failed to generate research brief from sources",
      },
      { status: 500 }
    );
  }
}
