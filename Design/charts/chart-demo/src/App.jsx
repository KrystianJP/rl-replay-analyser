import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import CustomLegend from "./CustomLegend";

const data = [
  { name: "You", BPM: 532 },
  { name: "Teammates", BPM: 350 },
  { name: "Opponents", BPM: 420 },
];

const data2 = [
  { name: "You", ground: 51, low: 38, high: 11 },
  { name: "Teammates", ground: 46, low: 48, high: 6 },
  { name: "Opponents", ground: 73, low: 25, high: 2 },
];

const data3 = [
  { name: "most back", value: 40 },
  { name: "between players", value: 27 },
  { name: "most forward", value: 33 },
];

const comparisonData = [
  {
    category: "Average speed",
    You: 66.65, // Normalized (0-100)
    You_Original: 66.65, // Raw Value
    RankAverage: 65, // Normalized (0-100)
    RankAverage_Original: 65, // Raw Value
    unit: "%",
    fullMark: 100,
  },
  {
    category: "Time supersonic",
    You: 80,
    You_Original: 80,
    RankAverage: 50,
    RankAverage_Original: 50,
    unit: "%",
    fullMark: 100,
  },
  {
    category: "Time on ground",
    You: 60,
    You_Original: 60,
    RankAverage: 55,
    RankAverage_Original: 55,
    unit: "%",
    fullMark: 100,
  },
  {
    category: "Time low in air",
    You: 90,
    You_Original: 90,
    RankAverage: 75,
    RankAverage_Original: 75,
    unit: "%",
    fullMark: 100,
  },
  {
    category: "Time high in air",
    You: 70,
    You_Original: 70,
    RankAverage: 65,
    RankAverage_Original: 65,
    unit: "%",
    fullMark: 100,
  },
];

const barColors = ["#f0de7aff", "#83dae9ff", "#f87171"];
const barColors2 = ["#a59436ff", "#348796ff", "#943131ff"];
const barColors3 = ["#504509ff", "#0f4852ff", "#631c1cff"];

const pieChartColours = ["#f0de7aff", "#a59436ff", "#665a15ff"];

const CustomTooltip = ({ active, payload, label }) => {
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
        <p style={{ color: "#FFC658" }}>{`You: ${yourScore} ${unit}`}</p>
        <p
          style={{ color: "#FF8042" }}
        >{`Rank Average: ${rankAvgScore} ${unit}`}</p>
      </div>
    );
  }
  return null;
};

export default function App() {
  return (
    <div>
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "400px",
          margin: "0 auto",
        }}
      >
        <h3
          style={{
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Boost Usage
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 20, left: 10, bottom: 20 }}
            barCategoryGap={0}
            barGap={0}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "#c2d9f8ff", fontFamily: "Arial, sans-serif" }}
              axisLine={{ stroke: "white", strokeWidth: 2 }}
            />
            <YAxis
              tick={{ fill: "#c2d9f8ff", fontFamily: "Arial, sans-serif" }}
              label={{
                value: "Boost Consumption Per Minute",
                angle: -90,
                position: "outsideLeft",
                fill: "white",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                dx: -30,
              }}
              axisLine={{ stroke: "white", strokeWidth: 2 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "none",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Bar
              dataKey="BPM"
              barSize={150}
              radius={[5, 5, 0, 0]}
              label={{
                position: "top",
                fill: "white",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={barColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "400px",
          margin: "0 auto",
        }}
      >
        <h3
          style={{
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            marginBottom: "10px",
            marginTop: "50px",
          }}
        >
          Height %
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data2}
            margin={{ top: 0, right: 20, left: 10, bottom: 20 }}
            barCategoryGap={0}
            barGap={0}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "#c2d9f8ff", fontFamily: "Arial, sans-serif" }}
              axisLine={{ stroke: "white", strokeWidth: 2 }}
            />
            <YAxis
              tick={{ fill: "#c2d9f8ff", fontFamily: "Arial, sans-serif" }}
              tickFormatter={(value) => value + "%"}
              axisLine={{ stroke: "white", strokeWidth: 2 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "none",
                borderRadius: "6px",
              }}
              formatter={(value) => value.toFixed(1) + "%"}
              labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Bar dataKey="ground" stackId="height" barSize={150}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={barColors[index]} />
              ))}
            </Bar>

            <Bar dataKey="low" stackId="height" barSize={150}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={barColors2[index]} />
              ))}
            </Bar>

            <Bar dataKey="high" stackId="height" barSize={150}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={barColors3[index]} />
              ))}
            </Bar>

            <Legend
              wrapperStyle={{ fontFamily: "Arial, sans-serif" }}
              content={<CustomLegend />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "400px",
          margin: "0 auto",
        }}
      >
        <h3
          style={{
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            marginBottom: "10px",
            marginTop: "50px",
          }}
        >
          Position Relative to Teammates
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data3}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name }) => name}
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={pieChartColours[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "none",
                borderRadius: "6px",
              }}
              formatter={(value) => value.toFixed(1) + "%"}
              labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <h3
          style={{
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            marginBottom: "10px",
            marginTop: "50px",
          }}
        >
          Movement
        </h3>
        <ResponsiveContainer>
          <RadarChart
            outerRadius={150}
            width={600}
            height={500}
            data={comparisonData}
          >
            <PolarGrid />

            <PolarAngleAxis
              dataKey="category"
              fontFamily="Arial"
              stroke="#c2d9f8ff"
            />

            <Radar
              name="You"
              dataKey="You"
              stroke="#FFC658"
              fill="#FFC658"
              fillOpacity={0.3}
              fullMark="fullMark"
            />

            <Radar
              name="Rank Average"
              dataKey="RankAverage"
              stroke="#FF8042"
              fill="#FF8042"
              fillOpacity={0.3}
              fullMark="fullMark"
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
        <div style={{ height: "50px" }}>&nbsp;</div>
      </div>
    </div>
  );
}
