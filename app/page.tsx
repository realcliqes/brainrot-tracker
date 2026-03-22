"use client";
import { useState, useEffect } from "react";
export default function Home() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  async function fetchData() {
    try { const res = await fetch("/api/counts"); const json = await res.json(); setData(json); }
    catch (e) { console.error("Failed to fetch:", e); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, []);
  const filtered = (data?.brainrots || []).filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()));
  function getRankClass(i: number) { if (i===0) return "rank gold"; if (i===1) return "rank silver"; if (i===2) return "rank bronze"; return "rank"; }
  return (
    <div className="container">
      <h1>🧠 Brainrot Tracker</h1>
      <p className="subtitle"><span className="dot"></span>Live — updates every 60s</p>
      <div className="stats">
        <div className="stat-card"><div className="stat-number">{data ? data.totalBrainrots.toLocaleString() : "—"}</div><div className="stat-label">Total Brainrots</div></div>
        <div className="stat-card"><div className="stat-number">{data ? data.brainrots.length.toLocaleString() : "—"}</div><div className="stat-label">Unique Types</div></div>
      </div>
      <input className="search" type="text" placeholder="Search brainrots..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="list">
        {loading ? <div className="loading">Loading data...</div> : filtered.length === 0 ? <div className="loading">No brainrots found.</div> :
          filtered.map((b: any, i: number) => (
            <div className="item" key={b.name}><span className={getRankClass(i)}>#{i+1}</span><span className="name">{b.name}</span><span className="count">{b.count.toLocaleString()}</span></div>
          ))}
      </div>
      <div className="footer">{data?.lastUpdated ? "Last updated: " + new Date(data.lastUpdated).toLocaleString() : ""}</div>
    </div>
  );
}
