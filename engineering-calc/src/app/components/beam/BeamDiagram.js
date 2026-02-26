"use client";

import { useMemo, useState } from "react";

function Diagram({
  title,
  data,
  valueKey,
  color,
  width,
  height,
  renderGrid,
  formatValue,
  units,
  L,
  showMax,
}) {
  const [hover, setHover] = useState(null); // { xPx, xVal, yPx, val }

  const maxAbs = (arr) => Math.max(...arr.map((v) => Math.abs(v)), 1);
  const maxVal = maxAbs(data.map((p) => p[valueKey]));

  const sx = width / data[data.length - 1].x; // last x = L
  const sy = height / 2 / maxVal;
  // Find maximum absolute value point for this diagram (e.g., Mx max)
  const maxPoint = data.reduce((best, p) => {
    if (!best) return p;
    return Math.abs(p[valueKey]) > Math.abs(best[valueKey]) ? p : best;
  }, null);

  const maxPx = maxPoint.x * sx;
  const maxPy = height / 2 - maxPoint[valueKey] * sy;

  const buildPath = () =>
    data
      .map((p, i) => {
        const px = p.x * sx;
        const py = height / 2 - p[valueKey] * sy;
        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      })
      .join(" ");

  const buildFillPath = () => {
    const top = buildPath();
    return `${top} L ${width} ${height / 2} L 0 ${height / 2} Z`;
  };

  const path = buildPath();
  const fill = buildFillPath();

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPx = e.clientX - rect.left;

    // convert pixels → x value (beam coordinate)
    const L = data[data.length - 1].x;
    const xVal = (xPx / width) * L;

    // find nearest point in data
    const idx = Math.round((xVal / L) * (data.length - 1));
    const p = data[Math.max(0, Math.min(data.length - 1, idx))];

    const yPx = height / 2 - p[valueKey] * sy;

    setHover({
      xPx: p.x * sx,
      xVal: p.x,
      yPx,
      val: p[valueKey],
    });
  }

  function handleLeave() {
    setHover(null);
  }

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#ffffff",
        }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {renderGrid()}

        {/* zero axis */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* fill + line */}
        <path d={fill} fill={color} opacity="0.15" />
        <path d={path} stroke={color} fill="none" strokeWidth="2.5" />

        {/* hover cursor + tooltip */}
        {hover ? (
          <>
            {/* vertical cursor line */}
            <line
              x1={hover.xPx}
              y1={0}
              x2={hover.xPx}
              y2={height}
              stroke="#64748b"
              strokeDasharray="4 4"
            />

            {/* point dot */}
            <circle cx={hover.xPx} cy={hover.yPx} r="4" fill={color} />

            {/* tooltip box */}
            <g
              transform={`translate(${Math.min(hover.xPx + 10, width - 180)}, ${Math.max(hover.yPx - 35, 10)})`}
            >
              <rect
                width="170"
                height="44"
                rx="8"
                fill="#0f172a"
                opacity="0.92"
              />
              <text x="10" y="18" fill="#fff" fontSize="12">
                x = {hover.xVal.toFixed(3)}
              </text>
              <text x="10" y="34" fill="#fff" fontSize="12">
                {valueKey === "dx" ? "δmax" : `${valueKey}max`} ={" "}
                {formatValue(maxPoint[valueKey])}
              </text>
            </g>
          </>
        ) : null}
        {/* x-axis labels */}
        <text x="0" y={height - 8} fill="#475569" fontSize="12">
          0
        </text>

        <text x={width / 2 - 10} y={height - 8} fill="#475569" fontSize="12">
          {(L / 2).toFixed(2)}
        </text>

        <text x={width - 30} y={height - 8} fill="#475569" fontSize="12">
          {L.toFixed(2)}
        </text>

        {/* x-axis caption */}
        <text x={width / 2 - 55} y={height - 26} fill="#64748b" fontSize="12">
          Distance x
        </text>

        {/* units top-right */}
        <text x={width - 55} y="18" fill="#64748b" fontSize="12">
          {units}
        </text>
        {/* max marker */}
        {showMax && maxPoint ? (
          <>
            <circle cx={maxPx} cy={maxPy} r="5" fill={color} />
            <g
              transform={`translate(${Math.min(maxPx + 10, width - 220)}, ${Math.max(maxPy - 30, 10)})`}
            >
              <rect
                width="210"
                height="44"
                rx="8"
                fill="#0f172a"
                opacity="0.92"
              />
              <text x="10" y="18" fill="#fff" fontSize="12">
                Max at x = {maxPoint.x.toFixed(3)}
              </text>
              <text x="10" y="34" fill="#fff" fontSize="12">
                {valueKey === "dx" ? "δmax" : `${valueKey}max`} =={" "}
                {formatValue(maxPoint[valueKey])}
              </text>
            </g>
          </>
        ) : null}
      </svg>
    </div>
  );
}

export default function BeamDiagram({ L, calculateAtX }) {
  const width = 800;
  const height = 260;
  const steps = 80;

  const data = useMemo(() => {
    if (!L || typeof calculateAtX !== "function") return [];

    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const x = (L * i) / steps;
      const res = calculateAtX(x);

      if (res && typeof res.Vx === "number" && typeof res.Mx === "number") {
        pts.push({
          x,
          Vx: res.Vx,
          Mx: res.Mx,
          dx: typeof res.dx === "number" ? res.dx : 0,
        });
      }
    }
    return pts;
  }, [L, calculateAtX]);

  if (!data.length) return null;

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      lines.push(
        <line
          key={"v" + i}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#f1f5f9"
        />,
      );
    }
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      lines.push(
        <line key={"h" + i} x1={0} y1={y} x2={width} y2={y} stroke="#f1f5f9" />,
      );
    }
    return lines;
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Diagram
        title="Shear Force Diagram"
        data={data}
        valueKey="Vx"
        color="#2563eb"
        width={width}
        height={height}
        renderGrid={renderGrid}
        formatValue={(v) => v.toFixed(3)}
        units="kN"
        L={L}
        showMax={false}
      />

      <Diagram
        title="Bending Moment Diagram"
        data={data}
        valueKey="Mx"
        color="#dc2626"
        width={width}
        height={height}
        renderGrid={renderGrid}
        formatValue={(v) => v.toFixed(3)}
        units="kN·m"
        L={L}
        showMax={true}
      />
      <Diagram
        title="Deflection Diagram"
        data={data}
        valueKey="dx"
        color="#16a34a"
        width={width}
        height={height}
        renderGrid={renderGrid}
        formatValue={(v) => (v * 1000).toFixed(3)} // ✅ convert m -> mm
        units="mm" // ✅ show mm
        L={L}
        showMax={true} // ✅ mark max deflection
      />
    </div>
  );
}
