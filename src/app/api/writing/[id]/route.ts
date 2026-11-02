import { NextRequest, NextResponse } from "next/server";
import { getDraftById } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draft = await getDraftById(params.id);
    if (!draft) {
      return NextResponse.json(
        { success: false, error: "Writing draft not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: draft });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve draft" },
      { status: 500 }
    );
  }
}
