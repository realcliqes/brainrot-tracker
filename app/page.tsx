"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  async function fetchData() {
    try {
      const res = await fetch("/api/counts");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(name: string) {
    try {
      const res = await fetch("/api/counts?name=" + encodeURIComponent(name));
      const json = await res.json();
      setSelected(json);
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (selected) {
    const mutEntries = Object.entries(selected.mutations || {}).sort((a: any, b: any) => b[1] - a[1]);
    const traitEntries = Object.entries(selected.traits || {}).sort((a: any, b: any) => b[1] - a[1]);

    const rarityClass = "rarity-" + (selected.rarity || "Common").toLowerCase().replace(/[^a-z]/g, "");

    return (
      <div className="container">
        <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>
        <h1>{selected.name}</h1>
        <p className="subtitle">
          <span className={`rarity-badge ${rarityClass}`}>{selected.rarity}</span>
        </p>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{(selected.count || 0).toLocaleString()}</div>
            <div className="stat-label">Total Exist</div>
          </div>
        </div>

        <div className="section-title">🧬 Mutations</div>
        <div className="list">
          {mutEntries.length === 0 ? (
            <div className="loading">No mutations found.</div>
          ) : (
            mutEntries.map(([name, count]: any) => (
              <div className="item" key={name}>
                <span className="name">{name}</span>
                <span className="count">{count.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        <div className="section-title">⚡ Traits</div>
        <div className="list">
          {traitEntries.length === 0 ? (
            <div className="loading">No traits found.</div>
          ) : (
            traitEntries.map(([name, count]: any) => (
              <div className="item" key={name}>
                <span className="name">{name}</span>
                <span className="count">{count.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const rarities = ["all", "Common", "Rare", "Epic", "Legendary", "Mythic", "Brainrot God", "Secret", "OG"];

  const filtered = (data?.brainrots || []).filter((b: any) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || b.rarity === filter;
    return matchSearch && matchFilter;
  });

  function getRankClass(index: number) {
    if (index === 0) return "rank gold";
    if (index === 1) return "rank silver";
    if (index === 2) return "rank bronze";
    return "rank";
  }

  function getRarityClass(rarity: string) {
    return "rarity-" + (rarity || "common").toLowerCase().replace(/[^a-z]/g, "");
  }

  return (
    <div className="container">
      <h1>🧠 Brainrot Tracker</h1>
      <p className="subtitle"><span className="dot"></span>Live — updates every 60s</p>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{data ? data.totalExist.toLocaleString() : "—"}</div>
          <div className="stat-label">Total Exist</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data ? data.brainrots.length.toLocaleString() : "—"}</div>
          <div className="stat-label">All Brainrots</div>
        </div>
      </div>

      <input
        className="search"
        type="text"
        placeholder="Search brainrots..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        {rarities.map((r) => (
          <button
            key={r}
            className={`filter-btn ${filter === r ? "active" : ""} ${r !== "all" ? getRarityClass(r) : ""}`}
            onClick={() => setFilter(r)}
          >
            {r === "all" ? "All" : r}
          </button>
        ))}
      </div>

      <div className="list">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : filtered.length === 0 ? (
          <div className="loading">No brainrots found.</div>
        ) : (
          filtered.map((b: any, i: number) => (
            <div className="item clickable" key={b.name} onClick={() => openDetail(b.name)}>
              <span className={getRankClass(i)}>#{i + 1}</span>
              <span className="name">
                {b.name}
                <span className={`rarity-tag ${getRarityClass(b.rarity)}`}>{b.rarity}</span>
              </span>
              <span className="count">{b.count.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      <div className="footer">
        {data?.lastUpdated ? "Last updated: " + new Date(data.lastUpdated).toLocaleString() : ""}
      </div>
    </div>
  );
}