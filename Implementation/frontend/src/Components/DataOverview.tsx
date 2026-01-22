import CustomBarChart from "./CustomBarChart";
import CustomStackChart from "./CustomStackChart";
import CustomPieChart from "./CustomPieChart";
import { useState, useEffect, useMemo } from "react";
/* eslint-disable  @typescript-eslint/no-explicit-any */

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

function DataOverview({ replayData, player }: any) {
  const [category, setCategory] = useState<
    "boost" | "movement" | "positioning" | "demos" | "possession"
  >("boost");

  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!replayData || replayData.length === 0) return;
    const numReplays = replayData.length;

    const data = {
      boost: {
        bpm: [
          { name: "You", BPM: 0 },
          { name: "Teammates", BPM: 0 },
          { name: "Opponents", BPM: 0 },
        ],
        smallPads: [
          { name: "You", "Small pads": 0 },
          { name: "Teammates", "Small pads": 0 },
          { name: "Opponents", "Small pads": 0 },
        ],
        largePads: [
          { name: "You", "Large pads": 0 },
          { name: "Teammates", "Large pads": 0 },
          { name: "Opponents", "Large pads": 0 },
        ],
        timeAt0: [
          { name: "You", "Time at 0": 0 },
          { name: "Teammates", "Time at 0": 0 },
          { name: "Opponents", "Time at 0": 0 },
        ],
        timeAtLow: [
          { name: "You", "Time at Low": 0 },
          { name: "Teammates", "Time at Low": 0 },
          { name: "Opponents", "Time at Low": 0 },
        ],
        timeAtFull: [
          { name: "You", "Time at Full": 0 },
          { name: "Teammates", "Time at Full": 0 },
          { name: "Opponents", "Time at Full": 0 },
        ],
      },
      movement: [],
      positioning: [],
      demos: [],
      possession: [],
    };

    replayData.forEach((replayObject: any) => {
      const replay = replayObject.data.filter((p: any) => p.team);

      // populate player data
      const playerData = replay.find((p: any) => p.player_name === player.name);

      (data.boost.bpm[0] as any)["BPM"] +=
        playerData.boost_boost_usage / numReplays;
      (data.boost.smallPads[0] as any)["Small pads"] +=
        playerData.boost_num_small_boosts / numReplays;
      (data.boost.largePads[0] as any)["Large pads"] +=
        playerData.boost_num_large_boosts / numReplays;
      (data.boost.timeAt0[0] as any)["Time at 0"] +=
        playerData.boost_time_no_boost / numReplays;
      (data.boost.timeAtLow[0] as any)["Time at Low"] +=
        playerData.boost_time_low_boost / numReplays;
      (data.boost.timeAtFull[0] as any)["Time at Full"] +=
        playerData.boost_time_full_boost / numReplays;

      // populate teammate data
      const teammates = replay.filter(
        (p: any) => p.player_name !== player.name && p.team === playerData.team,
      );
      const numTeammates = teammates.length;

      teammates.forEach((tm8: any) => {
        (data.boost.bpm[1] as any)["BPM"] +=
          tm8.boost_boost_usage / numTeammates / numReplays;
        (data.boost.smallPads[1] as any)["Small pads"] +=
          tm8.boost_num_small_boosts / numTeammates / numReplays;
        (data.boost.largePads[1] as any)["Large pads"] +=
          tm8.boost_num_large_boosts / numTeammates / numReplays;
        (data.boost.timeAt0[1] as any)["Time at 0"] +=
          tm8.boost_time_no_boost / numTeammates / numReplays;
        (data.boost.timeAtLow[1] as any)["Time at Low"] +=
          tm8.boost_time_low_boost / numTeammates / numReplays;
        (data.boost.timeAtFull[1] as any)["Time at Full"] +=
          tm8.boost_time_full_boost / numTeammates / numReplays;
      });

      // populate opponent data
      const opponents = replay.filter(
        (p: any) => p.player_name !== player.name && p.team !== playerData.team,
      );
      const numOpponents = opponents.length;

      opponents.forEach((opponent: any) => {
        (data.boost.bpm[2] as any)["BPM"] +=
          opponent.boost_boost_usage / numOpponents / numReplays;
        (data.boost.smallPads[2] as any)["Small pads"] +=
          opponent.boost_num_small_boosts / numOpponents / numReplays;
        (data.boost.largePads[2] as any)["Large pads"] +=
          opponent.boost_num_large_boosts / numOpponents / numReplays;
        (data.boost.timeAt0[2] as any)["Time at 0"] +=
          opponent.boost_time_no_boost / numOpponents / numReplays;
        (data.boost.timeAtLow[2] as any)["Time at Low"] +=
          opponent.boost_time_low_boost / numOpponents / numReplays;
        (data.boost.timeAtFull[2] as any)["Time at Full"] +=
          opponent.boost_time_full_boost / numOpponents / numReplays;
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartData(data);
  }, [replayData, player]);

  const chartsToRender = useMemo(() => {
    if (!chartData) return null;

    const categoryCharts = {
      boost: [
        {
          title: "Boost Used per minute",
          chart: "bar-chart",
          data: chartData.boost.bpm,
        },
        // { title: "Total Wasted Boost", chart: "bar-chart" },
        {
          title: "Small Boost Pads Collected",
          chart: "bar-chart",
          data: chartData.boost.smallPads,
        },
        {
          title: "Large Boost Pads Collected",
          chart: "bar-chart",
          data: chartData.boost.largePads,
        },
        {
          title: "Time at 0 Boost",
          chart: "bar-chart",
          data: chartData.boost.timeAt0,
        },
        {
          title: "Time at Low Boost",
          chart: "bar-chart",
          data: chartData.boost.timeAtLow,
        },
        {
          title: "Time at Full Boost",
          chart: "bar-chart",
          data: chartData.boost.timeAtFull,
        },
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

    return categoryCharts[category];
  }, [chartData, category]);

  const renderChart = (title: string, chart: string, data: any) => {
    switch (chart) {
      case "bar-chart":
        return (
          <CustomBarChart
            key={title}
            title={title}
            data={data}
            dataKey={Object.keys(data[0])[1]}
          />
        );
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
          {chartsToRender
            ? chartsToRender.map((chart) =>
                renderChart(
                  chart.title,
                  chart.chart,
                  "data" in chart ? chart.data : [],
                ),
              )
            : "Loading..."}
        </div>
      </div>
    </section>
  );
}

export default DataOverview;
