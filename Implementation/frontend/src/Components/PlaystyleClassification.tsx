/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";

const CLASS_COLORS = {
  striker: "rgb(235, 64, 64)",
  defender: "rgb(0, 162, 255)",
  freestyler: "rgb(255,0,255)",
  ball_chaser: "rgb(119,255,0)",
  enforcer: "rgb(255,136,0)",
  playmaker: "rgb(255,247,0)",
};

const STAT_NAMES = {
  core_shots: "Shots /min",
  core_goals: "Goals %",
  core_assists: "Assists %",
  core_saves: "Saves /min",
  core_shooting_percentage: "Shooting %",
  boost_bpm: "BPM",
  boost_count_stolen_big: "Stolen Boosts /min",
  movement_avg_speed_percentage: "Avg. Speed %",
  movement_percent_supersonic_speed: "Supersonic Speed %",
  movement_percent_ground: "Ground %",
  movement_percent_high_air: "High Air %",
  movement_percent_high_air_percentile: "High Air Percentile",
  positioning_percent_most_back: "Most Back %",
  positioning_percent_between_players: "Between Players %",
  positioning_percent_most_forward: "Most Forward %",
  positioning_percent_closest_to_ball: "Closest to Ball %",
  positioning_percent_farthest_from_ball: "Farthest from Ball %",
  positioning_percent_behind_ball: "Behind Ball %",
  positioning_percent_infront_ball: "Infront of Ball %",
  positioning_percent_defensive_third: "Defensive Third %",
  positioning_percent_offensive_third: "Offensive Third %",
  demo_inflicted: "Demos /min",
};

const CLASS_TO_DISPLAY = {
  striker: "STRIKER",
  defender: "DEFENDER",
  freestyler: "FREESTYLER",
  ball_chaser: "BALL CHASER",
  enforcer: "ENFORCER",
  playmaker: "PLAYMAKER",
};

const playerData_structure = {
  rank_no: 0,
  core_shots: 0,
  core_goals: 0,
  core_assists: 0,
  core_saves: 0,
  core_shooting_percentage: 0,
  boost_bpm: 0,
  boost_count_stolen_big: 0,
  movement_avg_speed_percentage: 0,
  movement_percent_high_air: 0,
  positioning_percent_most_back: 0,
  positioning_percent_most_forward: 0,
  positioning_percent_closest_to_ball: 0,
  positioning_percent_infront_ball: 0,
  positioning_percent_defensive_third: 0,
  positioning_percent_offensive_third: 0,
  demo_inflicted: 0,
};

const RANK_TO_INT = {
  "bronze-1": 1,
  "bronze-2": 2,
  "bronze-3": 3,

  "silver-1": 4,
  "silver-2": 5,
  "silver-3": 6,

  "gold-1": 7,
  "gold-2": 8,
  "gold-3": 9,

  "platinum-1": 10,
  "platinum-2": 11,
  "platinum-3": 12,

  "diamond-1": 13,
  "diamond-2": 14,
  "diamond-3": 15,

  "champion-1": 16,
  "champion-2": 17,
  "champion-3": 18,

  "grand-champion-1": 19,
  "grand-champion-2": 20,
  "grand-champion-3": 21,

  "supersonic-legend": 22,
};

const CLASS_DESCRIPTIONS = {
  striker:
    "Strikers specialise in shot volume and precision, often positioning in scoring areas where they capitalise on passes. They excel at converting offensive pressure into goals.",
  defender:
    "Defenders are typically the team's last line of defense. They focus on making effective clears, saves, and positioning to help their team overturn possession and prevent counterattacks.",
  freestyler:
    "Freestylers are known for their flashy mechanics. They excel at outplaying opponents in the air, forming favourable offensive situations, and sometimes scoring directly.",
  ball_chaser:
    "Ball Chasers will relentlessly pursue the ball, constantly challenging opponents and applying pressure. Their aggressive playstyle can lead to unexpected opportunities, though it may disrupt team rotations.",
  enforcer:
    "Enforcers focus on physical disruptions through demos and bumps, applying pressure off the ball. They create space by destabilizing their opponents' positioning, though their aggression can lead to overcommits.",
  playmaker:
    "Playmakers prioritise creating scoring opportunities through effective ball control and precise passes. They excel at reading opponents' positioning and setting up effective scoring chances.",
};

