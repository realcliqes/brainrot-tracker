import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { secret, userId, playerData } = body;

    if (secret !== process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("brainrot-tracker");

    // Get old snapshot
    const oldPlayer = await db.collection("players").findOne({ odiumId: String(userId) });
    const oldAnimals = oldPlayer?.animals || [];
    const newAnimals = playerData.animals || [];

    // Build old counts
    const oldCounts = {};
    const oldMuts = {};
    const oldTraits = {};
    for (const a of oldAnimals) {
      if (!a.name) continue;
      oldCounts[a.name] = (oldCounts[a.name] || 0) + 1;
      if (!oldMuts[a.name]) oldMuts[a.name] = {};
      const m = a.mutation || "Default";
      oldMuts[a.name][m] = (oldMuts[a.name][m] || 0) + 1;
      if (!oldTraits[a.name]) oldTraits[a.name] = {};
      for (const t of a.traits || []) {
        oldTraits[a.name][t] = (oldTraits[a.name][t] || 0) + 1;
      }
    }

    // Build new counts
    const newCounts = {};
    const newMuts = {};
    const newTraits = {};
    const newBaseGens = {};
    const newTotalGens = {};
    for (const a of newAnimals) {
      if (!a.name) continue;
      newCounts[a.name] = (newCounts[a.name] || 0) + 1;
      if (!newMuts[a.name]) newMuts[a.name] = {};
      const m = a.mutation || "Default";
      newMuts[a.name][m] = (newMuts[a.name][m] || 0) + 1;
      if (!newTraits[a.name]) newTraits[a.name] = {};
      for (const t of a.traits || []) {
        newTraits[a.name][t] = (newTraits[a.name][t] || 0) + 1;
      }
      newBaseGens[a.name] = a.baseGen || 0;
      newTotalGens[a.name] = (newTotalGens[a.name] || 0) + (a.totalGen || 0);
    }

    // Compute deltas
    const allNames = new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)]);
    const incOps = {};
    const setOps = {};
    let hasDelta = false;

    for (const name of allNames) {
      const d = (newCounts[name] || 0) - (oldCounts[name] || 0);
      if (d !== 0) {
        incOps["counts." + name] = d;
        hasDelta = true;
      }

      // Mutation deltas
      const allMuts = new Set([
        ...Object.keys(oldMuts[name] || {}),
        ...Object.keys(newMuts[name] || {})
      ]);
      for (const m of allMuts) {
        const md = ((newMuts[name] || {})[m] || 0) - ((oldMuts[name] || {})[m] || 0);
        if (md !== 0) {
          incOps["mutations." + name + "." + m] = md;
          hasDelta = true;
        }
      }

      // Trait deltas
      const allTrs = new Set([
        ...Object.keys(oldTraits[name] || {}),
        ...Object.keys(newTraits[name] || {})
      ]);
      for (const t of allTrs) {
        const td = ((newTraits[name] || {})[t] || 0) - ((oldTraits[name] || {})[t] || 0);
        if (td !== 0) {
          incOps["traits." + name + "." + t] = td;
          hasDelta = true;
        }
      }

      // Set base/total gens
      if (newBaseGens[name] !== undefined) {
        setOps["baseGens." + name] = newBaseGens[name];
      }
      if (newTotalGens[name] !== undefined) {
        setOps["totalGens." + name] = newTotalGens[name];
      }
    }

    // Owner tracking
    const oldOwned = new Set(Object.keys(oldCounts));
    const newOwned = new Set(Object.keys(newCounts));
    for (const name of newOwned) {
      if (!oldOwned.has(name)) {
        incOps["owners." + name] = 1;
        hasDelta = true;
      }
    }
    for (const name of oldOwned) {
      if (!newOwned.has(name)) {
        incOps["owners." + name] = -1;
        hasDelta = true;
      }
    }

    // Apply deltas
    if (hasDelta || Object.keys(setOps).length > 0) {
      const updateDoc = { $set: { lastUpdated: new Date(), ...setOps } };
      if (Object.keys(incOps).length > 0) {
        updateDoc.$inc = incOps;
      }
      await db.collection("totals").updateOne(
        { _id: "global" },
        updateDoc,
        { upsert: true }
      );
    }

    // Save player snapshot
    const isNew = !oldPlayer;
    if (isNew) {
      await db.collection("totals").updateOne(
        { _id: "global" },
        { $inc: { totalPlayers: 1 } },
        { upsert: true }
      );
    }

    // Save rebirth/coins averages per animal
    const avgSetOps = {};
    for (const name of newOwned) {
      avgSetOps["avgRebirths." + name] = playerData.rebirth || 0;
      avgSetOps["avgCoins." + name] = playerData.coins || 0;
    }
    if (Object.keys(avgSetOps).length > 0) {
      await db.collection("totals").updateOne(
        { _id: "global" },
        { $set: avgSetOps },
        { upsert: true }
      );
    }

    await db.collection("players").updateOne(
      { odiumId: String(userId) },
      {
        $set: {
          odiumId: String(userId),
          animals: newAnimals,
          rebirth: playerData.rebirth || 0,
          coins: playerData.coins || 0,
          displayName: playerData.displayName || "",
          username: playerData.username || "",
          lastSeen: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}