import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
export async function POST(request) {
  try {
    const body = await request.json();
    const { secret, userId, brainrots } = body;
    if (secret !== process.env.API_SECRET)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const client = await clientPromise;
    const db = client.db("brainrot-tracker");
    const oldSnapshot = await db.collection("snapshots").findOne({ odiumId: String(userId) });
    const oldCounts = oldSnapshot?.brainrots || {};
    const newCounts = brainrots || {};
    const allKeys = new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)]);
    const incOps = {};
    let hasDelta = false;
    for (const key of allKeys) {
      const d = (newCounts[key] || 0) - (oldCounts[key] || 0);
      if (d !== 0) { incOps["counts." + key] = d; hasDelta = true; }
    }
    if (hasDelta) {
      await db.collection("totals").updateOne(
        { _id: "global" },
        { $inc: incOps, $set: { lastUpdated: new Date() } },
        { upsert: true }
      );
    }
    await db.collection("snapshots").updateOne(
      { odiumId: String(userId) },
      { $set: { brainrots: newCounts, lastSeen: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
