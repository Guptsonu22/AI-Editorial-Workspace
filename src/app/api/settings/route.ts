import { NextResponse } from "next/server";
import { aiEngine } from "@/lib/ai/client";
import { UserSettings } from "@/types/editorial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
    const activeProvider = aiEngine.getActiveProvider() as "anthropic" | "openai" | "heuristic";

    const quotaStatus = aiEngine.getQuotaStatus();

    const settings: UserSettings = {
      aiProvider: activeProvider,
      hasAnthropicKey,
      hasOpenAiKey,
      isOpenAiQuotaExhausted: quotaStatus.isOpenAiQuotaExhausted,
      lastQuotaError: quotaStatus.lastQuotaError,
      targetPublication: "This Week in AI",
      defaultTargetWordCount: 400,
    };

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}