function PlaystyleClassification({ replayData, player, rank }: any) {
  const [classes, setClasses] = useState([]);
  const [probabilities, setProbabilities] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);

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

    const populatePlayerData = (
      numReplays: number,
      playerData: any,
      duration: number,
      dataToPopulate: any,
    ) => {
      dataToPopulate.core_shots += playerData["shots"] / duration / numReplays;
      dataToPopulate.core_goals += Number(playerData["goals"]);
      dataToPopulate.core_assists += Number(playerData["assists"]);
      dataToPopulate.core_saves += playerData["saves"] / duration / numReplays;
      dataToPopulate.core_shooting_percentage +=
        ((playerData["goals"] /
          (playerData["shots"] > 0 ? playerData["shots"] : 1)) *
          100) /
        numReplays;

      dataToPopulate.boost_bpm +=
        playerData["boost_boost_usage"] / duration / numReplays;
      dataToPopulate.boost_count_stolen_big +=
        playerData["boost_num_stolen_boosts"] / duration / numReplays;

      dataToPopulate.movement_avg_speed_percentage +=
        playerData["averages_average_speed"] / numReplays / 230;
      dataToPopulate.movement_percent_high_air +=
        (playerData["positional_tendencies_time_high_in_air"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_most_back +=
        (playerData["relative_positioning_time_most_back_player"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_most_forward +=
        (playerData["relative_positioning_time_most_forward_player"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_closest_to_ball +=
        (playerData["distance_time_closest_to_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_infront_ball +=
        (playerData["positional_tendencies_time_in_front_ball"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_defensive_third +=
        (playerData["positional_tendencies_time_in_defending_third"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.positioning_percent_offensive_third +=
        (playerData["positional_tendencies_time_in_attacking_third"] /
          (duration * 60) /
          numReplays) *
        100;
      dataToPopulate.demo_inflicted +=
        playerData["demo_stats_num_demos_inflicted"] / numReplays / duration;
    };

    const fetchPlaystyleData = async (playerData: any) => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/playstyle/3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(playerData),
        });

        if (!response.ok) {
          throw new Error("Network response not ok");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const run = async () => {
      if (!replayData || replayData.length === 0) return;
      const numReplays = replayData.length;
      let totalGoals = 0;

      const playerData = JSON.parse(JSON.stringify(playerData_structure));

      // populating user's data
      replayData.forEach((replayObject: any) => {
        const replay = replayObject.data.filter((p: any) => p.team);

        const replayPlayer = replay.find((p: any) => isPlayer(p, player));

        // in mins
        const duration =
          (Number(
            replayPlayer["positional_tendencies_time_in_attacking_half"],
          ) +
            Number(
              replayPlayer["positional_tendencies_time_in_defending_half"],
            )) /
          60;

        totalGoals += replay
          .filter((p: any) => p.team === replayPlayer.team)
          .reduce((a: number, b: any) => a + Number(b.goals), 0);

        populatePlayerData(numReplays, replayPlayer, duration, playerData);
      });

      if (totalGoals === 0) totalGoals = 1;

      playerData.core_goals = (playerData.core_goals * 100) / totalGoals;
      playerData.core_assists = (playerData.core_assists * 100) / totalGoals;

      playerData.rank_no = RANK_TO_INT[rank as keyof typeof RANK_TO_INT];

      const playstyleData = await fetchPlaystyleData(playerData);

      setClasses(playstyleData.ordered_classes);
      setProbabilities(playstyleData.ordered_probs);
      setFeatureImportance(playstyleData.top_stats);
    };

    run();
  }, [replayData, player, rank]);

  return (
    <section className="section" id="playstyle">
      <div className="container">
        <h2>
          Playstyle Classification
          <span className="material-icons">arrow_drop_down</span>
        </h2>
        <p id="your-playstyle">Your Playstyle:</p>
        <div
          className="playstyle-result"
          style={{
            color: CLASS_COLORS[classes[0]],
            filter: "drop-shadow(0 0 2px " + CLASS_COLORS[classes[0]] + ")",
          }}
        >
          {CLASS_TO_DISPLAY[classes[0]]}
        </div>
        <div style={{ textAlign: "center", opacity: 0.6, marginTop: "-20px" }}>
          ({(probabilities[0] * 100).toFixed(1)}%)
        </div>
        <p
          className="playstyle-description"
          style={{ color: CLASS_COLORS[classes[0]], filter: "brightness(1.6)" }}
        >
          {CLASS_DESCRIPTIONS[classes[0]]}
        </p>

        <div className="list-section">
          <p className="list-heading">Why this playstyle?</p>
          <ul>
            {featureImportance.map((feature: any, index: number) => (
              <li key={index}>
                <strong>
                  {feature.feature in STAT_NAMES
                    ? STAT_NAMES[feature.feature as keyof typeof STAT_NAMES]
                    : feature.feature}
                </strong>
                {feature.direction === "low" ? " (Low)" : ""} [
                {feature.feature_value.toFixed(2)}] -{" "}
                <span style={{ opacity: 0.7 }}>
                  Impact: {feature.shap_value.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="list-section">
          <p className="list-heading">Improvement tips:</p>
          <ul>
            <li>Example advice - Statistic</li>
            <li>Example advice - Statistic</li>
            <li>General advice</li>
          </ul>
        </div>
        <div className="list-section">
          <p className="list-heading">Other playstyles:</p>
          <ul>
            {classes.slice(1).map((playstyle: string, index: number) => (
              <li key={index}>
                <span
                  style={{
                    color: CLASS_COLORS[playstyle as keyof typeof CLASS_COLORS],
                    filter: "brightness(0.8)",
                  }}
                >
                  {CLASS_TO_DISPLAY[playstyle as keyof typeof CLASS_TO_DISPLAY]}{" "}
                  -{" "}
                </span>
                <span className="playstyle-sureness">
                  {(probabilities[index + 1] * 100).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PlaystyleClassification;
