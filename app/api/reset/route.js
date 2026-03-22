import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("brainrot-tracker");

    await db.collection("totals").deleteMany({});
    await db.collection("snapshots").deleteMany({});
    await db.collection("players").deleteMany({});

    return NextResponse.json({ ok: true, message: "All data cleared" });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}