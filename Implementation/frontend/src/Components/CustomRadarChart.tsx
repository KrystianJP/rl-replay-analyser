import {
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  PolarRadiusAxis,
} from "recharts";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    // payload[0].payload holds the entire data object for the hovered category
    const data = payload[0].payload;

    // We can extract the values for clean display
    const yourScore = data.You_Original;
    const rankAvgScore = data.RankAverage_Original;
    const unit = data.unit;

    return (
      <div
        style={{
          backgroundColor: "#222",
          padding: "2px 10px",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p className="label">{label}</p>
        <p
          style={{ color: "#FFC658" }}
        >{`You: ${yourScore.toFixed(2)} ${unit}`}</p>
        <p
          style={{ color: "#ff5e42ff" }}
        >{`Rank Average: ${rankAvgScore.toFixed(2)} ${unit}`}</p>
      </div>
    );
  }
  return null;
};

const CustomTick = (props: any) => {
  const { x, y, payload, radius, textAnchor } = props;
  const label = payload.value;

  const color = label === "" ? "#f73d3dff" : "#c2d9f8ff";

  return (
    <g>
      <text
        radius={radius}
        fill={color}
        x={x}
        y={y + 5}
        textAnchor={textAnchor}
        fontFamily="Arial"
        fontSize="14"
      >
        <tspan x={x} dy="0em">
          {payload.value}
        </tspan>
      </text>
    </g>
  );
};

function CustomRadarChart({ data }: any) {
  return (
    <div className="spider-chart-container">
      <ResponsiveContainer height={360}>
        <RadarChart
          outerRadius={150}
          width={500}
          height={400}
          margin={{ top: 0, left: 0, right: 0, bottom: -15 }}
          data={data}
        >
          <PolarGrid />

          <PolarAngleAxis dataKey="category" tick={<CustomTick />} />

          <PolarRadiusAxis tick={false} axisLine={false} />

          <Radar
            name="You"
            dataKey="You"
            stroke="#FFC658"
            fill="#FFC658"
            fillOpacity={0.3}
          />

          <Radar
            name="Rank Average"
            dataKey="RankAverage"
            stroke="#ff5e42ff"
            fill="#ff5e42ff"
            fillOpacity={0.3}
          />

          <Legend wrapperStyle={{ fontFamily: "Arial, sans-serif" }} />

          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: "#222",
              border: "none",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomRadarChart;
