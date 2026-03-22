"use client";
import { useState, useEffect } from "react";

function fmt(n) {
  if (!n || n === 0) return "0";
  if (n >= 1e15) return (n / 1e15).toFixed(1) + "Q";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

const MUT_COLORS = {
  "Default":"#8b949e","Gold":"#ffd700","Diamond":"#48dbfb","Rainbow":"#ff9ff3",
  "Cursed":"#bf5fff","Divine":"#58a6ff","Lava":"#8b949e","YinYang":"#8b949e",
  "Galaxy":"#bc8cff","Bloodrot":"#f85149","Radioactive":"#3fb950","Candy":"#ff6b9d",
  "Halloween":"#ff6348","Bloodmoon":"#f85149",
};

const TRAIT_COLORS = {
  "Fire":"#f85149","Sombrero":"#ffa500","Indonesia":"#3fb950","Skibidi":"#ffa500",
  "Meowl":"#ffa500","Gold":"#ffd700",
};

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
      setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(name) {
    try {
      const res = await fetch("/api/counts?name=" + encodeURIComponent(name));
      setSelected(await res.json());
    } catch (e) { console.error(e); }
  }

  async function searchPlayer() {
    if (!playerSearch.trim()) return;
    setPlayerLoading(true);
    try {
      const res = await fetch("/api/counts?user=" + encodeURIComponent(playerSearch.trim()));
      setPlayer(await res.json());
    } catch (e) { console.error(e); }
    finally { setPlayerLoading(false); }
  }

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, []);

  // Player view
  if (player && player.found) {
    const ac = {};
    for (const a of player.animals || []) ac[a.name] = (ac[a.name] || 0) + 1;
    const sorted = Object.entries(ac).sort((a, b) => b[1] - a[1]);
    return (
      <div className="container">
        <button className="back-btn" onClick={() => setPlayer(null)}>← Back</button>
        <h1 className="detail-title">👤 {player.displayName}</h1>
        <p className="detail-sub">@{player.username} • ID: {player.userId}</p>
        <div className="stat-row">
          <div className="stat-box"><div className="stat-label">Rebirth</div><div className="stat-val">{player.rebirth}</div></div>
          <div className="stat-box"><div className="stat-label">Coins</div><div className="stat-val">${fmt(player.coins)}</div></div>
          <div className="stat-box"><div className="stat-label">Brainrots</div><div className="stat-val">{(player.animals || []).length}</div></div>
        </div>
        <div className="section-head">Brainrot Inventory</div>
        <div className="bar-list">
          {sorted.map(([name, count]) => (
            <div className="bar-row" key={name}>
              <div className="bar-label"><span className="bar-name">{name}</span></div>
              <div className="bar-right"><span className="bar-count">x{count}</span></div>
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
    const total = selected.count || 1;
    const maxMut = mutEntries.length > 0 ? mutEntries[0][1] : 1;
    const maxTrait = traitEntries.length > 0 ? traitEntries[0][1] : 1;
    const rc = "rbadge rb-" + (selected.rarity || "common").toLowerCase().replace(/[^a-z]/g, "").replace(/\s/g, "");

    return (
      <div className="container">
        <div className="detail-header">
          <button className="back-btn" onClick={() => setSelected(null)}>← Back</button>
          <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
        </div>
        <h1 className="detail-title">{selected.name}</h1>
        <div className="detail-badge-wrap"><span className={rc}>{selected.rarity}</span></div>

        <div className="stat-row">
          <div className="stat-box"><div className="stat-label">Total Exists</div><div className="stat-val">{selected.count.toLocaleString()}</div></div>
          <div className="stat-box"><div className="stat-label">Avg Rebirth</div><div className="stat-val">{selected.avgRebirth}</div></div>
          <div className="stat-box"><div className="stat-label">Avg Coins</div><div className="stat-val">${selected.avgCoinsFormatted}</div></div>
          <div className="stat-box"><div className="stat-label">Base Gen/s</div><div className="stat-val green">{selected.baseGenFormatted}</div></div>
          <div className="stat-box"><div className="stat-label">Total Gen/s</div><div className="stat-val">{selected.totalGenFormatted}<div className="stat-tiny">~{fmt(Math.round((selected.totalGen || 0) / Math.max(selected.count, 1)))}/ea avg</div></div></div>
        </div>

        <div className="owner-bar">{selected.ownerPercentage}% of players own this ({selected.owners.toLocaleString()} of {selected.totalPlayers.toLocaleString()})</div>

        <div className="section-head">Mutations & Traits</div>
        <div className="subsection-label">Mutations</div>
        <div className="bar-list">
          {mutEntries.length === 0 ? <div className="empty">None yet</div> :
            mutEntries.map(([name, count]) => {
              const pct = ((count / total) * 100).toFixed(1);
              const barW = ((count / maxMut) * 100).toFixed(1);
              const color = MUT_COLORS[name] || "#8b949e";
              const isColored = color !== "#8b949e";
              return (
                <div className="bar-row" key={name}>
                  <div className="bar-label">
                    <span className="dot" style={{background: color}}></span>
                    <span className="sparkle">✦</span>
                    <span className="bar-name" style={isColored ? {color} : {}}>{name}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width: barW + "%", background: color}}></div></div>
                  <div className="bar-right">
                    <span className="bar-count" style={isColored ? {color} : {}}>{count}</span>
                    <span className="bar-pct">({pct}%)</span>
                    <span className="bar-icon">👥</span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="subsection-label">Traits {traitEntries.length > 10 ? `(showing top 10 of ${traitEntries.length})` : ""}</div>
        <div className="bar-list">
          {traitEntries.length === 0 ? <div className="empty">None yet</div> :
            traitEntries.slice(0, 10).map(([name, count]) => {
              const pct = ((count / total) * 100).toFixed(1);
              const barW = ((count / maxTrait) * 100).toFixed(1);
              const color = TRAIT_COLORS[name] || "#8b949e";
              const isColored = color !== "#8b949e";
              return (
                <div className="bar-row" key={name}>
                  <div className="bar-label">
                    <span className="dot" style={{background: isColored ? color : "#8b949e"}}></span>
                    <span className="sparkle trait-sparkle">🏷️</span>
                    <span className="bar-name" style={isColored ? {color} : {}}>{name}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width: barW + "%", background: isColored ? color : "#8b949e"}}></div></div>
                  <div className="bar-right">
                    <span className="bar-count" style={isColored ? {color} : {}}>{count}</span>
                    <span className="bar-pct">({pct}%)</span>
                    <span className="bar-icon">👥</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Main list
  const rarities = ["all","Common","Rare","Epic","Legendary","Mythic","Brainrot God","Secret","OG"];
  const filtered = (data?.brainrots || []).filter(b => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || b.rarity === filter;
    return ms && mf;
  });
  const rc2 = {};
  for (const b of data?.brainrots || []) rc2[b.rarity] = (rc2[b.rarity] || 0) + 1;
  const rbcls = (r) => "rbadge rb-" + r.toLowerCase().replace(/[^a-z]/g, "");

  return (
    <div className="container">
      <h1 className="main-title">🧠 Brainrot Tracker</h1>
      <p className="main-sub"><span className="dot-live"></span> Live — updates every 60s</p>

      <div className="player-search-box">
        <input className="psearch" type="text" placeholder="👤 Search player by User ID or Username (press Enter)..."
          value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") searchPlayer(); }} />
        {playerLoading && <div className="empty">Searching...</div>}
        {player && !player.found && <div className="not-found">Player not found</div>}
      </div>

      <div className="stat-row three">
        <div className="stat-box accent"><div className="stat-val big">{data ? data.totalExist.toLocaleString() : "—"}</div><div className="stat-label">Total Exist</div></div>
        <div className="stat-box"><div className="stat-val big">{data ? data.totalPlayers.toLocaleString() : "—"}</div><div className="stat-label">Players Tracked</div></div>
        <div className="stat-box accent2"><div className="stat-val big">{data ? data.brainrots.length : "—"}</div><div className="stat-label">All Types</div></div>
      </div>

      <div className="filter-row">
        <span className="filter-label">Filter by Rarity:</span>
        <div className="filter-pills">
          {rarities.map(r => (
            <button key={r} className={`pill ${filter === r ? "active" : ""} ${r !== "all" ? rbcls(r) : "pill-all"}`}
              onClick={() => setFilter(r)}>
              {r === "all" ? "All" : r}{r !== "all" && rc2[r] ? ` (${rc2[r]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="search-box">
        <input className="msearch" type="text" placeholder="🔍 Search brainrot names..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="tbl-head">
        <span className="col-rank">#</span>
        <span className="col-rarity">RARITY</span>
        <span className="col-name">NAME</span>
        <span className="col-reb">AVG REBIRTH</span>
        <span className="col-coins">AVG COINS</span>
        <span className="col-own">OWNERS</span>
      </div>

      <div className="tbl-body">
        {loading ? <div className="empty">Loading data...</div> :
          filtered.length === 0 ? <div className="empty">No brainrots found.</div> :
          filtered.map((b, i) => (
            <div className="tbl-row" key={b.name} onClick={() => openDetail(b.name)}>
              <span className="col-rank">#{i + 1}</span>
              <span className="col-rarity"><span className={rbcls(b.rarity)}>{b.rarity}</span></span>
              <span className="col-name">{b.name}</span>
              <span className="col-reb">{b.avgRebirth}</span>
              <span className="col-coins">${b.avgCoins}</span>
              <span className="col-own">
                <span className="own-pct">{b.percentage}%</span>
                <span className="own-sub">{b.count.toLocaleString()} exists</span>
              </span>
            </div>
          ))}
      </div>

      <div className="foot">
        {data?.lastUpdated ? "Last updated: " + new Date(data.lastUpdated).toLocaleString() : ""}
        <br/>Showing {filtered.length} of {data?.brainrots?.length || 0} types
      </div>
    </div>
  );
}