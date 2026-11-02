import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllDrafts, saveDraft } from "@/lib/db/storage";
import { WritingDraft } from "@/types/editorial";
import { calculateReadability } from "@/lib/analysis/readability";
import { analyzeProseHeuristics } from "@/lib/analysis/heuristics";

export const dynamic = "force-dynamic";

const SaveDraftSchema = z.object({
  id: z.string().optional(),
  articleId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  originalContent: z.string().optional(),
  status: z.enum(["draft", "analyzed", "finalized"]).default("draft"),
});

export async function GET() {
  try {
    const drafts = await getAllDrafts();
    return NextResponse.json({ success: true, data: drafts });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve drafts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = SaveDraftSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { id, articleId, title, content, originalContent, status } = parsed.data;

    const metrics = calculateReadability(content);
    const suggestions = analyzeProseHeuristics(content);

    metrics.passiveVoiceCount = suggestions.filter((s) => s.type === "passive_voice").length;
    metrics.jargonCount = suggestions.filter((s) => s.type === "jargon").length;
    metrics.fillerCount = suggestions.filter((s) => s.type === "filler_phrase").length;

    const draftId = id || `draft-${Date.now()}`;
    const draft: WritingDraft = {
      id: draftId,
      articleId,
      title,
      content,
      originalContent: originalContent || content,
      metrics,
      suggestions,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveDraft(draft);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}
