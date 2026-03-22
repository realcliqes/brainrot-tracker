"use client";

import { useState, useEffect } from "react";

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1e15) return (n / 1e15).toFixed(1) + "Q";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function Home() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  async function fetchData() {
    try {
      const res = await fetch("/api/counts");
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(name) {
    try {
      const res = await fetch("/api/counts?name=" + encodeURIComponent(name));
      const json = await res.json();
      setSelected(json);
    } catch (e) { console.error(e); }
  }

  async function searchPlayer() {
    if (!playerSearch.trim()) return;
    setPlayerLoading(true);
    try {
      const res = await fetch("/api/counts?user=" + encodeURIComponent(playerSearch.trim()));
      const json = await res.json();
      setPlayer(json);
    } catch (e) { console.error(e); }
    finally { setPlayerLoading(false); }
  }

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, []);

  // Player view
  if (player && player.found) {
    const animalCounts = {};
    for (const a of player.animals || []) {
      animalCounts[a.name] = (animalCounts[a.name] || 0) + 1;
    }
    const sorted = Object.entries(animalCounts).sort((a, b) => b[1] - a[1]);

    return (
      <div className="container">
        <button className="back-btn" onClick={() => setPlayer(null)}>← Back</button>
        <h1>👤 {player.displayName}</h1>
        <p className="subtitle">@{player.username} • User ID: {player.userId}</p>
        <div className="stats">
          <div className="stat-card"><div className="stat-number">{player.rebirth}</div><div className="stat-label">Rebirth</div></div>
          <div className="stat-card"><div className="stat-number">${formatNum(player.coins)}</div><div className="stat-label">Coins</div></div>
          <div className="stat-card"><div className="stat-number">{(player.animals || []).length}</div><div className="stat-label">Brainrots</div></div>
        </div>
        <div className="section-title">Brainrot Inventory</div>
        <div className="list">
          {sorted.map(([name, count]) => (
            <div className="item" key={name}>
              <span className="name">{name}</span>
              <span className="count">x{count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Detail view
  if (selected) {
    const mutEntries = Object.entries(selected.mutations || {}).sort((a, b) => b[1] - a[1]);
    const traitEntries = Object.entries(selected.traits || {}).sort((a, b) => b[1] - a[1]);
    const totalCount = selected.count || 1;
    const rc = "rarity-" + (selected.rarity || "common").toLowerCase().replace(/[^a-z]/g, "");

    return (
      <div className="container">
        <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>
        <h1>{selected.name}</h1>
        <p className="subtitle"><span className={"rarity-badge " + rc}>{selected.rarity}</span></p>

        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Exists</div><div className="stat-number">{selected.count.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Avg Rebirth</div><div className="stat-number">{selected.avgRebirth}</div></div>
          <div className="stat-card"><div className="stat-label">Avg Coins</div><div className="stat-number">${selected.avgCoinsFormatted}</div></div>
          <div className="stat-card"><div className="stat-label">Base Gen/s</div><div className="stat-number">{selected.baseGenFormatted}</div></div>
          <div className="stat-card"><div className="stat-label">Total Gen/s</div><div className="stat-number">{selected.totalGenFormatted}<div className="stat-sub">~{formatNum(Math.round((selected.totalGen || 0) / Math.max(selected.count, 1)))}/ea avg</div></div></div>
        </div>

        <div className="owner-info">{selected.ownerPercentage}% of players own this ({selected.owners.toLocaleString()} of {selected.totalPlayers.toLocaleString()})</div>

        <div className="section-title">Mutations & Traits</div>
        <div className="subsection">Mutations</div>
        <div className="list">
          {mutEntries.length === 0 ? <div className="loading">None yet</div> :
            mutEntries.map(([name, count]) => {
              const pct = ((count / totalCount) * 100).toFixed(1);
              return (
                <div className="bar-item" key={name}>
                  <div className="bar-left">
                    <span className={"mut-dot mut-" + name.toLowerCase().replace(/[^a-z]/g, "")}></span>
                    <span className="bar-name">{name}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: pct + "%" }}></div></div>
                  <div className="bar-right"><span className="bar-count">{count}</span><span className="bar-pct">({pct}%)</span></div>
                </div>
              );
            })}
        </div>

        <div className="subsection">Traits {traitEntries.length > 10 ? `(showing top 10 of ${traitEntries.length})` : ""}</div>
        <div className="list">
          {traitEntries.length === 0 ? <div className="loading">None yet</div> :
            traitEntries.slice(0, 10).map(([name, count]) => {
              const pct = ((count / totalCount) * 100).toFixed(1);
              return (
                <div className="bar-item" key={name}>
                  <div className="bar-left">
                    <span className="trait-dot"></span>
                    <span className="bar-name">{name}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill trait-fill" style={{ width: pct + "%" }}></div></div>
                  <div className="bar-right"><span className="bar-count">{count}</span><span className="bar-pct">({pct}%)</span></div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Main list
  const rarities = ["all", "Common", "Rare", "Epic", "Legendary", "Mythic", "Brainrot God", "Secret", "OG"];
  const filtered = (data?.brainrots || []).filter((b) => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || b.rarity === filter;
    return ms && mf;
  });

  const rarityCounts = {};
  for (const b of data?.brainrots || []) {
    rarityCounts[b.rarity] = (rarityCounts[b.rarity] || 0) + 1;
  }

  const rc = (r) => "rarity-" + r.toLowerCase().replace(/[^a-z]/g, "");

  return (
    <div className="container">
      <h1>🧠 Brainrot Tracker</h1>
      <p className="subtitle"><span className="dot"></span>Live — updates every 60s</p>

      <div className="player-search">
        <input className="search" type="text" placeholder="🔍 Search player by User ID or Username (press Enter)..." value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") searchPlayer(); }} />
        {playerLoading && <div className="loading">Searching...</div>}
        {player && !player.found && <div className="not-found">Player not found</div>}
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-number">{data ? data.totalExist.toLocaleString() : "—"}</div><div className="stat-label">Total Exist</div></div>
        <div className="stat-card"><div className="stat-number">{data ? data.totalPlayers.toLocaleString() : "—"}</div><div className="stat-label">Players Tracked</div></div>
        <div className="stat-card"><div className="stat-number">{data ? data.brainrots.length : "—"}</div><div className="stat-label">All Types</div></div>
      </div>

      <div className="filter-label">Filter by Rarity:</div>
      <div className="filters">
        {rarities.map((r) => (
          <button key={r} className={`filter-btn ${filter === r ? "active" : ""} ${r !== "all" ? rc(r) : ""}`} onClick={() => setFilter(r)}>
            {r === "all" ? "All" : r} {r !== "all" && rarityCounts[r] ? `(${rarityCounts[r]})` : ""}
          </button>
        ))}
      </div>

      <input className="search" type="text" placeholder="🔍 Search brainrot names..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="table-header">
        <span className="th-rank">#</span>
        <span className="th-rarity">Rarity</span>
        <span className="th-name">Name</span>
        <span className="th-rebirth">Avg Rebirth</span>
        <span className="th-coins">Avg Coins</span>
        <span className="th-pct">Owners</span>
      </div>

      <div className="list">
        {loading ? <div className="loading">Loading data...</div> :
          filtered.length === 0 ? <div className="loading">No brainrots found.</div> :
          filtered.map((b, i) => (
            <div className="table-row clickable" key={b.name} onClick={() => openDetail(b.name)}>
              <span className="td-rank">#{i + 1}</span>
              <span className={"td-rarity " + rc(b.rarity)}>{b.rarity}</span>
              <span className="td-name">{b.name}</span>
              <span className="td-rebirth">{b.avgRebirth}</span>
              <span className="td-coins">${b.avgCoins}</span>
              <span className="td-pct">
                <span className="pct-value">{b.percentage}%</span>
                <span className="pct-sub">{b.count.toLocaleString()} exists</span>
              </span>
            </div>
          ))}
      </div>

      <div className="footer">{data?.lastUpdated ? "Last updated: " + new Date(data.lastUpdated).toLocaleString() : ""}<br/>Showing {filtered.length} of {data?.brainrots.length || 0} types</div>
    </div>
  );
}