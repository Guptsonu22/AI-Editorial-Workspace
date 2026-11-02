import { NextRequest, NextResponse } from "next/server";
import { AnalyzeWritingSchema } from "@/lib/ai/schemas";
import { calculateReadability } from "@/lib/analysis/readability";
import { analyzeProseHeuristics } from "@/lib/analysis/heuristics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AnalyzeWritingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { content, title } = parsed.data;

    // 1. Calculate Readability Mathematics
    const metrics = calculateReadability(content);

    // 2. Run Linguistic Heuristics (Hemingway Checks)
    const suggestions = analyzeProseHeuristics(content);

    // Augment metrics with exact detected issue counts
    metrics.passiveVoiceCount = suggestions.filter(
      (s) => s.type === "passive_voice"
    ).length;
    metrics.jargonCount = suggestions.filter(
      (s) => s.type === "jargon"
    ).length;
    metrics.fillerCount = suggestions.filter(
      (s) => s.type === "filler_phrase"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        suggestions,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Writing analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze prose",
      },
      { status: 500 }
    );
  }
}
