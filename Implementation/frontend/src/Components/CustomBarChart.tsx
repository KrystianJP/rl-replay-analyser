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
/* eslint-disable  @typescript-eslint/no-explicit-any */

const barColors = ["#f0de7aff", "#83dae9ff", "#f87171"];

// position: outsideLeft not included in YAxis
function CustomBarChart({ title, data, dataKey }: any) {
  return (
    <div className="bar-chart-container">
      <h4 style={{ textAlign: "center", paddingBottom: "10px" }}>{title}</h4>
      <ResponsiveContainer height={350} className="chart">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
            // label={{
            //   value: "Boost Cons. Per Minute",
            //   angle: -90,
            //   fill: "white",
            //   fontFamily: "Arial, sans-serif",
            //   fontWeight: "bold",
            //   dx: -30,
            // }}
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
            formatter={(value) => typeof value === "number" && value.toFixed(1)}
          />
          <Bar dataKey={dataKey} barSize={120} radius={[5, 5, 0, 0]}>
            {data.map((entry: any, index: any) => (
              <Cell key={entry.name} fill={barColors[index]} />
            ))}
            <LabelList
              dataKey={dataKey}
              position="top"
              fill="white"
              fontFamily="Arial, sans-serif"
              formatter={(value) =>
                typeof value === "number" && value.toFixed(1)
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomBarChart;
