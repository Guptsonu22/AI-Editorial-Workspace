import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
