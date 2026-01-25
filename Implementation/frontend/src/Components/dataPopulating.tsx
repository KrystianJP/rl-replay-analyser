/* eslint-disable  @typescript-eslint/no-explicit-any */

const COLUMN_NAMES = {
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
    ((data.boost as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const column of COLUMN_NAMES.boost) {
      ((data.boost as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });

  opponents.forEach((opponent: any) => {
    for (const column of COLUMN_NAMES.boost) {
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

  for (const column of COLUMN_NAMES.movement) {
    if (column.length > 3) {
      // stacked bar chart (height)
      ((data.movement as any)[column[0]] as any)[0][column[1]] +=
        playerData[column[4]] / numReplays;
      ((data.movement as any)[column[0]] as any)[0][column[2]] +=
        playerData[column[5]] / numReplays;
      ((data.movement as any)[column[0]] as any)[0][column[3]] +=
        playerData[column[6]] / numReplays;
      continue;
    }
    ((data.movement as any)[column[0]] as any)[0][column[1]] +=
      playerData[column[2]] / numReplays;
  }

  teammates.forEach((tm8: any) => {
    for (const column of COLUMN_NAMES.movement) {
      if (column.length > 3) {
        // stacked bar chart (height)
        ((data.movement as any)[column[0]] as any)[1][column[1]] +=
          tm8[column[4]] / numTeammates / numReplays;
        ((data.movement as any)[column[0]] as any)[1][column[2]] +=
          tm8[column[5]] / numTeammates / numReplays;
        ((data.movement as any)[column[0]] as any)[1][column[3]] +=
          tm8[column[6]] / numTeammates / numReplays;
        continue;
      }

      ((data.movement as any)[column[0]] as any)[1][column[1]] +=
        tm8[column[2]] / numTeammates / numReplays;
    }
  });
  opponents.forEach((opponent: any) => {
    for (const column of COLUMN_NAMES.movement) {
      if (column.length > 3) {
        // stacked bar chart (height)
        ((data.movement as any)[column[0]] as any)[2][column[1]] +=
          opponent[column[4]] / numOpponents / numReplays;
        ((data.movement as any)[column[0]] as any)[2][column[2]] +=
          opponent[column[5]] / numOpponents / numReplays;
        ((data.movement as any)[column[0]] as any)[2][column[3]] +=
          opponent[column[6]] / numOpponents / numReplays;
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
  data.positioning.positionRelativeToTeam[0].value +=
    playerData["relative_positioning_time_most_back_player"] / numReplays;
  data.positioning.positionRelativeToTeam[1].value +=
    playerData["relative_positioning_time_between_players"] / numReplays;
  data.positioning.positionRelativeToTeam[2].value +=
    playerData["relative_positioning_time_most_forward_player"] / numReplays;

  data.positioning.distanceFromBall[0].value +=
    playerData["distance_time_closest_to_ball"] / numReplays;
  data.positioning.distanceFromBall[1].value +=
    playerData["distance_time_furthest_from_ball"] / numReplays;

  data.positioning.aheadOfBall[0]["Time Ahead"] +=
    playerData["positional_tendencies_time_in_front_ball"] / numReplays;
  data.positioning.aheadOfBall[0]["Time Behind"] +=
    playerData["positional_tendencies_time_behind_ball"] / numReplays;

  data.positioning.timeEachThird[0]["Defending Third"] +=
    playerData["positional_tendencies_time_in_defending_third"] / numReplays;
  data.positioning.timeEachThird[0]["Neutral Third"] +=
    playerData["positional_tendencies_time_in_neutral_third"] / numReplays;
  data.positioning.timeEachThird[0]["Attacking Third"] +=
    playerData["positional_tendencies_time_in_attacking_third"] / numReplays;

  teammates.forEach((tm8: any) => {
    data.positioning.aheadOfBall[1]["Time Ahead"] +=
      tm8["positional_tendencies_time_in_front_ball"] /
      numTeammates /
      numReplays;
    data.positioning.aheadOfBall[1]["Time Behind"] +=
      tm8["positional_tendencies_time_behind_ball"] / numTeammates / numReplays;

    data.positioning.timeEachThird[1]["Defending Third"] +=
      tm8["positional_tendencies_time_in_defending_third"] /
      numTeammates /
      numReplays;
    data.positioning.timeEachThird[1]["Neutral Third"] +=
      tm8["positional_tendencies_time_in_neutral_third"] /
      numTeammates /
      numReplays;
    data.positioning.timeEachThird[1]["Attacking Third"] +=
      tm8["positional_tendencies_time_in_attacking_third"] /
      numTeammates /
      numReplays;
  });

  opponents.forEach((opponent: any) => {
    data.positioning.aheadOfBall[2]["Time Ahead"] +=
      opponent["positional_tendencies_time_in_front_ball"] /
      numOpponents /
      numReplays;
    data.positioning.aheadOfBall[2]["Time Behind"] +=
      opponent["positional_tendencies_time_behind_ball"] /
      numOpponents /
      numReplays;

    data.positioning.timeEachThird[2]["Defending Third"] +=
      opponent["positional_tendencies_time_in_defending_third"] /
      numOpponents /
      numReplays;
    data.positioning.timeEachThird[2]["Neutral Third"] +=
      opponent["positional_tendencies_time_in_neutral_third"] /
      numOpponents /
      numReplays;
    data.positioning.timeEachThird[2]["Attacking Third"] +=
      opponent["positional_tendencies_time_in_attacking_third"] /
      numOpponents /
      numReplays;
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
  console.log(playerTeamPossession);
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
  populateBoost,
  populateMovement,
  populatePositioning,
  populateDemos,
  populatePossession,
};
