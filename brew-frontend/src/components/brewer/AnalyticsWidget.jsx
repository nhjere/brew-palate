import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * props:
 *  - beers: [{
 *      beerId, name, style, abv, ibu, price, ounces,
 *      avgRating, reviewCount,
 *      positiveTagCounts: Record<string, number>,
 *      negativeTagCounts: Record<string, number>,
 *      reviews: [{ reviewId, createdAt, overallEnjoyment, flavorTags: string[] }, ...]
 *    }]
 */
export default function AnalyticsWidget({ beers = [] }) {
  const [tab, setTab] = useState("ratings"); // "ratings" | "tags" | "radar" | "matrix"
  const [styleFilter, setStyleFilter] = useState("All");
  const [selectedBeerId, setSelectedBeerId] = useState(null);

  const styles = useMemo(() => {
    const s = new Set(beers.map((b) => b.style).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [beers]);

  const filteredBeers = useMemo(() => {
    const base = styleFilter === "All" ? beers : beers.filter((b) => b.style === styleFilter);
    return selectedBeerId ? base.filter((b) => b.beerId === selectedBeerId) : base;
  }, [beers, styleFilter, selectedBeerId]);

  const selectedBeer =
    (selectedBeerId && beers.find((b) => b.beerId === selectedBeerId)) ||
    (beers.length ? beers[0] : null);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-xl border overflow-hidden">
          {[
            { k: "ratings", label: "Avg Ratings" },
            { k: "tags", label: "Flavor Tags" },
            { k: "radar", label: "Radar (1 beer)" },
            { k: "matrix", label: "Scatter Matrix" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-3 py-2 text-sm font-medium ${
                tab === t.k ? "bg-amber-600 text-white" : "bg-white hover:bg-amber-50 text-amber-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-700">Filter by Style</label>
          <select
            className="px-2 py-2 rounded-lg border"
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {selectedBeerId && (
            <button
              onClick={() => setSelectedBeerId(null)}
              className="ml-2 text-sm text-blue-700 underline"
            >
              Clear beer selection
            </button>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="w-full border rounded-xl p-3">
        {tab === "ratings" && (
          <AvgRatingsChart
            beers={filteredBeers}
            onSelectBeer={(id) => setSelectedBeerId((prev) => (prev === id ? null : id))}
            selectedBeerId={selectedBeerId}
          />
        )}
        {tab === "tags" && <FlavorTagsChart beers={filteredBeers} />}

        {tab === "radar" && (
          <div className="space-y-3">
            <BeerPicker beers={beers} value={selectedBeer?.beerId || ""} onChange={setSelectedBeerId} />
            <RadarTagsChart beer={selectedBeer} />
          </div>
        )}

        {tab === "matrix" && <ScatterMatrix beers={filteredBeers} />}
      </div>
    </div>
  );
}

/* ---------------------- Beer selector for Radar tab --------------------- */
function BeerPicker({ beers, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700">Beer</label>
      <select
        className="px-2 py-2 rounded-lg border"
        value={value}
        onChange={(e) => onChange(e.target.value || null)}
      >
        {beers.map((b) => (
          <option key={b.beerId} value={b.beerId}>
            {b.name} {b.style ? `• ${b.style}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ----------------------------- Avg Ratings ------------------------------ */

function AvgRatingsChart({ beers, onSelectBeer, selectedBeerId }) {
  const ref = useRef(null);

  const data = useMemo(() => {
    const arr = beers
      .map((b) => ({
        id: b.beerId,
        name: b.name || "Unnamed",
        value: Math.max(0, Math.min(5, b.avgRating || 0)),
        reviewCount: b.reviewCount || 0,
      }))
      .sort((a, b) => d3.descending(a.value, b.value));
    return arr;
  }, [beers]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const margin = { top: 20, right: 20, bottom: 40, left: 140 };
    const width = el.clientWidth || 640;
    const height = Math.max(240, data.length * 36 + margin.top + margin.bottom);

    const svg = d3.select(el).append("svg").attr("width", "100%").attr("height", height);

    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, 5]).range([0, plotW]);
    const y = d3.scaleBand().domain(data.map((d) => d.name)).range([0, plotH]).padding(0.18);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g").attr("transform", `translate(0,${plotH})`).call(d3.axisBottom(x).ticks(5));
    g.append("g").call(d3.axisLeft(y).tickSize(0));

    const bars = g
      .selectAll(".bar")
      .data(data, (d) => d.name)
      .join("g")
      .attr("class", "bar")
      .attr("transform", (d) => `translate(0,${y(d.name)})`)
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        const row = data.find((x) => x.name === d.name);
        if (row && onSelectBeer) onSelectBeer(row.id);
      })
      .on("mousemove", (event, d) =>
        showTip(event, `${d.name}<br/>Avg: ${d.value.toFixed(1)} (${d.reviewCount} reviews)`)
      )
      .on("mouseleave", hideTip);

    bars
      .append("rect")
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d.value))
      .attr("fill", (d) => (selectedBeerId && d.id === selectedBeerId ? "#d97706" : "url(#amberGradient)"))
      .attr("stroke", "#d6d3d1");

    bars
      .append("text")
      .attr("x", (d) => x(d.value) + 6)
      .attr("y", y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 12)
      .text((d) => d.value.toFixed(1));

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "amberGradient").attr("x1", "0").attr("x2", "1");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#b45309");
  }, [data, onSelectBeer, selectedBeerId]);

  return <div ref={ref} className="w-full" />;
}

/* --------------------------- Flavor Tags (stack) ------------------------ */

function FlavorTagsChart({ beers }) {
  const ref = useRef(null);

  const data = useMemo(() => {
    const pos = new Map();
    const neg = new Map();
    beers.forEach((b) => {
      Object.entries(b.positiveTagCounts || {}).forEach(([k, v]) => pos.set(k, (pos.get(k) || 0) + v));
      Object.entries(b.negativeTagCounts || {}).forEach(([k, v]) => neg.set(k, (neg.get(k) || 0) + v));
    });

    const tags = new Set([...pos.keys(), ...neg.keys()]);
    const rows = Array.from(tags, (t) => ({
      tag: t,
      positive: pos.get(t) || 0,
      negative: neg.get(t) || 0,
      total: (pos.get(t) || 0) + (neg.get(t) || 0),
    }))
      .sort((a, b) => d3.descending(a.total, b.total))
      .slice(0, 12);

    return rows;
  }, [beers]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const margin = { top: 20, right: 20, bottom: 40, left: 140 };
    const width = el.clientWidth || 640;
    const height = Math.max(260, data.length * 28 + margin.top + margin.bottom);

    const svg = d3.select(el).append("svg").attr("width", "100%").attr("height", height);
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const y = d3.scaleBand().domain(data.map((d) => d.tag)).range([0, plotH]).padding(0.2);
    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.total) || 1]).nice().range([0, plotW]);
    const color = d3.scaleOrdinal().domain(["positive", "negative"]).range(["#16a34a", "#dc2626"]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const stack = d3.stack().keys(["positive", "negative"]);
    const series = stack(data);

    g
      .selectAll("g.layer")
      .data(series)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("y", (d) => y(d.data.tag))
      .attr("x", (d) => x(d[0]))
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d[1]) - x(d[0]))
      .on("mousemove", (event, d) => {
        const key = event.currentTarget.parentNode.__data__.key;
        const val = d.data[key];
        showTip(event, `${d.data.tag}<br/>${key}: ${val}`);
      })
      .on("mouseleave", hideTip);

    g.append("g").attr("transform", `translate(0,${plotH})`).call(d3.axisBottom(x).ticks(5));
    g.append("g").call(d3.axisLeft(y));

    const legend = svg.append("g").attr("transform", `translate(${margin.left},10)`);
    ["positive", "negative"].forEach((k, i) => {
      const x0 = i * 120;
      legend.append("rect").attr("x", x0).attr("y", -8).attr("width", 12).attr("height", 12).attr("fill", color(k));
      legend.append("text").attr("x", x0 + 18).attr("y", 2).attr("font-size", 12).text(k === "positive" ? "Positive" : "Negative");
    });
  }, [data]);

  return (
    <div>
      <div className="text-xs text-gray-600 mb-2">Top flavor tags across selected beers.</div>
      <div ref={ref} />
    </div>
  );
}

/* ------------------------------ Radar (1 beer) -------------------------- */
/** Overlays Positive vs Negative tag counts for a selected beer.
 *  - Selects top K tags by total (pos+neg) so axes are stable
 *  - Radius is normalized to the max count across those tags
 */
function RadarTagsChart({ beer, topK = 8 }) {
  const ref = useRef(null);

  const data = useMemo(() => {
    if (!beer) return null;
    const pos = beer.positiveTagCounts || {};
    const neg = beer.negativeTagCounts || {};
    const tags = Array.from(new Set([...Object.keys(pos), ...Object.keys(neg)]));
    const rows = tags
      .map((t) => ({
        tag: t,
        positive: pos[t] || 0,
        negative: neg[t] || 0,
        total: (pos[t] || 0) + (neg[t] || 0),
      }))
      .sort((a, b) => d3.descending(a.total, b.total))
      .slice(0, topK);

    const maxVal = d3.max(rows, (d) => Math.max(d.positive, d.negative)) || 1;
    return {
      axes: rows.map((d) => d.tag),
      posValues: rows.map((d) => d.positive / maxVal),
      negValues: rows.map((d) => d.negative / maxVal),
      raw: rows,
      maxVal,
    };
  }, [beer, topK]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !data) return;
    el.innerHTML = "";

    const size = Math.min(el.clientWidth || 420, 420);
    const margin = 40;
    const radius = (size - margin * 2) / 2;
    const center = { x: size / 2, y: size / 2 };

    const svg = d3.select(el).append("svg").attr("width", "100%").attr("height", size);

    const angle = (i) => (Math.PI * 2 * i) / data.axes.length;
    const r = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    // grid levels
    const levels = 4;
    for (let l = 1; l <= levels; l++) {
      const g = svg.append("g").attr("transform", `translate(${center.x},${center.y})`);
      const path = d3.path();
      for (let i = 0; i < data.axes.length; i++) {
        const a = angle(i);
        const rr = r(l / levels);
        const x = Math.cos(a - Math.PI / 2) * rr;
        const y = Math.sin(a - Math.PI / 2) * rr;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
      g.append("path").attr("d", path.toString()).attr("fill", "none").attr("stroke", "#e5e7eb");
    }

    // axes + labels
    data.axes.forEach((label, i) => {
      const a = angle(i);
      const x = center.x + Math.cos(a - Math.PI / 2) * radius;
      const y = center.y + Math.sin(a - Math.PI / 2) * radius;

      svg
        .append("line")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#e5e7eb");

      const lx = center.x + Math.cos(a - Math.PI / 2) * (radius + 14);
      const ly = center.y + Math.sin(a - Math.PI / 2) * (radius + 14);
      svg
        .append("text")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", x < center.x ? "end" : x > center.x ? "start" : "middle")
        .attr("dominant-baseline", y < center.y ? "auto" : "hanging")
        .attr("font-size", 12)
        .text(label);
    });

    const polygon = (vals) => {
      const path = d3.path();
      vals.forEach((v, i) => {
        const a = angle(i);
        const rr = r(v);
        const x = center.x + Math.cos(a - Math.PI / 2) * rr;
        const y = center.y + Math.sin(a - Math.PI / 2) * rr;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      path.closePath();
      return path.toString();
    };

    // Positive polygon
    svg
      .append("path")
      .attr("d", polygon(data.posValues))
      .attr("fill", "#16a34a22")
      .attr("stroke", "#16a34a")
      .attr("stroke-width", 2)
      .on("mousemove", (e) => showTip(e, "Positive tag intensity (normalized)"))
      .on("mouseleave", hideTip);

    // Negative polygon
    svg
      .append("path")
      .attr("d", polygon(data.negValues))
      .attr("fill", "#dc262622")
      .attr("stroke", "#dc2626")
      .attr("stroke-width", 2)
      .on("mousemove", (e) => showTip(e, "Negative tag intensity (normalized)"))
      .on("mouseleave", hideTip);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${10},${10})`);
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", "#16a34a");
    legend.append("text").attr("x", 18).attr("y", 10).attr("font-size", 12).text("Positive");
    legend.append("rect").attr("x", 90).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", "#dc2626");
    legend.append("text").attr("x", 108).attr("y", 10).attr("font-size", 12).text("Negative");
  }, [data]);

  if (!beer) return <div className="text-gray-600">No beer selected.</div>;

  return (
    <div>
      <div className="text-sm text-amber-900 font-semibold mb-1">
        {beer.name} {beer.style ? `• ${beer.style}` : ""} — Tag balance
      </div>
      <div ref={ref} />
    </div>
  );
}

/* ----------------------------- Scatter Matrix --------------------------- */
/** Pair-plot for ABV, IBU, Avg Rating
 *  - Lower triangle: scatter plots (size by reviewCount, color by style)
 *  - Diagonal: histogram of each variable
 */
function ScatterMatrix({ beers }) {
  const ref = useRef(null);

  const vars = useMemo(
    () => [
      { key: "abv", label: "ABV", accessor: (b) => +b.abv || 0 },
      { key: "ibu", label: "IBU", accessor: (b) => +b.ibu || 0 },
      { key: "avgRating", label: "Avg Rating", accessor: (b) => Math.max(0, Math.min(5, +b.avgRating || 0)) },
    ],
    []
  );

  const data = useMemo(() => {
    // only include rows with at least one numeric var present
    return beers
      .map((b) => ({
        beerId: b.beerId,
        name: b.name || "Unnamed",
        style: b.style || "—",
        reviewCount: +b.reviewCount || 0,
        abv: +b.abv || 0,
        ibu: +b.ibu || 0,
        avgRating: Math.max(0, Math.min(5, +b.avgRating || 0)),
      }))
      .filter((d) => !Number.isNaN(d.abv) || !Number.isNaN(d.ibu) || !Number.isNaN(d.avgRating));
  }, [beers]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const n = vars.length;
    const size = 140; // per cell
    const padding = 36;
    const width = n * size + padding * 2;
    const height = n * size + padding * 2;

    const svg = d3.select(el).append("svg").attr("width", "100%").attr("height", height);

    // scales per variable
    const scales = new Map();
    vars.forEach((v, i) => {
      const domain = d3.extent(data, (d) => d[v.key]);
      const x = d3.scaleLinear().domain(domain[0] === domain[1] ? [0, domain[1] || 1] : domain).nice().range([0, size - 20]);
      scales.set(v.key, x);
    });

    // color & size
    const styles = Array.from(new Set(data.map((d) => d.style)));
    const color = d3.scaleOrdinal(styles, d3.schemeTableau10);
    const sizeScale = d3.scaleSqrt().domain(d3.extent(data, (d) => d.reviewCount)).range([3, 12]);

    // cells
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const g = svg
          .append("g")
          .attr("transform", `translate(${padding + col * size},${padding + row * size})`);

        const vx = vars[col];
        const vy = vars[row];

        // axes (only bottom/left for readability)
        if (row === n - 1) {
          g.append("g")
            .attr("transform", `translate(10,${size - 20})`)
            .call(d3.axisBottom(scales.get(vx.key)).ticks(4).tickSizeOuter(0));
        }
        if (col === 0) {
          g.append("g").attr("transform", `translate(10,0)`).call(d3.axisLeft(scales.get(vy.key)).ticks(4).tickSizeOuter(0));
        }

        // diagonal: histogram
        if (row === col) {
          const x = scales.get(vx.key);
          const histogram = d3
            .histogram()
            .domain(x.domain())
            .thresholds(10)
            .value((d) => d[vx.key]);
          const bins = histogram(data);
          const y = d3.scaleLinear().domain([0, d3.max(bins, (b) => b.length) || 1]).range([size - 20, 10]);

          g
            .selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x", (d) => 10 + x(d.x0))
            .attr("y", (d) => y(d.length))
            .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", (d) => (size - 20) - y(d.length))
            .attr("fill", "#eab30855")
            .attr("stroke", "#eab308");

          g
            .append("text")
            .attr("x", size / 2)
            .attr("y", 12)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .text(vx.label);
          continue;
        }

        // lower triangle: scatter; upper left empty for clarity
        if (row > col) {
          const x = scales.get(vx.key);
          const y = scales.get(vy.key);

          // frame
          g.append("rect").attr("x", 10).attr("y", 0).attr("width", size - 20).attr("height", size - 20).attr("fill", "none").attr("stroke", "#e5e7eb");

          g
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => 10 + x(d[vx.key]))
            .attr("cy", (d) => y(d[vy.key]))
            .attr("r", (d) => sizeScale(d.reviewCount || 0))
            .attr("fill", (d) => color(d.style))
            .attr("opacity", 0.85)
            .on("mousemove", (event, d) =>
              showTip(
                event,
                `<b>${d.name}</b><br/>Style: ${d.style}<br/>ABV: ${d.abv}<br/>IBU: ${d.ibu}<br/>Avg: ${d.avgRating.toFixed(
                  1
                )}<br/>Reviews: ${d.reviewCount}`
              )
            )
            .on("mouseleave", hideTip);
        }
      }
    }

    // legend
    const leg = svg.append("g").attr("transform", `translate(${padding},${height - 10})`);
    styles.forEach((s, i) => {
      const x = i * 130;
      leg.append("circle").attr("cx", x).attr("cy", -6).attr("r", 6).attr("fill", color(s));
      leg.append("text").attr("x", x + 10).attr("y", -2).attr("font-size", 12).text(s);
    });
  }, [data, vars]);

  return (
    <div className="overflow-x-auto">
      <div ref={ref} style={{ minWidth: 480 }} />
      <div className="text-xs text-gray-600 mt-2">
        • Diagonal shows distributions. • Circles sized by review count, colored by style.
      </div>
    </div>
  );
}

/* ----------------------------- Tooltip utils ---------------------------- */

const tipDiv = (() => {
  if (typeof document === "undefined") return null;
  let t = document.getElementById("d3-tip");
  if (!t) {
    t = document.createElement("div");
    t.id = "d3-tip";
    t.style.position = "fixed";
    t.style.pointerEvents = "none";
    t.style.zIndex = 9999;
    t.style.background = "rgba(0,0,0,0.85)";
    t.style.color = "#fff";
    t.style.padding = "6px 8px";
    t.style.borderRadius = "8px";
    t.style.fontSize = "12px";
    t.style.opacity = "0";
    document.body.appendChild(t);
  }
  return t;
})();

function showTip(event, html) {
  if (!tipDiv) return;
  tipDiv.innerHTML = html;
  tipDiv.style.left = event.clientX + 12 + "px";
  tipDiv.style.top = event.clientY + 12 + "px";
  tipDiv.style.opacity = "1";
}
function hideTip() {
  if (!tipDiv) return;
  tipDiv.style.opacity = "0";
}
