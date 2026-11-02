import { NextRequest, NextResponse } from "next/server";
import { getProjectById, deleteProject } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Research project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await deleteProject(params.id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Project not found or could not be deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
