import {
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
} from "recharts";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const COLOR_HIGH = [34, 197, 94];
const COLOR_MIDDLE = [194, 217, 248];
const COLOR_LOW = [239, 68, 68];

// function percentileColor(percentile: number) {
//   if (percentile <= 50) {
//     // red to gray
//     const ratio = percentile / 50;
//     const r = Math.round(
//       COLOR_LOW[0] + (COLOR_MIDDLE[0] - COLOR_LOW[0]) * ratio,
//     );
//     const g = Math.round(
//       COLOR_LOW[1] + (COLOR_MIDDLE[1] - COLOR_LOW[1]) * ratio,
//     );
//     const b = Math.round(
//       COLOR_LOW[2] + (COLOR_MIDDLE[2] - COLOR_LOW[2]) * ratio,
//     );
//     return `rgb(${r}, ${g}, ${b})`;
//   } else {
//     // gray to green
//     const ratio = (percentile - 50) / 50;
//     const r = Math.round(
//       COLOR_MIDDLE[0] + (COLOR_HIGH[0] - COLOR_MIDDLE[0]) * ratio,
//     );
//     const g = Math.round(
//       COLOR_MIDDLE[1] + (COLOR_HIGH[1] - COLOR_MIDDLE[1]) * ratio,
//     );
//     const b = Math.round(
//       COLOR_MIDDLE[2] + (COLOR_HIGH[2] - COLOR_MIDDLE[2]) * ratio,
//     );
//     return `rgb(${r}, ${g}, ${b})`;
//   }
// }

const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;

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
  const { x, y, payload, radius, textAnchor, percentiles } = props;
  const label = payload.value;

  let percentile;
  if (!percentiles) {
    percentile = 50;
  } else {
    const match = percentiles.find((item: any) => item.category === label);
    percentile = match?.You ?? 50;
  }

  let color;
  if (percentile <= 20) {
    color = `rgb(${COLOR_LOW[0]}, ${COLOR_LOW[1]}, ${COLOR_LOW[2]})`;
  } else if (percentile >= 80) {
    color = `rgb(${COLOR_HIGH[0]}, ${COLOR_HIGH[1]}, ${COLOR_HIGH[2]})`;
  } else {
    color = `rgb(${COLOR_MIDDLE[0]}, ${COLOR_MIDDLE[1]}, ${COLOR_MIDDLE[2]})`;
  }

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

function CustomRadarChart({ data, percentiles }: any) {
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

          <PolarAngleAxis
            dataKey="category"
            tick={<CustomTick percentiles={percentiles} />}
          />

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

          {/* <Legend wrapperStyle={{ fontFamily: "Arial, sans-serif" }} /> */}

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
