/* eslint-disable  @typescript-eslint/no-explicit-any */

const COLUMN_NAMES = {
  core: [
    ["shots", "Shots", "shots"],
    ["goals", "Goals", "goals"],
    ["saves", "Saves", "saves"],
    ["assists", "Assists", "assists"],
  ],
  boost: [
    ["bpm", "BPM", "boost_boost_usage"],
    ["smallPads", "Small pads", "boost_num_small_boosts"],
    ["largePads", "Large pads", "boost_num_large_boosts"],
    ["timeAt0", "Time at 0", "boost_time_no_boost"],
    ["timeAtLow", "Time at Low", "boost_time_low_boost"],
    ["timeAtFull", "Time at Full", "boost_time_full_boost"],
  ],
  movement: [
    ["averageSpeed", "Average Speed", "averages_average_speed"],
    ["timeSupersonic", "Time Supersonic", "speed_time_at_super_sonic"],
    [
      "timeHeights",
      "Ground",
      "Low",
      "High",
      "positional_tendencies_time_on_ground",
      "positional_tendencies_time_low_in_air",
      "positional_tendencies_time_high_in_air",
    ],
  ],
  positioning: [
    [
      "positionRelativeToTeam",
      "Most Back",
      "Between Players",
      "Most Forward",
      "relative_positioning_time_most_back_player",
      "relative_positioning_time_between_players",
      "relative_positioning_time_most_forward_player",
    ],
    [
      "distanceFromBall",
      "Time Closest",
      "Time Farthest",
      "distance_time_closest_to_ball",
      "distance_time_furthest_from_ball",
    ],
    [
      "aheadOfBall",
      "Time Ahead",
      "Time Behind",
      "positional_tendencies_time_in_front_ball",
      "positional_tendencies_time_behind_ball",
    ],
    [
      "timeEachThird",
      "Defending Third",
      "Neutral Third",
      "Attacking Third",
      "positional_tendencies_time_in_defending_third",
      "positional_tendencies_time_in_neutral_third",
      "positional_tendencies_time_in_attacking_third",
    ],
  ],
  demos: [
    ["demosInflicted", "Demos Inflicted", "demo_stats_num_demos_inflicted"],
    ["demosTaken", "Demos Taken", "demo_stats_num_demos_taken"],
    ["stolenBoosts", "Stolen Boosts", "boost_num_stolen_boosts"],
  ],
  possession: [
    ["teamPossession", "Team Possession", ""],
    ["possessionTime", "Possession Time", "possession_possession_time"],
    [
      "averagePossessionTime",
      "Avg. Poss. Time",
      "per_possession_stats_average_duration",
    ],
  ],
};

