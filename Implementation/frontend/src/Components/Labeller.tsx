import { useState, useEffect } from "react";

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

const ML_COLS = [
  "core_shots",
  "core_goals",
  "core_saves",
  "core_assists",
  "core_shooting_percentage",
  "boost_bpm",
  "boost_count_stolen_big",
  "movement_avg_speed_percentage",
  "movement_percent_high_air",
  "positioning_percent_most_back",
  "positioning_percent_most_forward",
  "positioning_percent_closest_to_ball",
  "positioning_percent_infront_ball",
  "positioning_percent_offensive_third",
  "positioning_percent_defensive_third",
  "demo_inflicted",
];

interface Player {
  index: number;
  rank: string;
  playstyle?: string;
  [key: string]: number | string | undefined;
}

function Labeller() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/stats_csv");

        if (!response.ok) {
          throw new Error("Network response not ok");
        }

        const data = await response.json();

        setPlayers(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchData();
  }, []);

  const labelPlayer = async (index: number, playstyle: string) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/label_player/" +
          index +
          "?label=" +
          playstyle,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error("Network response not ok");
      }

      if (currentPlayer < players.length - 1) {
        setCurrentPlayer((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (players.length === 0) {
    return <div>Loading...</div>;
  }

  function percentileColor(percentile: number) {
    if (percentile <= 50) {
      // red to gray
      const ratio = percentile / 50;
      const r = Math.round(239 + (107 - 239) * ratio);
      const g = Math.round(68 + (114 - 68) * ratio);
      const b = Math.round(68 + (128 - 68) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // gray to green
      const ratio = (percentile - 50) / 50;
      const r = Math.round(107 + (34 - 107) * ratio);
      const g = Math.round(114 + (197 - 114) * ratio);
      const b = Math.round(128 + (94 - 128) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return (
    <div className="labeller">
      <div className="rank">{players[currentPlayer].rank}</div>
      <div className="prototype-prediction">
        {/* Prototype Prediction: {players[currentPlayer]["prototype-prediction"]} */}
      </div>
      <div className="stats-container">
        {Object.keys(players[currentPlayer])
          .filter(
            (key) => !key.endsWith("_percentile") && ML_COLS.includes(key),
          )
          .map((key) => (
            <div key={key} className="stat">
              <div className="stat-name">
                {STAT_NAMES[key as keyof typeof STAT_NAMES]}
              </div>
              <div className="stat-value">
                {(players[currentPlayer][key] as number).toFixed(1)}
              </div>
              <div className="stat-percentile">
                {(
                  players[currentPlayer][key + "_percentile"] as number
                ).toFixed(1)}
                %
              </div>
              <div className="percentile-bar">
                <div className="percentile-bar-wrapper">
                  <div
                    className="percentile-bar"
                    style={{
                      width: `${players[currentPlayer][key + "_percentile"] as number}%`,
                      backgroundColor: percentileColor(
                        players[currentPlayer][key + "_percentile"] as number,
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="playstyles-container">
        <div
          className="playstyle"
          style={{ background: "rgba(255, 0, 0, 0.2)", borderColor: "red" }}
          onClick={() => labelPlayer(players[currentPlayer].index, "striker")}
        >
          Striker
        </div>
        <div
          className="playstyle"
          style={{ background: "rgba(0, 89, 255, 0.2)", borderColor: "blue" }}
          onClick={() => labelPlayer(players[currentPlayer].index, "defender")}
        >
          Defender
        </div>
        <div
          className="playstyle"
          style={{
            background: "rgba(255, 0, 255, 0.2)",
            borderColor: "rgb(255, 0, 255)",
          }}
          onClick={() =>
            labelPlayer(players[currentPlayer].index, "freestyler")
          }
        >
          Freestyler
        </div>
        <div
          className="playstyle"
          style={{
            background: "rgba(119, 255, 0, 0.2)",
            borderColor: "rgb(119, 255, 0)",
          }}
          onClick={() =>
            labelPlayer(players[currentPlayer].index, "ball_chaser")
          }
        >
          Ball Chaser
        </div>
        <div
          className="playstyle"
          style={{
            background: "rgba(255, 136, 0, 0.2)",
            borderColor: "rgb(255, 136, 0)",
          }}
          onClick={() => labelPlayer(players[currentPlayer].index, "enforcer")}
        >
          Enforcer
        </div>
        <div
          className="playstyle"
          style={{
            background: "rgba(255, 247, 0, 0.2)",
            borderColor: "rgb(255, 247, 0)",
          }}
          onClick={() => labelPlayer(players[currentPlayer].index, "playmaker")}
        >
          Playmaker
        </div>
      </div>
    </div>
  );
}

export default Labeller;
