import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ArrowUpDown,
  Eye,
  EyeOff,
  Megaphone,
  Tv,
  Calendar,
  FileText,
} from "lucide-react";
import { teamMembers, briefs } from "../data/mockData";

const EDITOR_COLORS = teamMembers.map((m) => m.color || "#888");

const AD_COLS = [
  { key: "editsDelivered", label: "Ad Edits", src: "adStats" },
  { key: "thumbStopRate", label: "Thumb-Stop", src: "adStats", format: (v) => `${v}%` },
  { key: "hookRate", label: "Hook", src: "adStats", format: (v) => `${v}%` },
  { key: "creativeWinRate", label: "Win %", src: "adStats", format: (v) => `${v}%` },
];

const ORG_COLS = [
  { key: "editsDelivered", label: "Org Edits", src: "organicStats" },
  { key: "totalViews", label: "Views", src: "organicStats", format: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K` },
  { key: "avgWatchTime", label: "Watch", src: "organicStats", format: (v) => `${v.toFixed(1)}s` },
  { key: "saveRate", label: "Saves", src: "organicStats", format: (v) => `${v.toFixed(1)}%` },
  { key: "shareRate", label: "Shares", src: "organicStats", format: (v) => `${v.toFixed(1)}%` },
  { key: "completionRate", label: "Compl.", src: "organicStats", format: (v) => `${v}%` },
  { key: "viralCoeff", label: "Viral", src: "organicStats", format: (v) => `${v.toFixed(1)}x` },
  { key: "avgEngRate", label: "Eng %", src: "organicStats", format: (v) => `${v.toFixed(1)}%` },
];

const BASE_COLS = [
  { key: "assetsDelivered", label: "Total", src: "stats" },
  { key: "approvalRate", label: "Approval", src: "stats", format: (v) => `${v}%` },
  { key: "deliveredThisMonth", label: "Month", src: "stats" },
  { key: "activeBriefs", label: "Briefs", src: "stats" },
  { key: "avgTurnaround", label: "Avg Approval Time", src: "stats" },
  { key: "revisionsAvg", label: "Avg Revisions", src: "stats" },
];

const PERIODS = [
  { id: "wtd", label: "WTD", days: 7 },
  { id: "mtd", label: "MTD", days: 30 },
  { id: "ytd", label: "YTD", days: 90 },
];

const CHART_FILTERS = [
  { id: "all", label: "All Exports" },
  { id: "approved", label: "Approved" },
  { id: "revisions", label: "Needs Revision" },
  { id: "inReview", label: "In Review" },
];

const CAMPAIGNS = briefs.map((b) => ({ id: b.id, label: b.title, campaign: b.campaign }));

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDailyTimeline(editorId, baseValue, dayCount, statusRatio = 1) {
  const rand = seededRandom(editorId * 100 + dayCount * 7 + Math.round(statusRatio * 100));
  const today = new Date(2026, 3, 13);
  const points = [];
  const scaled = baseValue * statusRatio;
  let prev = scaled * (0.6 + rand() * 0.4);
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const drift = (rand() - 0.45) * scaled * 0.15;
    prev = Math.max(prev + drift, scaled * 0.05);
    const label =
      dayCount <= 7
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]
        : dayCount <= 31
          ? `${d.getMonth() + 1}/${d.getDate()}`
          : `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}`;
    points.push({ label, value: Math.round(prev) });
  }
  return points;
}

export default function Admin() {
  const [showAd, setShowAd] = useState(true);
  const [showOrg, setShowOrg] = useState(true);
  const [visibleEditors, setVisibleEditors] = useState(
    () => new Set(teamMembers.map((m) => m.id))
  );
  const [period, setPeriod] = useState("mtd");
  const [chartFilter, setChartFilter] = useState("all");
  const [campaignId, setCampaignId] = useState("all");
  const [sortCol, setSortCol] = useState("assetsDelivered");
  const [sortDir, setSortDir] = useState("desc");

  const activePeriod = PERIODS.find((p) => p.id === period) || PERIODS[1];

  const campaignBriefs = useMemo(() => {
    if (campaignId === "all") return briefs;
    return briefs.filter((b) => b.id === Number(campaignId));
  }, [campaignId]);

  const campaignEditorIds = useMemo(() => {
    if (campaignId === "all") return new Set(teamMembers.map((m) => m.id));
    const ids = new Set();
    campaignBriefs.forEach((b) => b.assignees?.forEach((a) => ids.add(a.id)));
    return ids;
  }, [campaignId, campaignBriefs]);

  const toggleEditor = (id) => {
    setVisibleEditors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setVisibleEditors(
      visibleEditors.size === teamMembers.length
        ? new Set([teamMembers[0].id])
        : new Set(teamMembers.map((m) => m.id))
    );
  };

  const statusRatios = { all: 1, approved: 0.65, revisions: 0.2, inReview: 0.15 };

  const timelineData = useMemo(() => {
    const ratio = statusRatios[chartFilter] || 1;
    return teamMembers
      .filter((m) => visibleEditors.has(m.id) && campaignEditorIds.has(m.id))
      .map((m) => {
        const base = m.stats?.assetsDelivered ?? 100;
        const points = generateDailyTimeline(m.id, base, activePeriod.days || 30, ratio);
        const total = points.reduce((s, p) => s + p.value, 0);
        return { ...m, points, periodTotal: Math.round(total) };
      });
  }, [visibleEditors, campaignEditorIds, period, activePeriod.days, chartFilter]);

  const highlights = useMemo(() => {
    const editors = teamMembers.filter((m) => visibleEditors.has(m.id) && campaignEditorIds.has(m.id));
    if (editors.length === 0) return [];
    const items = [];
    const totalDelivered = editors.reduce((s, e) => s + (e.stats?.assetsDelivered ?? 0), 0);
    items.push({ label: "Total Delivered", value: totalDelivered.toLocaleString() });
    const avgApproval = editors.reduce((s, e) => s + (e.stats?.approvalRate ?? 0), 0) / editors.length;
    items.push({ label: "Avg Approval", value: `${avgApproval.toFixed(0)}%` });
    const avgTurnaround = editors.reduce((s, e) => s + parseFloat(String(e.stats?.avgTurnaround ?? "2").replace(/[^0-9.]/g, "")), 0) / editors.length;
    items.push({ label: "Avg Approval Time", value: `${avgTurnaround.toFixed(1)}d` });
    const avgRevisions = editors.reduce((s, e) => s + (e.stats?.revisionsAvg ?? 0), 0) / editors.length;
    items.push({ label: "Avg Revisions", value: avgRevisions.toFixed(1) });
    if (showAd) {
      const adEdits = editors.reduce((s, e) => s + (e.adStats?.editsDelivered ?? 0), 0);
      items.push({ label: "Ad Edits", value: adEdits, accent: "amber" });
    }
    if (showOrg) {
      const totalViews = editors.reduce((s, e) => s + (e.organicStats?.totalViews ?? 0), 0);
      items.push({ label: "Total Views", value: totalViews >= 1e6 ? `${(totalViews / 1e6).toFixed(1)}M` : `${(totalViews / 1e3).toFixed(0)}K`, accent: "teal" });
      const avgEng = editors.reduce((s, e) => s + (e.organicStats?.avgEngRate ?? 0), 0) / editors.length;
      items.push({ label: "Avg Eng.", value: `${avgEng.toFixed(1)}%`, accent: "teal" });
    }
    items.push({ label: "Briefs", value: campaignBriefs.length });
    items.push({ label: "Editors", value: editors.length });
    return items;
  }, [visibleEditors, campaignEditorIds, showAd, showOrg, campaignBriefs]);

  const sortedMembers = useMemo(() => {
    const members = teamMembers.filter((m) => campaignEditorIds.has(m.id));
    return [...members].sort((a, b) => {
      const col = [...BASE_COLS, ...AD_COLS, ...ORG_COLS].find((c) => c.key === sortCol);
      const src = col?.src || "stats";
      let av = a[src]?.[sortCol] ?? 0;
      let bv = b[src]?.[sortCol] ?? 0;
      if (typeof av === "string") av = parseFloat(av.replace(/[^0-9.]/g, "")) || 0;
      if (typeof bv === "string") bv = parseFloat(bv.replace(/[^0-9.]/g, "")) || 0;
      return sortDir === "desc" ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
  }, [sortCol, sortDir, campaignEditorIds]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pb-6 pt-20 fade-in">
        <div className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Controls bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (showAd && !showOrg) return; setShowAd(!showAd); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 border ${
                  showAd
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-white/[0.01] border-white/[0.04] text-white/20"
                }`}
              >
                <Megaphone size={12} /> Ad
                {showAd ? <Eye size={10} className="ml-0.5 opacity-60" /> : <EyeOff size={10} className="ml-0.5" />}
              </button>
              <button
                onClick={() => { if (showOrg && !showAd) return; setShowOrg(!showOrg); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 border ${
                  showOrg
                    ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                    : "bg-white/[0.01] border-white/[0.04] text-white/20"
                }`}
              >
                <Tv size={12} /> Organic
                {showOrg ? <Eye size={10} className="ml-0.5 opacity-60" /> : <EyeOff size={10} className="ml-0.5" />}
              </button>

              <div className="w-px h-5 bg-white/[0.06] mx-1" />

              <Calendar size={11} className="text-white/20" />
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-2.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    period === p.id ? "bg-white/[0.07] text-white" : "text-white/25 hover:text-white/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <div className="w-px h-5 bg-white/[0.06] mx-1" />

              {/* Chart status filter */}
              {CHART_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setChartFilter(f.id)}
                  className={`px-2.5 py-2 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                    chartFilter === f.id ? "bg-accent-red/10 text-accent-red" : "text-white/20 hover:text-white/45"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="w-px h-5 bg-white/[0.06] mx-1" />

              {/* Campaign filter */}
              <FileText size={11} className="text-white/20" />
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white/60 outline-none cursor-pointer hover:bg-white/[0.05] transition-all appearance-none pr-6"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="all" className="bg-[#111] text-white">All Campaigns</option>
                {CAMPAIGNS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111] text-white">{c.label}</option>
                ))}
              </select>
            </div>

            {/* Editor thumbnails */}
            <div className="flex items-center gap-1">
              <button onClick={toggleAll} className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-all">
                {visibleEditors.size === teamMembers.length ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
              {teamMembers.map((m, i) => {
                const active = visibleEditors.has(m.id);
                const inStakeholder = campaignEditorIds.has(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleEditor(m.id)}
                    className={`relative rounded-full transition-all duration-200 ${!inStakeholder ? "opacity-15 pointer-events-none" : ""}`}
                    title={m.name}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-7 h-7 rounded-full object-cover transition-all duration-200"
                      style={{
                        opacity: active ? 1 : 0.25,
                        boxShadow: active ? `0 0 0 2px ${EDITOR_COLORS[i]}` : "0 0 0 1px rgba(255,255,255,0.06)",
                      }}
                    />
                    {active && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#111]"
                        style={{ backgroundColor: EDITOR_COLORS[i] }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numerical highlights strip */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.03] overflow-x-auto">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-white/25 font-medium">{h.label}</span>
                <span className={`text-[16px] font-black tracking-tight leading-none ${
                  h.accent === "amber" ? "text-amber-400/80" : h.accent === "teal" ? "text-teal-400/80" : "text-white/70"
                }`}>
                  {h.value}
                </span>
                {i < highlights.length - 1 && <div className="w-px h-4 bg-white/[0.04] ml-2" />}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
                Edits Exported — {CHART_FILTERS.find((f) => f.id === chartFilter)?.label}
              </span>
              {timelineData.map((ed) => (
                <span key={ed.id} className="text-[10px] font-bold ml-2" style={{ color: ed.color, opacity: 0.5 }}>
                  {ed.name.split(" ")[0]}: {ed.periodTotal}
                </span>
              ))}
            </div>
            <LineChart data={timelineData} chartFilter={chartFilter} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-white/[0.03]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-4 py-3 text-[10px] text-white/25 font-bold uppercase tracking-wider sticky left-0 bg-[#111]/80 backdrop-blur-sm z-10 w-[200px]">
                    Editor
                  </th>
                  {BASE_COLS.map((col) => (
                    <ThSortable key={`b-${col.key}`} col={col} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  ))}
                  {showAd && (
                    <>
                      <th className="px-2 py-3"><div className="w-px h-3 bg-amber-500/20 mx-auto" /></th>
                      {AD_COLS.map((col) => (
                        <ThSortable key={`a-${col.key}`} col={col} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} accent="amber" />
                      ))}
                    </>
                  )}
                  {showOrg && (
                    <>
                      <th className="px-2 py-3"><div className="w-px h-3 bg-teal-500/20 mx-auto" /></th>
                      {ORG_COLS.map((col) => (
                        <ThSortable key={`o-${col.key}`} col={col} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} accent="teal" />
                      ))}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member, i) => {
                  const isVisible = visibleEditors.has(member.id);
                  const ci = teamMembers.findIndex((m) => m.id === member.id);
                  return (
                    <tr key={member.id} className={`border-b border-white/[0.02] transition-all duration-200 ${isVisible ? "hover:bg-white/[0.015]" : "opacity-30"}`}>
                      <td className="px-4 py-3 sticky left-0 bg-[#111]/80 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/[0.06]" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#111]" style={{ backgroundColor: EDITOR_COLORS[ci] }} />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white/70 leading-none">{member.name}</p>
                            <p className="text-[10px] text-white/25 mt-0.5">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      {BASE_COLS.map((col) => {
                        const val = member[col.src]?.[col.key];
                        return (
                          <td key={`b-${col.key}`} className="px-3 py-3 text-[12px] text-white/50 font-mono text-center">
                            {col.key === "approvalRate" ? <ApprovalBar value={val} /> : (col.format ? col.format(val) : val)}
                          </td>
                        );
                      })}
                      {showAd && (
                        <>
                          <td className="px-2"><div className="w-px h-5 bg-amber-500/8 mx-auto" /></td>
                          {AD_COLS.map((col) => {
                            const val = member.adStats?.[col.key];
                            return (
                              <td key={`a-${col.key}`} className="px-3 py-3 text-[12px] text-amber-400/50 font-mono text-center">
                                {col.format ? col.format(val) : val}
                              </td>
                            );
                          })}
                        </>
                      )}
                      {showOrg && (
                        <>
                          <td className="px-2"><div className="w-px h-5 bg-teal-500/8 mx-auto" /></td>
                          {ORG_COLS.map((col) => {
                            const val = member.organicStats?.[col.key];
                            return (
                              <td key={`o-${col.key}`} className="px-3 py-3 text-[12px] text-teal-400/50 font-mono text-center">
                                {col.format ? col.format(val) : val}
                              </td>
                            );
                          })}
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
function LineChart({ data, chartFilter }) {
  const CHART_H = 380;
  const [dimensions, setDimensions] = useState({ width: 800, height: CHART_H });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animated, setAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setDimensions({ width: entry.contentRect.width, height: CHART_H });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setAnimated(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    return () => cancelAnimationFrame(t);
  }, [data.length, data.map((d) => d.id).join(",")]);

  if (data.length === 0 || !data[0].points) return null;

  const labels = data[0].points.map((p) => p.label);
  const allValues = data.flatMap((d) => d.points.map((p) => p.value));
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;

  const pad = { top: 28, right: 16, bottom: 32, left: 54 };
  const chartW = dimensions.width - pad.left - pad.right;
  const chartH = dimensions.height - pad.top - pad.bottom;
  const xStep = labels.length > 1 ? chartW / (labels.length - 1) : chartW;

  const getSmoothPath = useCallback(
    (points) => {
      if (points.length < 2) return "";
      const coords = points.map((p, i) => ({
        x: pad.left + i * xStep,
        y: pad.top + chartH - ((p.value - minVal) / range) * chartH,
      }));
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
      }
      return d;
    },
    [pad.left, pad.top, xStep, chartH, minVal, range]
  );

  const yTicks = 8;
  const labelInterval = Math.max(1, Math.ceil(labels.length / 14));

  const callouts = useMemo(() => {
    const result = [];
    data.forEach((editor) => {
      const pts = editor.points;
      if (pts.length < 4) return;

      let peakIdx = 0;
      pts.forEach((p, i) => { if (p.value > pts[peakIdx].value) peakIdx = i; });

      const approval = editor.stats?.approvalRate ?? 0;
      const revisions = editor.stats?.revisionsAvg ?? 0;
      const turnaround = editor.stats?.avgTurnaround ?? "—";
      const peakVal = Math.round(pts[peakIdx].value);

      let context;
      if (chartFilter === "approved") context = `${approval}% rate · ${turnaround}`;
      else if (chartFilter === "revisions") context = `${revisions} avg revisions`;
      else if (chartFilter === "inReview") context = `${turnaround} turnaround`;
      else context = `${peakVal} peak · ${approval}% approved`;

      result.push({
        editorId: editor.id,
        index: peakIdx,
        color: editor.color,
        name: editor.name.split(" ")[0],
        value: peakVal,
        context,
      });
    });
    return result;
  }, [data, chartFilter]);

  return (
    <div ref={containerRef} className="relative" style={{ height: CHART_H }}>
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {Array.from({ length: yTicks }, (_, i) => {
          const y = pad.top + (chartH / (yTicks - 1)) * i;
          return <line key={i} x1={pad.left} y1={y} x2={dimensions.width - pad.right} y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth={0.5} />;
        })}

        {Array.from({ length: yTicks }, (_, i) => {
          const val = maxVal - (range / (yTicks - 1)) * i;
          const y = pad.top + (chartH / (yTicks - 1)) * i;
          return <text key={i} x={pad.left - 10} y={y + 4} textAnchor="end" className="fill-white/[0.12] text-[10px] font-mono">{Math.round(val)}</text>;
        })}

        {labels.map((label, i) => {
          if (i % labelInterval !== 0 && i !== labels.length - 1) return null;
          return <text key={i} x={pad.left + i * xStep} y={dimensions.height - 6} textAnchor="middle" className="fill-white/[0.18] text-[10px] font-mono">{label}</text>;
        })}

        {data.map((editor) => {
          const linePath = getSmoothPath(editor.points);
          const pathLen = chartW * 2;
          return (
            <g key={editor.id}>
              <path d={linePath} fill="none" stroke={editor.color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.65}
                style={{ strokeDasharray: pathLen, strokeDashoffset: animated ? 0 : pathLen, transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
              {editor.points.length > 0 && (() => {
                const last = editor.points[editor.points.length - 1];
                const cx = pad.left + (editor.points.length - 1) * xStep;
                const cy = pad.top + chartH - ((last.value - minVal) / range) * chartH;
                return <circle cx={cx} cy={cy} r={2.5} fill={editor.color} opacity={animated ? 0.7 : 0} style={{ transition: "opacity 0.5s ease-out 1.2s" }} />;
              })()}
            </g>
          );
        })}

        {animated && callouts.map((c, ci) => {
          const editor = data.find((d) => d.id === c.editorId);
          if (!editor) return null;
          const p = editor.points[c.index];
          if (!p) return null;
          const cx = pad.left + c.index * xStep;
          const cy = pad.top + chartH - ((p.value - minVal) / range) * chartH;
          const textWidth = (c.name.length + c.context.length + 3) * 4.2;
          const halfW = Math.max(textWidth / 2, 44);
          const clampX = Math.max(pad.left + halfW, Math.min(cx, dimensions.width - pad.right - halfW));
          return (
            <g key={ci} opacity={animated ? 1 : 0} style={{ transition: "opacity 0.6s ease-out 1.8s" }}>
              <line x1={cx} y1={cy - 6} x2={cx} y2={cy - 18} stroke={c.color} strokeWidth={0.6} opacity={0.25} />
              <circle cx={cx} cy={cy} r={3.5} fill="none" stroke={c.color} strokeWidth={0.8} opacity={0.35} />
              <rect x={clampX - halfW} y={cy - 35} width={halfW * 2} height={16} rx={5} fill={c.color} opacity={0.1} />
              <text x={clampX} y={cy - 24} textAnchor="middle" className="text-[8px] font-bold" fill={c.color} opacity={0.75}>
                {c.name} · {c.context}
              </text>
            </g>
          );
        })}

        {hoveredPoint && (
          <line x1={pad.left + hoveredPoint.index * xStep} y1={pad.top} x2={pad.left + hoveredPoint.index * xStep} y2={pad.top + chartH} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} strokeDasharray="4 3" />
        )}

        {labels.map((label, i) => {
          const x = pad.left + i * xStep;
          const colW = Math.max(xStep * 0.8, 6);
          return (
            <rect key={i} x={x - colW / 2} y={pad.top} width={colW} height={chartH} fill="transparent" className="cursor-crosshair"
              onMouseEnter={() => setHoveredPoint({ index: i, label, vals: data.map((d) => ({ name: d.name.split(" ")[0], color: d.color, value: d.points[i]?.value ?? 0 })) })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}

        {hoveredPoint && data.map((editor) => {
          const p = editor.points[hoveredPoint.index];
          if (!p) return null;
          const cx = pad.left + hoveredPoint.index * xStep;
          const cy = pad.top + chartH - ((p.value - minVal) / range) * chartH;
          return <circle key={editor.id} cx={cx} cy={cy} r={3.5} fill={editor.color} opacity={0.9} />;
        })}
      </svg>

      {hoveredPoint && (
        <div className="absolute pointer-events-none z-30 glass-panel rounded-lg px-3.5 py-3 border border-white/[0.08] shadow-xl"
          style={{ left: Math.min(pad.left + hoveredPoint.index * xStep, dimensions.width - 160), top: 0, transform: "translateX(-50%)" }}>
          <p className="text-[10px] text-white/35 font-mono mb-2">{hoveredPoint.label}</p>
          {hoveredPoint.vals.map((v) => (
            <div key={v.name} className="flex items-center gap-2.5 py-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
              <span className="text-[11px] text-white/50 w-14">{v.name}</span>
              <span className="text-[13px] text-white font-black font-mono">{Math.round(v.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ThSortable({ col, sortCol, sortDir, onSort, accent }) {
  const active = sortCol === col.key;
  const color = accent === "amber" ? "text-amber-400/40" : accent === "teal" ? "text-teal-400/40" : "text-white/25";
  const activeColor = accent === "amber" ? "text-amber-400" : accent === "teal" ? "text-teal-400" : "text-accent-red";
  return (
    <th className="px-3 py-2.5">
      <button onClick={() => onSort(col.key)}
        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap mx-auto ${active ? activeColor : `${color} hover:text-white/45`}`}>
        {col.label}
        <ArrowUpDown size={9} className={active ? activeColor : "text-white/10"} style={{ transform: active && sortDir === "asc" ? "scaleY(-1)" : undefined }} />
      </button>
    </th>
  );
}

function ApprovalBar({ value }) {
  const c = value >= 96 ? "#14b8a6" : value >= 93 ? "#eab308" : "#e8442e";
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-12 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: c }} />
      </div>
      <span className="text-[11px] font-bold" style={{ color: c }}>{value}%</span>
    </div>
  );
}
