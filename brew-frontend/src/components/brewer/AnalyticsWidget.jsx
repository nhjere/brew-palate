import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

export default function AnalyticsWidget({ beers = [] }) {
  const [styleFilter, setStyleFilter] = useState("All");
  const [selectedBeerId, setSelectedBeerId] = useState(null);

  const styles = useMemo(() => {
    const s = new Set(beers.map((b) => b.style).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [beers]);

  const filteredBeers = useMemo(() => {
    const base =
      styleFilter === "All" ? beers : beers.filter((b) => b.style === styleFilter);
    return selectedBeerId ? base.filter((b) => b.beerId === selectedBeerId) : base;
  }, [beers, styleFilter, selectedBeerId]);

  return (
    <div className="w-full space-y-6">
      {/* Avg Ratings Section */}
      <section className="w-full p-4 bg-white border border-[#E0D4C2] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-extrabold text-[#3C547A]">
            Average Ratings
          </h4>

          {/* Filter by Style – now top-right of this section */}
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm text-[#6E7F99] mr-3 ">
              Filter by Style
            </label>
            <select
              className="px-2 py-1.5 rounded-lg  text-xs md:text-sm"
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
                className="text-xs text-[#3C547A] underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-[#6E7F99] mb-3">
          Average rating per beer. Click a bar to highlight a specific beer.
        </p>

        <AvgRatingsChart
          beers={filteredBeers}
          onSelectBeer={(id) =>
            setSelectedBeerId((prev) => (prev === id ? null : id))
          }
          selectedBeerId={selectedBeerId}
        />
      </section>

      {/* Flavor Tags Section */}
      <section className="w-full border border-[#E0D4C2] p-4 bg-white shadow-sm">
        <h4 className="text-lg font-extrabold text-[#3C547A] mb-2">
          Flavor Tags
        </h4>
        <p className="text-xs text-[#6E7F99] mb-3">
          Top positive and negative flavor tags across the selected beers.
        </p>
        <FlavorTagsChart beers={filteredBeers} />
      </section>
    </div>
  );
}

/* ----------------------------- Avg Ratings ------------------------------ */

function AvgRatingsChart({ beers, onSelectBeer, selectedBeerId }) {
  const ref = useRef(null);

  const data = useMemo(
    () =>
      beers
        .map((b) => ({
          id: b.beerId,
          name: b.name || "Unnamed",
          value: Math.max(0, Math.min(5, b.avgRating || 0)),
          reviewCount: b.reviewCount || 0,
        }))
        .sort((a, b) => d3.descending(a.value, b.value)),
    [beers]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const margin = { top: 20, right: 20, bottom: 40, left: 140 };
    const width = el.clientWidth || 640;
    const height = Math.max(240, data.length * 36 + margin.top + margin.bottom);

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height);

    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, 5]).range([0, plotW]);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, plotH])
      .padding(0.18);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${plotH})`)
      .call(d3.axisBottom(x).ticks(5))
      .call((axis) =>
        axis
          .selectAll("text")
          .attr("font-size", 11)
          .attr("fill", "#6E7F99")
      );

    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .call((axis) =>
        axis
          .selectAll("text")
          .attr("font-size", 11)
          .attr("fill", "#3F4C5F")
      );

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
        showTip(
          event,
          `${d.name}<br/>Avg: ${d.value.toFixed(1)} (${d.reviewCount} reviews)`
        )
      )
      .on("mouseleave", hideTip);

    bars
      .append("rect")
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d.value))
      .attr("fill", (d) =>
        selectedBeerId && d.id === selectedBeerId ? "#3C547A" : "url(#blueGradient)"
      )
      .attr("stroke", "#E0D4C2");

    bars
      .append("text")
      .attr("x", (d) => x(d.value) + 6)
      .attr("y", y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 11)
      .attr("fill", "#3F4C5F")
      .text((d) => d.value.toFixed(1));

    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "blueGradient")
      .attr("x1", "0")
      .attr("x2", "1");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#A7B7D9");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#3C547A");
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
      Object.entries(b.positiveTagCounts || {}).forEach(([k, v]) =>
        pos.set(k, (pos.get(k) || 0) + v)
      );
      Object.entries(b.negativeTagCounts || {}).forEach(([k, v]) =>
        neg.set(k, (neg.get(k) || 0) + v)
      );
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

    const margin = { top: 28, right: 20, bottom: 40, left: 140 };
    const width = el.clientWidth || 640;
    const height = Math.max(260, data.length * 28 + margin.top + margin.bottom);

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height);

    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.tag))
      .range([0, plotH])
      .padding(0.2);
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) || 1])
      .nice()
      .range([0, plotW]);

    const color = d3
      .scaleOrdinal()
      .domain(["positive", "negative"])
      .range(["#16a34a", "#dc2626"]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const stack = d3.stack().keys(["positive", "negative"]);
    const series = stack(data);

    g.append("g")
      .selectAll("g.layer")
      .data(series)
      .join("g")
      .attr("class", "layer")
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

    g.append("g")
      .attr("transform", `translate(0,${plotH})`)
      .call(d3.axisBottom(x).ticks(5))
      .call((axis) =>
        axis
          .selectAll("text")
          .attr("font-size", 11)
          .attr("fill", "#6E7F99")
      );

    g.append("g")
      .call(d3.axisLeft(y))
      .call((axis) =>
        axis
          .selectAll("text")
          .attr("font-size", 11)
          .attr("fill", "#3F4C5F")
      );

    const legend = svg.append("g").attr("transform", `translate(${margin.left},18)`);
    ["positive", "negative"].forEach((k, i) => {
      const x0 = i * 140;
      legend
        .append("rect")
        .attr("x", x0)
        .attr("y", -12)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(k));
      legend
        .append("text")
        .attr("x", x0 + 18)
        .attr("y", -2)
        .attr("font-size", 12)
        .attr("fill", "#3F4C5F")
        .text(k === "positive" ? "Positive Tags" : "Negative Tags");
    });
  }, [data]);

  return <div ref={ref} />;
}

/* ------------------------------- Tooltips ------------------------------- */

const tipDiv = (() => {
  if (typeof document === "undefined") return null;
  let t = document.getElementById("d3-tip");
  if (!t) {
    t = document.createElement("div");
    t.id = "d3-tip";
    t.style.position = "fixed";
    t.style.pointerEvents = "none";
    t.style.zIndex = 9999;
    t.style.background = "rgba(15,23,42,0.92)";
    t.style.color = "#fff";
    t.style.padding = "6px 8px";
    t.style.borderRadius = "8px";
    t.style.fontSize = "12px";
    t.style.opacity = "0";
    t.style.transition = "opacity 120ms ease-out";
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
