import { useEffect, useState } from "react";
import CustomRadarChart from "./CustomRadarChart";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const RANK_CODE_TO_NAME = {
  "silver-1": "Silver I",
  "silver-2": "Silver II",
  "silver-3": "Silver III",
  "gold-1": "Gold I",
  "gold-2": "Gold II",
  "gold-3": "Gold III",
  "platinum-1": "Platinum I",
  "platinum-2": "Platinum II",
  "platinum-3": "Platinum III",
  "diamond-1": "Diamond I",
  "diamond-2": "Diamond II",
  "diamond-3": "Diamond III",
  "champion-1": "Champion I",
  "champion-2": "Champion II",
  "champion-3": "Champion III",
  "grand-champion-1": "Grand Champion I",
  "grand-champion-2": "Grand Champion II",
  "grand-champion-3": "Grand Champion III",
  "supersonic-legend": "Supersonic Legend",
};

const dataCore = [
  {
    category: "Shots /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Goals %",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "Saves /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Assists %",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "Shooting %",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
];

const dataBoost = [
  {
    category: "BPM",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Small Pads /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Large Pads /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Big Pads stolen /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "% No Boost",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Low Boost",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Full Boost",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
];

const dataMovement = [
  {
    category: "Average Speed %",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Supersonic Speed",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% On Ground",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Low In Air",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% High In Air",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "Demos Taken /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
  {
    category: "Demos Inflicted /min",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
  },
];

const dataPositioning = [
  {
    category: "% Most Back",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Most Forward",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Closest To Ball",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Furthest From Ball",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Behind Ball",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Ahead Of Ball",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Defending Third",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
  {
    category: "% Attacking Third",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "%",
  },
];

function DataComparison({ rank, replayData, player, mode }: any) {
  const [chartData, setChartData] = useState<any>(null);
  const [userRankPercentiles, setUserRankPercentiles] = useState<any>(null);
  const [rankChartData, setRankChartData] = useState<any>(null);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    const isPlayer = (p: any, player: any) => {
      if (player.id !== "0" && player.id !== "" && "id" in p) {
        return player.id === p.id;
      }
      return player.name === p.player_name;
    };

    const populateYou_OriginalBallchasing = (
      numReplays: number,
      playerData: any,
      duration: number,
      data: any,
    ) => {
      data.core[0].You_Original += playerData["shots"] / duration / numReplays;
      data.core[1].You_Original += Number(playerData["goals"]);
      data.core[2].You_Original += playerData["saves"] / duration / numReplays;
      data.core[3].You_Original += Number(playerData["assists"]);
      data.core[4].You_Original +=
        Number(playerData["core_shooting_percentage"]) / numReplays;

      data.boost[0].You_Original +=
        playerData["boost_boost_usage"] / numReplays;
      data.boost[1].You_Original +=
        playerData["boost_num_small_boosts"] / duration / numReplays;
      data.boost[2].You_Original +=
        playerData["boost_num_large_boosts"] / duration / numReplays;
      data.boost[3].You_Original +=
        playerData["boost_num_stolen_boosts"] / duration / numReplays;
      data.boost[4].You_Original +=
        playerData["boost_percent_zero_boost"] / numReplays;
      data.boost[5].You_Original +=
        playerData["boost_percent_boost_0_25"] / numReplays;
      data.boost[6].You_Original +=
        playerData["boost_percent_full_boost"] / numReplays;

      data.movement[0].You_Original +=
        playerData["movement_avg_speed_percentage"] / numReplays;
      data.movement[1].You_Original +=
        playerData["movement_percent_supersonic_speed"] / numReplays;
      data.movement[2].You_Original +=
        playerData["movement_percent_ground"] / numReplays;
      data.movement[3].You_Original +=
        playerData["movement_percent_low_air"] / numReplays;
      data.movement[4].You_Original +=
        playerData["movement_percent_high_air"] / numReplays;
      data.movement[5].You_Original +=
        playerData["demo_stats_num_demos_inflicted"] / numReplays / duration;
      data.movement[6].You_Original +=
        playerData["demo_stats_num_demos_taken"] / numReplays / duration;

      data.positioning[0].You_Original +=
        playerData["positioning_percent_most_back"] / numReplays;
      data.positioning[1].You_Original +=
        playerData["positioning_percent_most_forward"] / numReplays;
      data.positioning[2].You_Original +=
        playerData["positioning_percent_closest_to_ball"] / numReplays;
      data.positioning[3].You_Original +=
        playerData["positioning_percent_farthest_from_ball"] / numReplays;
      data.positioning[4].You_Original +=
        playerData["positioning_percent_behind_ball"] / numReplays;
      data.positioning[5].You_Original +=
        playerData["positioning_percent_infront_ball"] / numReplays;
      data.positioning[6].You_Original +=
        playerData["positioning_percent_defensive_third"] / numReplays;
      data.positioning[7].You_Original +=
        playerData["positioning_percent_offensive_third"] / numReplays;
    };

    const populateYou_Original = (
      numReplays: number,
      playerData: any,
      duration: number,
      data: any,
    ) => {
      data.core[0].You_Original += playerData["shots"] / duration / numReplays;
      data.core[1].You_Original += Number(playerData["goals"]);
      data.core[2].You_Original += playerData["saves"] / duration / numReplays;
      data.core[3].You_Original += Number(playerData["assists"]);
      data.core[4].You_Original +=
        ((playerData["goals"] /
          (playerData["shots"] > 0 ? playerData["shots"] : 1)) *
          100) /
        numReplays;

      data.boost[0].You_Original +=
        playerData["boost_boost_usage"] / duration / numReplays;
      data.boost[1].You_Original +=
        playerData["boost_num_small_boosts"] / duration / numReplays;
      data.boost[2].You_Original +=
        playerData["boost_num_large_boosts"] / duration / numReplays;
      data.boost[3].You_Original +=
        playerData["boost_num_stolen_boosts"] / duration / numReplays;
      data.boost[4].You_Original +=
        (playerData["boost_time_no_boost"] / (duration * 60) / numReplays) *
        100;
      data.boost[5].You_Original +=
        (playerData["boost_time_low_boost"] / (duration * 60) / numReplays) *
        100;
      data.boost[6].You_Original +=
        (playerData["boost_time_full_boost"] / (duration * 60) / numReplays) *
        100;

      data.movement[0].You_Original +=
        playerData["averages_average_speed"] / numReplays / 230; // 230 = max speed/100
      data.movement[1].You_Original +=
        (playerData["speed_time_at_super_sonic"] /
          (duration * 60) /
          numReplays) *
        100;
      data.movement[2].You_Original +=
        (playerData["positional_tendencies_time_on_ground"] /
          (duration * 60) /
          numReplays) *
        100;
      data.movement[3].You_Original +=
        (playerData["positional_tendencies_time_low_in_air"] /
          (duration * 60) /
          numReplays) *
        100;
      data.movement[4].You_Original +=
        (playerData["positional_tendencies_time_high_in_air"] /
          (duration * 60) /
          numReplays) *
        100;
      data.movement[5].You_Original +=
        playerData["demo_stats_num_demos_inflicted"] / numReplays / duration;
      data.movement[6].You_Original +=
        playerData["demo_stats_num_demos_taken"] / numReplays / duration;

      data.positioning[0].You_Original +=
        (playerData["relative_positioning_time_most_back_player"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[1].You_Original +=
        (playerData["relative_positioning_time_most_forward_player"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[2].You_Original +=
        (playerData["distance_time_closest_to_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[3].You_Original +=
        (playerData["distance_time_furthest_from_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[4].You_Original +=
        (playerData["positional_tendencies_time_behind_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[5].You_Original +=
        (playerData["positional_tendencies_time_in_front_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[6].You_Original +=
        (playerData["positional_tendencies_time_in_defending_third"] /
          (duration * 60) /
          numReplays) *
        100;
      data.positioning[7].You_Original +=
        (playerData["positional_tendencies_time_in_attacking_third"] /
          (duration * 60) /
          numReplays) *
        100;
    };

    const populateRankAverageBoth = (radarData: any, averageData: any) => {
      const coreStats = [
        "core_shots",
        "core_goals",
        "core_saves",
        "core_assists",
        "core_shooting_percentage",
      ];

      for (let i = 0; i < coreStats.length; i++) {
        radarData.core[i].RankAverage +=
          averageData[coreStats[i] + "_percentile"];
        radarData.core[i].RankAverage_Original +=
          averageData[coreStats[i] + "_avg"];
      }

      const boostStats = [
        "boost_bpm",
        "boost_count_collected_small",
        "boost_count_collected_big",
        "boost_count_stolen_big",
        "boost_percent_zero_boost",
        "boost_percent_boost_0_25",
        "boost_percent_full_boost",
      ];

      for (let i = 0; i < boostStats.length; i++) {
        radarData.boost[i].RankAverage +=
          averageData[boostStats[i] + "_percentile"];
        radarData.boost[i].RankAverage_Original +=
          averageData[boostStats[i] + "_avg"];
      }

      const movementStats = [
        "movement_avg_speed_percentage",
        "movement_percent_supersonic_speed",
        "movement_percent_ground",
        "movement_percent_low_air",
        "movement_percent_high_air",
        "demo_taken",
        "demo_inflicted",
      ];

      for (let i = 0; i < movementStats.length; i++) {
        radarData.movement[i].RankAverage +=
          averageData[movementStats[i] + "_percentile"];
        radarData.movement[i].RankAverage_Original +=
          averageData[movementStats[i] + "_avg"];
      }

      const positioningStats = [
        "positioning_percent_most_back",
        "positioning_percent_most_forward",
        "positioning_percent_closest_to_ball",
        "positioning_percent_farthest_from_ball",
        "positioning_percent_behind_ball",
        "positioning_percent_infront_ball",
        "positioning_percent_defensive_third",
        "positioning_percent_offensive_third",
      ];

      for (let i = 0; i < positioningStats.length; i++) {
        radarData.positioning[i].RankAverage +=
          averageData[positioningStats[i] + "_percentile"];
        radarData.positioning[i].RankAverage_Original +=
          averageData[positioningStats[i] + "_avg"];
      }
    };

    const fetchRankAverageData = async (rank: string, radarData: any) => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/rank_average/" + rank + "?mode=" + mode,
        );
        if (!response.ok) {
          throw new Error("Network response not ok");
        }

        const data = await response.json();
        populateRankAverageBoth(radarData, data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchUserPercentiles = async (
      radarData: any,
      colourPercentiles: any,
    ) => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/user_percentiles/" +
            rank +
            "?mode=" +
            mode,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(radarData),
          },
        );
        if (!response.ok) {
          throw new Error("Network response not ok");
        }

        const data = await response.json();
        const percentilesAll = data.percentiles_all;
        const percentilesRank = data.percentiles_rank;

        const categories = ["core", "boost", "movement", "positioning"];
        categories.forEach((category: string) => {
          for (let i = 0; i < percentilesAll[category].length; i++) {
            radarData[category][i].You = percentilesAll[category][i];
            colourPercentiles[category][i].You = percentilesRank[category][i];
          }
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const run = async () => {
      if (!replayData || replayData.length === 0) return;
      const numReplays = replayData.length;
      let totalGoals = 0;

      const radarData = {
        core: JSON.parse(JSON.stringify(dataCore)),
        boost: JSON.parse(JSON.stringify(dataBoost)),
        movement: JSON.parse(JSON.stringify(dataMovement)),
        positioning: JSON.parse(JSON.stringify(dataPositioning)),
      };

      const colourPercentiles = {
        core: JSON.parse(JSON.stringify(dataCore)),
        boost: JSON.parse(JSON.stringify(dataBoost)),
        movement: JSON.parse(JSON.stringify(dataMovement)),
        positioning: JSON.parse(JSON.stringify(dataPositioning)),
      };

      // populating rank average
      await fetchRankAverageData(rank, radarData);

      // populating user's data
      replayData.forEach((replayObject: any) => {
        const replay = replayObject.data.filter((p: any) => p.team);

        const playerData = replay.find((p: any) => isPlayer(p, player));

        const duration = playerData.duration;

        // add user's team goals per replay to divide at end
        totalGoals += replay
          .filter((p: any) => p.team === playerData.team)
          .reduce((a: number, b: any) => a + Number(b.goals), 0);

        if ("ballchasing" in playerData) {
          populateYou_OriginalBallchasing(
            numReplays,
            playerData,
            duration,
            radarData,
          );
        } else {
          populateYou_Original(numReplays, playerData, duration, radarData);
        }
      });

      if (totalGoals === 0) totalGoals = 1;

      radarData.core[1].You_Original =
        (radarData.core[1].You_Original * 100) / totalGoals;
      radarData.core[3].You_Original =
        (radarData.core[3].You_Original * 100) / totalGoals;

      // populating user's percentiles
      await fetchUserPercentiles(radarData, colourPercentiles);

      setChartData(radarData);
      setUserRankPercentiles(colourPercentiles);
    };
    run();
  }, [replayData, player, rank]);

  useEffect(() => {
    const populateRankAverageBoth = (radarData: any, averageData: any) => {
      const coreStats = [
        "core_shots",
        "core_goals",
        "core_saves",
        "core_assists",
        "core_shooting_percentage",
      ];

      for (let i = 0; i < coreStats.length; i++) {
        radarData.core[i].RankAverage +=
          averageData[coreStats[i] + "_percentile"];
        radarData.core[i].RankAverage_Original +=
          averageData[coreStats[i] + "_avg"];
      }

      const boostStats = [
        "boost_bpm",
        "boost_count_collected_small",
        "boost_count_collected_big",
        "boost_count_stolen_big",
        "boost_percent_zero_boost",
        "boost_percent_boost_0_25",
        "boost_percent_full_boost",
      ];

      for (let i = 0; i < boostStats.length; i++) {
        radarData.boost[i].RankAverage +=
          averageData[boostStats[i] + "_percentile"];
        radarData.boost[i].RankAverage_Original +=
          averageData[boostStats[i] + "_avg"];
      }

      const movementStats = [
        "movement_avg_speed_percentage",
        "movement_percent_supersonic_speed",
        "movement_percent_ground",
        "movement_percent_low_air",
        "movement_percent_high_air",
        "demo_taken",
        "demo_inflicted",
      ];

      for (let i = 0; i < movementStats.length; i++) {
        radarData.movement[i].RankAverage +=
          averageData[movementStats[i] + "_percentile"];
        radarData.movement[i].RankAverage_Original +=
          averageData[movementStats[i] + "_avg"];
      }

      const positioningStats = [
        "positioning_percent_most_back",
        "positioning_percent_most_forward",
        "positioning_percent_closest_to_ball",
        "positioning_percent_farthest_from_ball",
        "positioning_percent_behind_ball",
        "positioning_percent_infront_ball",
        "positioning_percent_defensive_third",
        "positioning_percent_offensive_third",
      ];

      for (let i = 0; i < positioningStats.length; i++) {
        radarData.positioning[i].RankAverage +=
          averageData[positioningStats[i] + "_percentile"];
        radarData.positioning[i].RankAverage_Original +=
          averageData[positioningStats[i] + "_avg"];
      }
    };

    const fetchRankAverageData = async (rank: string, radarData: any) => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/rank_average/" + rank + "?mode=" + mode,
        );
        if (!response.ok) {
          throw new Error("Network response not ok");
        }

        const data = await response.json();
        populateRankAverageBoth(radarData, data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const run = async () => {
      if (!selectedRank || !chartData || chartData.length === 0) return;

      const radarData = {
        core: JSON.parse(JSON.stringify(dataCore)),
        boost: JSON.parse(JSON.stringify(dataBoost)),
        movement: JSON.parse(JSON.stringify(dataMovement)),
        positioning: JSON.parse(JSON.stringify(dataPositioning)),
      };

      // populating rank average
      await fetchRankAverageData(selectedRank, radarData);

      // populating user's data
      const categories = ["core", "boost", "movement", "positioning"];
      categories.forEach((category: string) => {
        for (
          let i = 0;
          i < radarData[category as keyof typeof radarData].length;
          i++
        ) {
          radarData[category as keyof typeof radarData][i].You +=
            chartData[category][i].You;
          radarData[category as keyof typeof radarData][i].You_Original +=
            chartData[category][i].You_Original;
        }
      });

      setRankChartData(radarData);
    };
    run();
  }, [selectedRank, chartData]);

  const handleRankChange = (event: any) => {
    setSelectedRank(event.target.value);
  };

  if (!chartData || !userRankPercentiles) return null;

  if (minimized) {
    return (
      <section className="section alt" id="comparison">
        <h2 style={{ cursor: "pointer" }} onClick={() => setMinimized(false)}>
          Rank Comparison
          <span className="material-icons">arrow_drop_down</span>
        </h2>
      </section>
    );
  }

  return (
    <section className="section alt" id="comparison">
      <div className="container">
        <h2 style={{ cursor: "pointer" }} onClick={() => setMinimized(true)}>
          Rank Comparison<span className="material-icons">arrow_drop_up</span>
        </h2>
        <h3>
          You vs Average{" "}
          <u>{RANK_CODE_TO_NAME[rank as keyof typeof RANK_CODE_TO_NAME]}</u>
          <div className="legend">
            <div className="legend-you">
              <div className="legend-box"></div>You
            </div>{" "}
            <div className="legend-rank">
              <div className="legend-box"></div>Rank Average
            </div>
          </div>
        </h3>
        <div className="spider-charts">
          <CustomRadarChart
            data={chartData.core}
            percentiles={userRankPercentiles.core}
          />
          <CustomRadarChart
            data={chartData.boost}
            percentiles={userRankPercentiles.boost}
          />
          <CustomRadarChart
            data={chartData.movement}
            percentiles={userRankPercentiles.movement}
          />
          <CustomRadarChart
            data={chartData.positioning}
            percentiles={userRankPercentiles.positioning}
          />
        </div>
        {/* <div className="list-section outliers-container">
          <p className="list-heading">Outliers</p>
          <ul>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
          </ul>
        </div> */}
        <h3 style={{ marginTop: "5rem" }}>
          You vs Average
          <div className="rank-selection">
            <select id="rank" name="rank" onChange={handleRankChange}>
              <option value="">-- Choose A Rank --</option>

              <option value="gold-1">Gold I</option>
              <option value="gold-2">Gold II</option>
              <option value="gold-3">Gold III</option>

              <option value="platinum-1">Platinum I</option>
              <option value="platinum-2">Platinum II</option>
              <option value="platinum-3">Platinum III</option>

              <option value="diamond-1">Diamond I</option>
              <option value="diamond-2">Diamond II</option>
              <option value="diamond-3">Diamond III</option>

              <option value="champion-1">Champion I</option>
              <option value="champion-2">Champion II</option>
              <option value="champion-3">Champion III</option>

              <option value="grand-champion-1">Grand Champ I</option>
              <option value="grand-champion-2">Grand Champ II</option>
              <option value="grand-champion-3">Grand Champ III</option>

              <option value="supersonic-legend">Supersonic Legend</option>
            </select>
          </div>
        </h3>
        <div className="spider-charts">
          <CustomRadarChart
            data={rankChartData ? rankChartData.core : chartData.core}
          />
          <CustomRadarChart
            data={rankChartData ? rankChartData.boost : chartData.boost}
          />
          <CustomRadarChart
            data={rankChartData ? rankChartData.movement : chartData.movement}
          />
          <CustomRadarChart
            data={
              rankChartData ? rankChartData.positioning : chartData.positioning
            }
          />
        </div>
      </div>
    </section>
  );
}

export default DataComparison;
