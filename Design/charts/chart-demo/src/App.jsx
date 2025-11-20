import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "A", value: 12 },
  { name: "B", value: 19 },
  { name: "C", value: 7 },
  { name: "D", value: 15 },
];

function App() {
  return (
    <div style={{ width: "700px", height: "400px" }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: "#8884d8", fontFamily: "Arial, sans-serif" }}
            label={{
              value: "Category",
              position: "insideBottom",
              fill: "white",
              dy: 10,
              fontFamily: "Arial, sans-serif",
            }}
            axisLine={{ stroke: "white", strokeWidth: 2 }}
          />
          <YAxis
            tick={{ fill: "#8884d8", fontFamily: "Arial, sans-serif" }}
            label={{
              value: "Value",
              angle: -90,
              position: "insideLeft",
              fill: "white",
              fontFamily: "Arial, sans-serif",
            }}
            axisLine={{ stroke: "white", strokeWidth: 2 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#222", border: "none" }}
            labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Bar
            dataKey="value"
            fill="#60a5fa"
            barSize={50}
            label={{
              position: "top",
              fill: "white",
              fontFamily: "Arial, sans-serif",
            }}
            radius={[5, 5, 0, 0]}
            activeFill="#000000ff"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
