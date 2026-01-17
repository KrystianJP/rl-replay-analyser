import CustomBarChart from "./CustomBarChart";
import CustomStackChart from "./CustomStackChart";
import CustomPieChart from "./CustomPieChart";
import { useState } from "react";

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

const CATEGORY_CHARTS = {
  boost: [
    { title: "Boost Used per minute", chart: "bar-chart" },
    { title: "Total Wasted Boost", chart: "bar-chart" },
    { title: "Small Boost Pads Collected", chart: "bar-chart" },
    { title: "Large Boost Pads Collected", chart: "bar-chart" },
    { title: "Time at 0 Boost", chart: "bar-chart" },
    { title: "Time at Low Boost", chart: "bar-chart" },
    { title: "Time at Full Boost", chart: "bar-chart" },
  ],
  movement: [
    { title: "Average Speed", chart: "bar-chart" },
    { title: "Time Supersonic Speed", chart: "bar-chart" },
    { title: "Time at different Heights", chart: "stack-chart" },
  ],
  positioning: [
    { title: "Position Relative to Teammates", chart: "pie-chart" },
    { title: "Distance from Ball", chart: "pie-chart" },
    { title: "Behind/Ahead of Ball", chart: "pie-chart" },
    { title: "General Position on Field", chart: "stack-chart" },
  ],
  demos: [
    { title: "Demos Inflicted", chart: "bar-chart" },
    { title: "Demos Taken", chart: "bar-chart" },
    { title: "Large Boost Pads Stolen", chart: "bar-chart" },
  ],
  possession: [
    { title: "Team Possession", chart: "pie-chart" },
    { title: "Total Possession Time", chart: "bar-chart" },
    { title: "Average Possession Duration", chart: "bar-chart" },
  ],
};

function DataOverview() {
  const [category, setCategory] = useState<
    "boost" | "movement" | "positioning" | "demos" | "possession"
  >("boost");

  const renderChart = (title: string, chart: string) => {
    switch (chart) {
      case "bar-chart":
        return <CustomBarChart key={title} title={title} data={data} />;
      case "stack-chart":
        return <CustomStackChart key={title} title={title} data={data2} />;
      case "pie-chart":
        return <CustomPieChart key={title} title={title} data={data3} />;
    }
  };

  return (
    <section className="section alt" id="overview">
      <div className="container">
        <h2>
          Data Overview <span className="material-icons">arrow_drop_down</span>
        </h2>

        <div className="category-buttons">
          <button
            className={category === "boost" ? "active" : ""}
            onClick={() => setCategory("boost")}
          >
            Boost
          </button>
          <button
            className={category === "movement" ? "active" : ""}
            onClick={() => setCategory("movement")}
          >
            Movement
          </button>
          <button
            className={category === "positioning" ? "active" : ""}
            onClick={() => setCategory("positioning")}
          >
            Positioning
          </button>
          <button
            className={category === "demos" ? "active" : ""}
            onClick={() => setCategory("demos")}
          >
            Demos
          </button>
          <button
            className={category === "possession" ? "active" : ""}
            onClick={() => setCategory("possession")}
          >
            Possession
          </button>
        </div>

        <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>

        <div className="charts-container">
          {CATEGORY_CHARTS[category].map((chart) =>
            renderChart(chart.title, chart.chart),
          )}
        </div>
      </div>
    </section>
  );
}

export default DataOverview;
