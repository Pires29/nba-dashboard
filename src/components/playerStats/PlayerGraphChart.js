import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Line,
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
  const statPayload =
    payload.find((entry) => entry.dataKey === selectedStat) ?? payload[0];
  const minutesPayload =
    payload.find((entry) => entry.dataKey === "minutes") ?? null;
  const stat =
    selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1).toLowerCase();
  return (
    <div className="bg-[#0D1828] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 shadow-xl">
      <p className="text-white font-bold">
        {stat}: <span className="text-orange-400">{statPayload?.value}</span>
      </p>
      <p className="text-slate-400">{statPayload?.payload?.date}</p>
      <p>vs {statPayload?.payload?.opponent}</p>
      {statPayload?.payload?.isHome != null && (
        <p className="text-slate-400">
          {statPayload?.payload?.isHome ? "Home" : "Away"}
        </p>
      )}
      {minutesPayload?.value != null && (
        <p className="text-slate-400">{minutesPayload.value} min</p>
      )}
    </div>
  );
};

const PlayerGraphChart = ({
  points,
  selectedStat,
  betLine,
  yTicks,
  showMinutesLine = false,
}) => {
  const displayYTicks = (() => {
    if (!showMinutesLine) return yTicks;
    const highestTick = yTicks[yTicks.length - 1] ?? 0;
    const highestMinutes = points.reduce(
      (highest, point) => Math.max(highest, Number(point.minutes) || 0),
      0,
    );
    const max = Math.max(highestTick, highestMinutes);
    if (max <= highestTick) return yTicks;

    const step = max <= 10 ? 2 : max <= 30 ? 5 : 10;
    const topTick = (Math.ceil(max / step) + 1) * step;
    const ticks = [];
    for (let tick = 0; tick <= topTick; tick += step) ticks.push(tick);
    return ticks;
  })();

  return (
    <div className="h-full w-full [&_*:focus]:!outline-none [&_*:focus-visible]:!outline-none [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_.recharts-surface_*]:!outline-none">
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <BarChart
        accessibilityLayer
        data={points}
        margin={{ top: 20, right: 8, left: -20, bottom: 28 }}
      >
        <XAxis
          dataKey="label"
          tick={<CustomXAxisTick />}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="stats"
          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          ticks={displayYTicks}
          domain={[0, displayYTicks[displayYTicks.length - 1] || "auto"]}
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
        <Bar
          yAxisId="stats"
          dataKey={selectedStat}
          radius={[3, 3, 0, 0]}
          maxBarSize={90}
          isAnimationActive={false}
        >
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
        {showMinutesLine && (
          <Line
            yAxisId="stats"
            type="monotone"
            dataKey="minutes"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "#0D1828", stroke: "#38bdf8", strokeWidth: 1.5 }}
            activeDot={{ r: 4, fill: "#38bdf8", stroke: "#0D1828", strokeWidth: 2 }}
            connectNulls
            isAnimationActive={false}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default PlayerGraphChart;
