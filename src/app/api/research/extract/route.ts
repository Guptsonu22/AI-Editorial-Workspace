import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractArticleContent } from "@/lib/extraction/extractor";

export const dynamic = "force-dynamic";

const ExtractPayloadSchema = z.object({
  url: z.string().min(1, "URL is required"),
  manualContent: z.string().optional(),
  titleOverride: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ExtractPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { url, manualContent, titleOverride } = parsed.data;
    const result = await extractArticleContent(url, manualContent, titleOverride);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Extraction route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred during extraction",
      },
      { status: 500 }
    );
  }
}
