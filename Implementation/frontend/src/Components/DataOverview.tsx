import CustomBarChart from "./CustomBarChart";
import CustomStackChart from "./CustomStackChart";
import CustomPieChart from "./CustomPieChart";
import { useState, useEffect, useMemo } from "react";
import {
  populateBoost,
  populateMovement,
  populatePositioning,
  populateDemos,
  populatePossession,
} from "./dataPopulating";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const DATA_SKELETON = {
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
  movement: {
    averageSpeed: [
      { name: "You", "Average Speed": 0 },
      { name: "Teammates", "Average Speed": 0 },
      { name: "Opponents", "Average Speed": 0 },
    ],
    timeSupersonic: [
      { name: "You", "Time Supersonic": 0 },
      { name: "Teammates", "Time Supersonic": 0 },
      { name: "Opponents", "Time Supersonic": 0 },
    ],
    timeHeights: [
      { name: "You", Ground: 0, Low: 0, High: 0 },
      { name: "Teammates", Ground: 0, Low: 0, High: 0 },
      { name: "Opponents", Ground: 0, Low: 0, High: 0 },
    ],
  },
  positioning: {
    positionRelativeToTeam: [
      { name: "Most Back", value: 0 },
      { name: "Between Players", value: 0 },
      { name: "Most Forward", value: 0 },
    ],
    distanceFromBall: [
      { name: "Time Closest", value: 0 },
      { name: "Time Farthest", value: 0 },
    ],
    aheadOfBall: [
      { name: "You", "Time Ahead": 0, "Time Behind": 0 },
      { name: "Teammates", "Time Ahead": 0, "Time Behind": 0 },
      { name: "Opponents", "Time Ahead": 0, "Time Behind": 0 },
    ],
    timeEachThird: [
      {
        name: "You",
        "Defending Third": 0,
        "Neutral Third": 0,
        "Attacking Third": 0,
      },
      {
        name: "Teammates",
        "Defending Third": 0,
        "Neutral Third": 0,
        "Attacking Third": 0,
      },
      {
        name: "Opponents",
        "Defending Third": 0,
        "Neutral Third": 0,
        "Attacking Third": 0,
      },
    ],
  },
  demos: {
    demosInflicted: [
      { name: "You", "Demos Inflicted": 0 },
      { name: "Teammates", "Demos Inflicted": 0 },
      { name: "Opponents", "Demos Inflicted": 0 },
    ],
    demosTaken: [
      { name: "You", "Demos Taken": 0 },
      { name: "Teammates", "Demos Taken": 0 },
      { name: "Opponents", "Demos Taken": 0 },
    ],
    stolenBoosts: [
      { name: "You", "Stolen Boosts": 0 },
      { name: "Teammates", "Stolen Boosts": 0 },
      { name: "Opponents", "Stolen Boosts": 0 },
    ],
  },
  possession: {
    teamPossession: [
      { name: "Your Team", value: 0 },
      { name: "Opponent Team", value: 0 },
    ],
    possessionTime: [
      { name: "You", "Possession Time": 0 },
      { name: "Teammates", "Possession Time": 0 },
      { name: "Opponents", "Possession Time": 0 },
    ],
    averagePossessionTime: [
      { name: "You", "Avg. Poss. Time": 0 },
      { name: "Teammates", "Avg. Poss. Time": 0 },
      { name: "Opponents", "Avg. Poss. Time": 0 },
    ],
  },
};

