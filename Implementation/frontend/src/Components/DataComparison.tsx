import { useEffect } from "react";
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
    category: "Average Speed",
    You: 0,
    You_Original: 0,
    RankAverage: 0,
    RankAverage_Original: 0,
    unit: "",
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

function DataComparison({ rank, replayData, player }: any) {
  useEffect(() => {
    const isPlayer = (p: any, player: any) => {
      if (player.online_id !== "0" && player.online_id !== "" && "id" in p) {
        return player.online_id === p.id;
      }
      if (player.epic_id !== "0" && player.epic_id !== "" && "id" in p) {
        return player.epic_id === p.id;
      }
      return player.name === p.player_name;
    };

    const populateYou_Original = (
      numReplays: number,
      playerData: any,
      duration: number,
      data: any,
    ) => {
      data.core[0].You_Original += playerData["shots"] / duration / numReplays;
      data.core[1].You_Original += playerData["goals"];
      data.core[2].You_Original += playerData["saves"] / duration / numReplays;
      data.core[3].You_Original += playerData["assists"];
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
        playerData["averages_average_speed"] / numReplays;
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

    if (!replayData || replayData.length === 0) return;
    const numReplays = replayData.length;
    let totalGoals = 0;

    const data = {
      core: JSON.parse(JSON.stringify(dataCore)),
      boost: JSON.parse(JSON.stringify(dataBoost)),
      movement: JSON.parse(JSON.stringify(dataMovement)),
      positioning: JSON.parse(JSON.stringify(dataPositioning)),
    };

    replayData.forEach((replayObject: any) => {
      const replay = replayObject.data.filter((p: any) => p.team);

      const playerData = replay.find((p: any) => isPlayer(p, player));

      // in mins
      const duration =
        (playerData["positional_tendencies_time_in_attacking_half"] +
          playerData["positional_tendencies_time_in_defending_half"]) /
        60;

      // add user's team goals per replay to divide at end
      totalGoals += replay
        .filter((p: any) => p.team === playerData.team)
        .reduce((a: number, b: any) => a + b.goals, 0);

      populateYou_Original(numReplays, playerData, duration, data);
    });

    dataCore[1].You_Original /= totalGoals > 0 ? totalGoals : 1;
    dataCore[3].You_Original /= totalGoals > 0 ? totalGoals : 1;
  }, [replayData, player, rank]);

  return (
    <section className="section alt" id="comparison">
      <div className="container">
        <h2>
          Rank Comparison<span className="material-icons">arrow_drop_up</span>
        </h2>
        <h3>
          You vs Average{" "}
          <u>{RANK_CODE_TO_NAME[rank as keyof typeof RANK_CODE_TO_NAME]}</u>
        </h3>
        <div className="spider-charts">
          <CustomRadarChart data={dataCore} />
          <CustomRadarChart data={dataBoost} />
          <CustomRadarChart data={dataMovement} />
          <CustomRadarChart data={dataPositioning} />
        </div>
        <div className="list-section outliers-container">
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
        </div>
        <h3 style={{ marginTop: "5rem" }}>
          You vs Average
          <div className="rank-selection">
            <select id="rank" name="rank">
              <option value="">-- Choose A Rank --</option>
              <option value="silver-1">Silver I</option>
              <option value="silver-2">Silver II</option>
              <option value="silver-3">Silver III</option>

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
          <CustomRadarChart data={dataCore} />
          <CustomRadarChart data={dataBoost} />
          <CustomRadarChart data={dataMovement} />
          <CustomRadarChart data={dataPositioning} />
        </div>
      </div>
    </section>
  );
}

export default DataComparison;
