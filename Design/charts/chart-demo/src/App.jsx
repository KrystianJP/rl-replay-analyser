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

const barColors = ["#f0de7aff", "#83dae9ff", "#f87171"];
const barColors2 = ["#a59436ff", "#348796ff", "#943131ff"];
const barColors3 = ["#504509ff", "#0f4852ff", "#631c1cff"];

const pieChartColours = ["#f0de7aff", "#a59436ff", "#665a15ff"];

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
      </div>
    </div>
  );
}
