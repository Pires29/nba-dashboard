import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

const CustomXAxisTick = ({ x, y, payload }) => {
  const parts = payload.value?.split("\n") || [];
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={9}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {parts[0]}
      </text>
      <text
        x={0}
        y={0}
        dy={22}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={8}
        fontFamily="monospace"
      >
        {parts[1]}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, selectedStat }) => {
  if (!active || !payload?.length) return null;
  const stat =
    selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1).toLowerCase();
  return (
    <div className="bg-[#0D1828] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 shadow-xl">
      <p className="text-white font-bold">
        {stat}: <span className="text-orange-400">{payload[0]?.value}</span>
      </p>
      <p className="text-slate-400">{payload[0]?.payload?.date}</p>
      <p>vs {payload[0]?.payload?.opponent}</p>
      {payload[0]?.payload?.isHome != null && (
        <p className="text-slate-400">
          {payload[0]?.payload?.isHome ? "Home" : "Away"}
        </p>
      )}
      {payload[0]?.payload?.minutes && (
        <p className="text-slate-400">{payload[0]?.payload?.minutes} min</p>
      )}
    </div>
  );
};

const PlayerGraphChart = ({ points, selectedStat, betLine, yTicks }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={points}
        margin={{ top: 20, right: 4, left: -20, bottom: 0 }}
      >
        <XAxis
          dataKey="label"
          tick={<CustomXAxisTick />}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          ticks={yTicks}
          domain={[0, yTicks[yTicks.length - 1] || "auto"]}
        />
        <Tooltip
          content={<CustomTooltip selectedStat={selectedStat} />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        {betLine != null && (
          <ReferenceLine
            y={betLine}
            stroke="rgba(249,115,22,0.5)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
        <Bar dataKey={selectedStat} radius={[3, 3, 0, 0]} barSize={100}>
          {points.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                betLine != null && entry[selectedStat] >= betLine
                  ? "#22c55e"
                  : "#ef4444"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlayerGraphChart;