function populateCore(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  const numTeammates = teammates.length;
  const numOpponents = opponents.length;

  for (const column of COLUMN_NAMES.core) {
    ((data.core as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const column of COLUMN_NAMES.core) {
      ((data.core as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });

  opponents.forEach((opponent: any) => {
    for (const column of COLUMN_NAMES.core) {
      ((data.core as any)[column[0]] as any)[2][column[1]] +=
        opponent[column[2]] / numOpponents / numReplays;
    }
  });
}

function populateBoost(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  const numTeammates = teammates.length;
  const numOpponents = opponents.length;

  for (const column of COLUMN_NAMES.boost) {
    if (column[0] === "bpm" && !("ballchasing" in playerData)) {
      ((data.boost as any)[column[0]] as any)[0][column[1]] +=
        playerData[column[2]] / numReplays / playerData["duration"];
      continue;
    }
    ((data.boost as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const column of COLUMN_NAMES.boost) {
      if (column[0] === "bpm" && !("ballchasing" in tm8)) {
        ((data.boost as any)[column[0]] as any)[1][column[1]] +=
          tm8[column[2]] / numTeammates / numReplays / tm8["duration"];
        continue;
      }
      ((data.boost as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });

  opponents.forEach((opponent: any) => {
    for (const column of COLUMN_NAMES.boost) {
      if (column[0] === "bpm" && !("ballchasing" in opponent)) {
        ((data.boost as any)[column[0]] as any)[2][column[1]] +=
          opponent[column[2]] /
          numOpponents /
          numReplays /
          opponent["duration"];
        continue;
      }
      ((data.boost as any)[column[0]] as any)[2][column[1]] +=
        opponent[column[2]] / numOpponents / numReplays;
    }
  });
}

function populateMovement(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  const numTeammates = teammates.length;
  const numOpponents = opponents.length;

  let MAX_SPEED;
  if ("ballchasing" in playerData) {
    MAX_SPEED = 2300;
  } else {
    MAX_SPEED = 23000;
  }

  for (const [index, column] of COLUMN_NAMES.movement.entries()) {
    if (index === 2) {
      // stacked bar chart (height)
      const totalHeightTime =
        Number(playerData[column[4]]) +
        Number(playerData[column[5]]) +
        Number(playerData[column[6]]);
      ((data.movement as any)[column[0]] as any)[0][column[1]] +=
        (playerData[column[4]] / totalHeightTime / numReplays) * 100;
      ((data.movement as any)[column[0]] as any)[0][column[2]] +=
        (playerData[column[5]] / totalHeightTime / numReplays) * 100;
      ((data.movement as any)[column[0]] as any)[0][column[3]] +=
        (playerData[column[6]] / totalHeightTime / numReplays) * 100;
      continue;
    }
    if (index === 0) {
      // average speed
      ((data.movement as any)[column[0]] as any)[0][column[1]] +=
        (playerData[column[2]] * 100) / numReplays / MAX_SPEED;
      continue;
    }
    ((data.movement as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const [index, column] of COLUMN_NAMES.movement.entries()) {
      if (index === 2) {
        // stacked bar chart (height)
        const totalHeightTime =
          Number(tm8[column[4]]) +
          Number(tm8[column[5]]) +
          Number(tm8[column[6]]);
        ((data.movement as any)[column[0]] as any)[1][column[1]] +=
          (tm8[column[4]] / numTeammates / numReplays / totalHeightTime) * 100;
        ((data.movement as any)[column[0]] as any)[1][column[2]] +=
          (tm8[column[5]] / numTeammates / numReplays / totalHeightTime) * 100;
        ((data.movement as any)[column[0]] as any)[1][column[3]] +=
          (tm8[column[6]] / numTeammates / numReplays / totalHeightTime) * 100;
        continue;
      }

      if (index === 0) {
        // average speed
        ((data.movement as any)[column[0]] as any)[1][column[1]] +=
          (tm8[column[2]] * 100) / numTeammates / numReplays / MAX_SPEED;
        continue;
      }

      ((data.movement as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });
  opponents.forEach((opponent: any) => {
    for (const [index, column] of COLUMN_NAMES.movement.entries()) {
      if (index == 2) {
        // stacked bar chart (height)
        const totalHeightTime =
          Number(opponent[column[4]]) +
          Number(opponent[column[5]]) +
          Number(opponent[column[6]]);
        ((data.movement as any)[column[0]] as any)[2][column[1]] +=
          (opponent[column[4]] / numOpponents / numReplays / totalHeightTime) *
          100;
        ((data.movement as any)[column[0]] as any)[2][column[2]] +=
          (opponent[column[5]] / numOpponents / numReplays / totalHeightTime) *
          100;
        ((data.movement as any)[column[0]] as any)[2][column[3]] +=
          (opponent[column[6]] / numOpponents / numReplays / totalHeightTime) *
          100;
        continue;
      }

      if (index === 0) {
        // average speed
        ((data.movement as any)[column[0]] as any)[2][column[1]] +=
          (opponent[column[2]] * 100) / numOpponents / numReplays / MAX_SPEED;
        continue;
      }

      ((data.movement as any)[column[0]] as any)[2][column[1]] +=
        opponent[column[2]] / numOpponents / numReplays;
    }
  });
}

function populatePositioning(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  const numTeammates = teammates.length;
  const numOpponents = opponents.length;

  const totalPlayerTime =
    Number(playerData["positional_tendencies_time_in_front_ball"]) +
    Number(playerData["positional_tendencies_time_behind_ball"]);
  const totalPlayerThirdTime =
    Number(playerData["positional_tendencies_time_in_defending_third"]) +
    Number(playerData["positional_tendencies_time_in_neutral_third"]) +
    Number(playerData["positional_tendencies_time_in_attacking_third"]);

  data.positioning.positionRelativeToTeam[0].value +=
    playerData["relative_positioning_time_most_back_player"] / numReplays;
  data.positioning.positionRelativeToTeam[1].value +=
    playerData["relative_positioning_time_most_forward_player"] / numReplays;

  data.positioning.distanceFromBall[0].value +=
    playerData["distance_time_closest_to_ball"] / numReplays;
  data.positioning.distanceFromBall[1].value +=
    playerData["distance_time_furthest_from_ball"] / numReplays;

  data.positioning.aheadOfBall[0]["Time Ahead"] +=
    (playerData["positional_tendencies_time_in_front_ball"] /
      numReplays /
      totalPlayerTime) *
    100;
  data.positioning.aheadOfBall[0]["Time Behind"] +=
    (playerData["positional_tendencies_time_behind_ball"] /
      numReplays /
      totalPlayerTime) *
    100;

  data.positioning.timeEachThird[0]["Defending Third"] +=
    (playerData["positional_tendencies_time_in_defending_third"] /
      numReplays /
      totalPlayerThirdTime) *
    100;
  data.positioning.timeEachThird[0]["Neutral Third"] +=
    (playerData["positional_tendencies_time_in_neutral_third"] /
      numReplays /
      totalPlayerThirdTime) *
    100;
  data.positioning.timeEachThird[0]["Attacking Third"] +=
    (playerData["positional_tendencies_time_in_attacking_third"] /
      numReplays /
      totalPlayerThirdTime) *
    100;

  teammates.forEach((tm8: any) => {
    const totalTime =
      Number(tm8["positional_tendencies_time_in_front_ball"]) +
      Number(tm8["positional_tendencies_time_behind_ball"]);
    const totalThirdTime =
      Number(tm8["positional_tendencies_time_in_defending_third"]) +
      Number(tm8["positional_tendencies_time_in_neutral_third"]) +
      Number(tm8["positional_tendencies_time_in_attacking_third"]);
    data.positioning.aheadOfBall[1]["Time Ahead"] +=
      (tm8["positional_tendencies_time_in_front_ball"] /
        numTeammates /
        numReplays /
        totalTime) *
      100;
    data.positioning.aheadOfBall[1]["Time Behind"] +=
      (tm8["positional_tendencies_time_behind_ball"] /
        numTeammates /
        numReplays /
        totalTime) *
      100;

    data.positioning.timeEachThird[1]["Defending Third"] +=
      (tm8["positional_tendencies_time_in_defending_third"] /
        numTeammates /
        numReplays /
        totalThirdTime) *
      100;
    data.positioning.timeEachThird[1]["Neutral Third"] +=
      (tm8["positional_tendencies_time_in_neutral_third"] /
        numTeammates /
        numReplays /
        totalThirdTime) *
      100;
    data.positioning.timeEachThird[1]["Attacking Third"] +=
      (tm8["positional_tendencies_time_in_attacking_third"] /
        numTeammates /
        numReplays /
        totalThirdTime) *
      100;
  });

  opponents.forEach((opponent: any) => {
    const totalTime =
      Number(opponent["positional_tendencies_time_in_front_ball"]) +
      Number(opponent["positional_tendencies_time_behind_ball"]);
    const totalThirdTime =
      Number(opponent["positional_tendencies_time_in_defending_third"]) +
      Number(opponent["positional_tendencies_time_in_neutral_third"]) +
      Number(opponent["positional_tendencies_time_in_attacking_third"]);
    data.positioning.aheadOfBall[2]["Time Ahead"] +=
      (opponent["positional_tendencies_time_in_front_ball"] /
        numOpponents /
        numReplays /
        totalTime) *
      100;
    data.positioning.aheadOfBall[2]["Time Behind"] +=
      (opponent["positional_tendencies_time_behind_ball"] /
        numOpponents /
        numReplays /
        totalTime) *
      100;

    data.positioning.timeEachThird[2]["Defending Third"] +=
      (opponent["positional_tendencies_time_in_defending_third"] /
        numOpponents /
        numReplays /
        totalThirdTime) *
      100;
    data.positioning.timeEachThird[2]["Neutral Third"] +=
      (opponent["positional_tendencies_time_in_neutral_third"] /
        numOpponents /
        numReplays /
        totalThirdTime) *
      100;
    data.positioning.timeEachThird[2]["Attacking Third"] +=
      (opponent["positional_tendencies_time_in_attacking_third"] /
        numOpponents /
        numReplays /
        totalThirdTime) *
      100;
  });
}

function populateDemos(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  // not dividing by num tm8s or opps because less useful (e.g: 0.5 demos by teammates because 1 got demo not other, just confusing)

  for (const column of COLUMN_NAMES.demos) {
    ((data.demos as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const column of COLUMN_NAMES.demos) {
      ((data.demos as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numReplays;
    }
  });

  opponents.forEach((opponent: any) => {
    for (const column of COLUMN_NAMES.demos) {
      ((data.demos as any)[column[0]] as any)[2][column[1]] +=
        opponent[column[2]] / numReplays;
    }
  });
}

function populatePossession(
  data: any,
  numReplays: number,
  playerData: any,
  teammates: any,
  opponents: any,
) {
  const numTeammates = teammates.length;
  const numOpponents = opponents.length;

  let playerTeamPossession = 0;
  playerTeamPossession += Number(playerData["possession_possession_time"]);
  teammates.forEach((tm8: any) => {
    playerTeamPossession += Number(tm8["possession_possession_time"]);
  });
  data.possession.teamPossession[0].value += playerTeamPossession / numReplays;

  let opponentTeamPossession = 0;
  opponents.forEach((opponent: any) => {
    opponentTeamPossession += Number(opponent["possession_possession_time"]);
  });
  data.possession.teamPossession[1].value +=
    opponentTeamPossession / numReplays;

  for (const [index, column] of COLUMN_NAMES.possession.entries()) {
    if (index === 0) continue;
    ((data.possession as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const [index, column] of COLUMN_NAMES.possession.entries()) {
      if (index === 0) continue;
      ((data.possession as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });

  opponents.forEach((opponent: any) => {
    for (const [index, column] of COLUMN_NAMES.possession.entries()) {
      if (index === 0) continue;
      ((data.possession as any)[column[0]] as any)[2][column[1]] +=
        opponent[column[2]] / numOpponents / numReplays;
    }
  });
}

export {
  populateCore,
  populateBoost,
  populateMovement,
  populatePositioning,
  populateDemos,
  populatePossession,
};
