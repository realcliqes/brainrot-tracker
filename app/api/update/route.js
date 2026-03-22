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

    await db.collection("players").updateOne(
      { odiumId: String(userId) },
      {
        $set: {
          odiumId: String(userId),
          animals: playerData.animals || [],
          rebirth: playerData.rebirth || 0,
          coins: playerData.coins || 0,
          displayName: playerData.displayName || "",
          username: playerData.username || "",
          lastSeen: new Date(),
        },
      },
      { upsert: true }
    );

    // Rebuild totals
    const allPlayers = await db.collection("players").find({}).toArray();

    const totals = {};
    const mutations = {};
    const traits = {};
    const baseGens = {};
    const totalGens = {};
    const owners = {};
    const ownerRebirths = {};
    const ownerCoins = {};

    const totalPlayerCount = allPlayers.length;

    for (const player of allPlayers) {
      const playerAnimals = {};

      for (const animal of player.animals || []) {
        const name = animal.name;
        if (!name) continue;

        totals[name] = (totals[name] || 0) + 1;

        if (!mutations[name]) mutations[name] = {};
        const mut = animal.mutation || "Default";
        mutations[name][mut] = (mutations[name][mut] || 0) + 1;

        if (!traits[name]) traits[name] = {};
        for (const trait of animal.traits || []) {
          traits[name][trait] = (traits[name][trait] || 0) + 1;
        }

        if (!baseGens[name]) baseGens[name] = [];
        baseGens[name].push(animal.baseGen || 0);

        if (!totalGens[name]) totalGens[name] = [];
        totalGens[name].push(animal.totalGen || 0);

        playerAnimals[name] = true;
      }

      for (const name of Object.keys(playerAnimals)) {
        if (!owners[name]) owners[name] = 0;
        owners[name]++;

        if (!ownerRebirths[name]) ownerRebirths[name] = [];
        ownerRebirths[name].push(player.rebirth || 0);

        if (!ownerCoins[name]) ownerCoins[name] = [];
        ownerCoins[name].push(player.coins || 0);
      }
    }

    // Compute averages
    const avgRebirths = {};
    const avgCoins = {};
    const avgBaseGen = {};
    const sumTotalGen = {};

    for (const [name, rebs] of Object.entries(ownerRebirths)) {
      avgRebirths[name] = rebs.reduce((a, b) => a + b, 0) / rebs.length;
    }
    for (const [name, cs] of Object.entries(ownerCoins)) {
      avgCoins[name] = cs.reduce((a, b) => a + b, 0) / cs.length;
    }
    for (const [name, gens] of Object.entries(baseGens)) {
      avgBaseGen[name] = gens.length > 0 ? gens[0] : 0;
    }
    for (const [name, gens] of Object.entries(totalGens)) {
      sumTotalGen[name] = gens.reduce((a, b) => a + b, 0);
    }

    await db.collection("totals").updateOne(
      { _id: "global" },
      {
        $set: {
          counts: totals,
          mutations,
          traits,
          owners,
          avgRebirths,
          avgCoins,
          baseGens: avgBaseGen,
          totalGens: sumTotalGen,
          totalPlayers: totalPlayerCount,
          lastUpdated: new Date(),
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