function DataOverview({ replayData, player }: any) {
  const [category, setCategory] = useState<
    "boost" | "movement" | "positioning" | "demos" | "possession"
  >("boost");

  const [chartData, setChartData] = useState<any>(null);
  const [demoCategory, setDemoCategory] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(true);
  const [clicked, setClicked] = useState<boolean>(false);

  const isPlayer = (p: any, player: any) => {
    if (player.id !== "0" && player.id !== "" && "id" in p) {
      return player.id === p.id;
    }
    return player.name === p.player_name;
  };

  useEffect(() => {
    if (!replayData || replayData.length === 0) return;
    const numReplays = replayData.length;

    const data = JSON.parse(JSON.stringify(DATA_SKELETON));

    replayData.forEach((replayObject: any) => {
      const replay = replayObject.data.filter((p: any) => p.team);

      const playerData = replay.find((p: any) => isPlayer(p, player));

      const teammates = replay.filter(
        (p: any) => !isPlayer(p, player) && p.team === playerData.team,
      );

      const opponents = replay.filter((p: any) => p.team !== playerData.team);

      populateBoost(data, numReplays, playerData, teammates, opponents);
      populateMovement(data, numReplays, playerData, teammates, opponents);
      populatePositioning(data, numReplays, playerData, teammates, opponents);
      populateDemos(data, numReplays, playerData, teammates, opponents);
      populatePossession(data, numReplays, playerData, teammates, opponents);

      // if demo data exists, then show demo category
      if (!isNaN(data.demos.demosInflicted[0]["Demos Inflicted"])) {
        setDemoCategory(true);
      }
    });

    // format height

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
        {
          title: "Average Speed (% of Max)",
          chart: "bar-chart",
          data: chartData.movement.averageSpeed,
        },
        {
          title: "Time Supersonic Speed",
          chart: "bar-chart",
          data: chartData.movement.timeSupersonic,
        },
        {
          title: "Time at different Heights",
          chart: "stack-chart",
          data: chartData.movement.timeHeights,
        },
      ],
      positioning: [
        {
          title: "Position Relative to Teammates",
          chart: "pie-chart",
          data: chartData.positioning.positionRelativeToTeam,
        },
        {
          title: "Distance from Ball",
          chart: "pie-chart",
          data: chartData.positioning.distanceFromBall,
        },
        {
          title: "Behind/Ahead of Ball",
          chart: "stack-chart",
          data: chartData.positioning.aheadOfBall,
        },
        {
          title: "General Position on Field",
          chart: "stack-chart",
          data: chartData.positioning.timeEachThird,
        },
      ],
      demos: [
        {
          title: "Demos Inflicted (total per game)",
          chart: "bar-chart",
          data: chartData.demos.demosInflicted,
        },
        {
          title: "Demos Taken (total per game)",
          chart: "bar-chart",
          data: chartData.demos.demosTaken,
        },
        {
          title: "Large Boost Pads Stolen (total per game)",
          chart: "bar-chart",
          data: chartData.demos.stolenBoosts,
        },
      ],
      possession: [
        {
          title: "Team Possession",
          chart: "pie-chart-v2",
          data: chartData.possession.teamPossession,
        },
        {
          title: "Total Possession Time (per player)",
          chart: "bar-chart",
          data: chartData.possession.possessionTime,
        },
        {
          title: "Average Possession Duration",
          chart: "bar-chart",
          data: chartData.possession.averagePossessionTime,
        },
      ],
    };

    return categoryCharts[category];
  }, [chartData, category]);

  const renderChart = (title: string, chart: string, data: any) => {
    if (!Object.keys(data[0]).length) return null;
    const valueKey = Object.keys(data[0]).find((k: string) => k !== "name");
    if (!valueKey) return null;
    if (isNaN(data[0][valueKey])) return null;
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
        return (
          <CustomStackChart
            key={title}
            title={title}
            data={data}
            dataKeys={Object.keys(data[0]).slice(1)}
          />
        );
      case "pie-chart":
        return <CustomPieChart key={title} title={title} data={data} />;
      case "pie-chart-v2":
        return (
          <CustomPieChart key={title} title={title} data={data} v2={true} />
        );
    }
  };

  if (minimized) {
    return (
      <section className="section alt" id="comparison">
        <h2
          style={{ cursor: "pointer" }}
          onClick={() => {
            setMinimized(false);
            if (!clicked) setClicked(true);
          }}
        >
          Data Overview
          <span className="material-icons">arrow_drop_down</span>
          {!clicked && <span className="expand-section">(expand)</span>}
        </h2>
      </section>
    );
  }

  return (
    <section className="section alt" id="overview">
      <div className="container">
        <h2 style={{ cursor: "pointer" }} onClick={() => setMinimized(true)}>
          Data Overview <span className="material-icons">arrow_drop_up</span>
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
            hidden={!demoCategory}
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
