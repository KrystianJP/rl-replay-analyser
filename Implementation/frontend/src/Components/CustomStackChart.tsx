import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import CustomLegend from "./CustomLegend";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const barColors = ["#f0de7aff", "#83dae9ff", "#f87171"];
const barColors2 = ["#a59436ff", "#348796ff", "#943131ff"];
const barColors3 = ["#504509ff", "#0f4852ff", "#631c1cff"];

function CustomStackChart({ title, data, dataKeys }: any) {
  return (
    <div className="bar-chart-container">
      <h4 style={{ textAlign: "center", paddingBottom: "10px" }}>{title}</h4>
      <ResponsiveContainer height={350}>
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
            // tickFormatter={(value) => value + " %"}
            axisLine={{ stroke: "white", strokeWidth: 2 }}
            domain={[0, 100]}
            tickCount={0}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#222",
              border: "none",
              borderRadius: "6px",
            }}
            formatter={(value) =>
              typeof value === "number" ? value.toFixed(1) : value
            }
            labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Bar dataKey={dataKeys[0]} stackId="height" barSize={150}>
            {data.map((entry: any, index: any) => (
              <Cell key={entry.name} fill={barColors[index]} />
            ))}
          </Bar>

          <Bar dataKey={dataKeys[1]} stackId="height" barSize={150}>
            {data.map((entry: any, index: any) => (
              <Cell key={entry.name} fill={barColors2[index]} />
            ))}
          </Bar>

          <Bar
            dataKey={dataKeys.length > 2 ? dataKeys[2] : ""}
            stackId="height"
            barSize={150}
          >
            {data.map((entry: any, index: any) => (
              <Cell key={entry.name} fill={barColors3[index]} />
            ))}
          </Bar>

          <Legend
            wrapperStyle={{ fontFamily: "Arial, sans-serif" }}
            content={<CustomLegend dataKeys={dataKeys} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomStackChart;
