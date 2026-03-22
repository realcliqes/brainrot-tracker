import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("brainrot-tracker");
    const totals = await db.collection("totals").findOne({ _id: "global" });
    const counts = totals?.counts || {};
    const brainrots = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const totalBrainrots = brainrots.reduce((sum, b) => sum + b.count, 0);
    return NextResponse.json({ brainrots, totalBrainrots, lastUpdated: totals?.lastUpdated || null });
  } catch (error) {
    console.error("Counts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
