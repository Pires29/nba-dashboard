"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const CustomXAxisTick = ({ x, y, payload }) => {
  const parts = payload.value?.split("\n") || [];
  return (
    <g className="max-[400px]:hidden" transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="monospace" fontWeight="bold">
        {parts[0]}
      </text>
      <text x={0} y={0} dy={22} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="monospace">
        {parts[1]}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, statMeta, selectedStat }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  const raw = entry?.[selectedStat];
  const made = entry?.[statMeta?.madeKey];
  const attempted = entry?.[statMeta?.attemptedKey];
  const display = raw == null ? "—" : statMeta?.isPercent
    ? (raw * 100).toFixed(1) + "%"
    : (raw?.toFixed(0) ?? "—");

  return (
    <div className="bg-[#0D1828] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 shadow-xl">
      <p className="text-white font-bold">
        {statMeta?.label}: <span className="text-slate-200">{display}</span>
      </p>
      {statMeta?.isPercent && made != null && attempted != null && (
        <p>{made}/{attempted} <span className="text-slate-400">{statMeta.label.replace("%", "")}</span></p>
      )}
      {raw == null && (
        <p>{attempted === 0 ? "No attempts" : "No data"}</p>
      )}
      <p className="text-slate-400">{entry?.date}</p>
      <p>vs {entry?.opponent}</p>
    </div>
  );
};

const BarValueLabel = ({ x, y, width, value, isPercent }) => {
  if (x == null || y == null || width == null) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 5}
      textAnchor="middle"
      fill="#94a3b8"
      fontSize={9}
      fontFamily="monospace"
    >
      {value == null ? "—" : isPercent ? (value * 100).toFixed(0) + "%" : value}
    </text>
  );
};

const PlayerContextGraphChart = ({ dataFiltered, selectedStat, statMeta, yTicks }) => {
  // Keep missing values intact for labels/tooltips; give every game a plot position.
  const chartData = dataFiltered.map((entry) => ({
    ...entry,
    plotValue: entry[selectedStat] ?? 0,
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      minHeight={0}
      initialDimension={{ width: 1, height: 1 }}
    >
      <BarChart
        className="!outline-none [&_*:focus]:!outline-none [&_*:focus-visible]:!outline-none"
        data={chartData}
        margin={{ top: 16, right: 4, left: -20, bottom: 24 }}
      >
        <XAxis dataKey="label" tick={<CustomXAxisTick />} tickLine={false} axisLine={false} interval={0} />
        <YAxis
          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          ticks={yTicks}
          domain={[0, yTicks[yTicks.length - 1] ?? "auto"]}
          tickFormatter={(v) => (statMeta?.isPercent ? v * 100 + "%" : v)}
        />
        <Tooltip content={<CustomTooltip statMeta={statMeta} selectedStat={selectedStat} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="plotValue" radius={[3, 3, 0, 0]} barSize={20}>
          {dataFiltered.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry[selectedStat] == null ? "#1e293b" : "#475569"} />
          ))}
          <LabelList
            dataKey={selectedStat}
            content={<BarValueLabel isPercent={statMeta?.isPercent} />}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlayerContextGraphChart;
