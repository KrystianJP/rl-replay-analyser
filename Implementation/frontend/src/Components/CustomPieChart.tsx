import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const pieChartColours = ["#f0de7aff", "#a59436ff", "#665a15ff"];

function CustomPieChart({ title, data }: any) {
  return (
    <div className="bar-chart-container">
      <h4 style={{ textAlign: "center", paddingBottom: "10px" }}>{title}</h4>
      <ResponsiveContainer height={350}>
        <PieChart id={title}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name }) => name}
            style={{ fontFamily: "Arial, sans-serif" }}
            animationDuration={500}
            animationBegin={100}
            animationEasing="ease-out"
          >
            {data.map((entry: any, index: any) => (
              <Cell key={entry.name} fill={pieChartColours[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#222",
              border: "none",
              borderRadius: "6px",
            }}
            formatter={(value) =>
              typeof value === "number" ? value.toFixed(1) + "%" : value
            }
            labelStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            itemStyle={{ color: "#fff", fontFamily: "Arial, sans-serif" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomPieChart;
