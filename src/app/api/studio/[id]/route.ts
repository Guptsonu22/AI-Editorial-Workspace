import { NextRequest, NextResponse } from "next/server";
import { getArticleById } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await getArticleById(params.id);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Newsletter article not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: article });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve article" },
      { status: 500 }
    );
  }
}
