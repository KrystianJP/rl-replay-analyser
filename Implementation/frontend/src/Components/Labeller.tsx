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

interface Player {
  player_id: number;
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

  const labelPlayer = async (playerId: number, playstyle: string) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/label_player/" +
          playerId +
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

  return (
    <div className="labeller">
      <div className="rank">{players[currentPlayer].rank}</div>
      <div className="prototype-prediction">
        Prototype Prediction: {players[currentPlayer]["prototype-prediction"]}
      </div>
      <div className="stats-container">
        {Object.keys(players[currentPlayer])
          .filter(
            (key) =>
              !key.endsWith("_percentile") &&
              ![
                "rank",
                "rank-no",
                "player_id",
                "playstyle",
                "prototype-prediction",
              ].includes(key),
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
                <progress
                  value={players[currentPlayer][key + "_percentile"]}
                  max={100}
                ></progress>
              </div>
            </div>
          ))}
      </div>

      <div className="playstyles-container">
        <div
          className="playstyle"
          style={{ background: "rgba(255, 0, 0, 0.2)", borderColor: "red" }}
          onClick={() =>
            labelPlayer(players[currentPlayer].player_id, "striker")
          }
        >
          Striker
        </div>
        <div
          className="playstyle"
          style={{ background: "rgba(0, 89, 255, 0.2)", borderColor: "blue" }}
          onClick={() =>
            labelPlayer(players[currentPlayer].player_id, "defender")
          }
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
            labelPlayer(players[currentPlayer].player_id, "freestyler")
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
            labelPlayer(players[currentPlayer].player_id, "ball_chaser")
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
          onClick={() =>
            labelPlayer(players[currentPlayer].player_id, "enforcer")
          }
        >
          Enforcer
        </div>
        <div
          className="playstyle"
          style={{
            background: "rgba(255, 247, 0, 0.2)",
            borderColor: "rgb(255, 247, 0)",
          }}
          onClick={() =>
            labelPlayer(players[currentPlayer].player_id, "playmaker")
          }
        >
          Playmaker
        </div>
      </div>
    </div>
  );
}

export default Labeller;
