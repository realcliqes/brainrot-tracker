import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { secret, userId, animals } = body;

    if (secret !== process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("brainrot-tracker");

    // Save this player's full animal list
    await db.collection("players").updateOne(
      { odiumId: String(userId) },
      {
        $set: {
          animals: animals || [],
          lastSeen: new Date(),
        },
      },
      { upsert: true }
    );

    // Rebuild global totals from all players
    const allPlayers = await db.collection("players").find({}).toArray();

    const totals = {};
    const mutations = {};
    const traits = {};

    for (const player of allPlayers) {
      for (const animal of player.animals || []) {
        const name = animal.name;
        if (!name) continue;

        // Count totals
        totals[name] = (totals[name] || 0) + 1;

        // Count mutations per animal
        if (!mutations[name]) mutations[name] = {};
        const mut = animal.mutation || "Default";
        mutations[name][mut] = (mutations[name][mut] || 0) + 1;

        // Count traits per animal
        if (!traits[name]) traits[name] = {};
        for (const trait of animal.traits || []) {
          traits[name][trait] = (traits[name][trait] || 0) + 1;
        }
      }
    }

    await db.collection("totals").updateOne(
      { _id: "global" },
      {
        $set: {
          counts: totals,
          mutations: mutations,
          traits: traits,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}