from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import carball
import pandas as pd
import numpy as np
import json
import subprocess
import os
import tempfile
import shutil
from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game
from carball.generated.api import game_pb2
from datetime import datetime
from mappings import get_map_name, get_playlist_name
import io
import anyio
import asyncio
from google.protobuf.json_format import MessageToDict
import joblib
from pydantic import BaseModel
from typing import List

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

RRROCKET_PATH = "./rrrocket.exe"

class StatItem(BaseModel):
    category: str
    You_Original: float

class RadarData(BaseModel):
    core: List[StatItem]
    boost: List[StatItem]
    movement: List[StatItem]
    positioning: List[StatItem]

class PlayerStats(BaseModel):
    rank_no: int

    core_shots: float
    core_goals: float
    core_saves: float
    core_assists: float
    core_shooting_percentage: float

    boost_bpm: float
    boost_count_stolen_big: float

    movement_avg_speed_percentage: float
    movement_percent_high_air: float

    positioning_percent_most_back: float
    positioning_percent_most_forward: float
    positioning_percent_closest_to_ball: float
    positioning_percent_infront_ball: float
    positioning_percent_offensive_third: float
    positioning_percent_defensive_third: float

    demo_inflicted: float

upload_lock = asyncio.Lock()

model_3v3 = joblib.load("model_3v3.joblib")

def get_replay_proto(replay_path: str):
    if not os.path.exists(RRROCKET_PATH):
        raise FileNotFoundError(f"{RRROCKET_PATH} not found.")

    # decompile with rrrocket.exe
    result = subprocess.run(
        [RRROCKET_PATH, "-n", "--json-lines", replay_path],
        capture_output=True,
        text=True,
        check=True,
        encoding='utf-8'
    )
    replay_dict = json.loads(result.stdout.splitlines()[0])
    properties = replay_dict.get('properties', {})
    id = ""
    if (properties.get("Id", '') != ''):
        id = properties.get("Id", "")
    else:
        id = properties.get("MatchGUID", "")

    # analyse with carball to get proto
    game = Game()
    game.initialize(loaded_json=replay_dict)
    analysis_manager = AnalysisManager(game)
    analysis_manager.create_analysis(clean=False)
    proto = analysis_manager.get_protobuf_data()

    return {"proto": proto, "id": id}

def process_replay(temp_file_path):
    data = get_replay_proto(temp_file_path)
    proto = data["proto"]
    match_guid = data["id"]

    all_players_data = []
    for player in proto.players:
        player_dict = {
            "id": player.id.id,
            "player_name": player.name,
            "team": "Orange" if player.is_orange else "Blue",
            "score": player.score,
            "goals": player.goals,
            "assists": player.assists,
            "saves": player.saves,
            "shots": player.shots
        }
        for category_field, category_value in player.stats.ListFields():
            category_name = category_field.name
            if hasattr(category_value, "ListFields"):
                for stat_field, stat_value in category_value.ListFields():
                    if not hasattr(stat_value, "ListFields"):
                        player_dict[f"{category_name}_{stat_field.name}"] = stat_value
            else:
                player_dict[category_name] = category_value
        all_players_data.append(player_dict)

    df = pd.DataFrame(all_players_data).fillna(0)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    return {"status": "success", "match_guid": match_guid, "csv": stream.getvalue()}

def get_replay_header(replay_path: str):
    if not os.path.exists(RRROCKET_PATH):
        raise FileNotFoundError(f"{RRROCKET_PATH} not found.")

    result = subprocess.run(
        [RRROCKET_PATH,"--json-lines", replay_path],
        capture_output=True,
        text=True,
        check=True,
        encoding='utf-8'
    )
    replay_dict = json.loads(result.stdout.splitlines()[0])
    properties = replay_dict.get('properties', {})

    id = ""
    if (properties.get("Id",'') != ""):
        id = properties.get("Id", "")
    else:
        id = properties.get("MatchGUID", "")

    
    header = {
        "game_id": id,
        "name": properties.get("ReplayName", ""),
        "map": properties["MapName"],
        "date": properties["Date"],
        "team_size": properties.get("TeamSize", 0),
        "players": []
    }

    # name, online_id, epic_id of each player
    for player in properties.get("PlayerStats", []):
        player_info = {"name": player.get("Name", "Unknown"), "online_id": player.get("OnlineID", "0"), "epic_id": player.get("PlayerID", {}).get("fields", {}).get("EpicAccountId", "0")}
        header["players"].append(player_info)

    return header



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headers
)

# parses, turns into csv
@app.post("/api/upload")
async def upload_replay(file: UploadFile = File(...)):
    # We use 'async def' here so we can use the lock
    with tempfile.NamedTemporaryFile(delete=False, suffix=".replay") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file.flush()
        temp_path = temp_file.name

        try:
            async with upload_lock:
                result = await anyio.to_thread.run_sync(process_replay, temp_path)
                return result
        except Exception as e:
            return {"status": "error", "message": f"Failed to process: {e}"}
    
@app.post("/api/header")
def get_header(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".replay") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file.flush()

        try:
            header = get_replay_header(temp_file.name)

            team_size = str(header["team_size"])
            playlist = team_size + "v" + team_size
            map_name = get_map_name(header["map"])
            date = header["date"].split(" ")[0]  # just date part

            if header["name"] != "":
                replay_name = header["name"] + " - " + playlist + " - " + date
            else:
                replay_name = map_name + " - " + playlist + " - " + date

            return {"status": "success", "name": replay_name, "players": header["players"], "game_id": header["game_id"]}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get header: {e}")

@app.get("/api/stats_csv")
def get_stats_csv():
    df = pd.read_csv("player_stats_3v3.csv")
    df_copy = df.copy()

    cols_to_calc = df.drop(columns=["index","rank", "rank-no", "player_id","playstyle"])
    for i, row in df.iterrows():
        rank = row["rank-no"]

        group_cond = df["rank-no"].isin([rank-1, rank, rank+1])
        group_subset = df[group_cond]

        for col in cols_to_calc:
            percentile = (group_subset[col] <= row[col]).mean() * 100
            df.at[i, f"{col}_percentile"] = percentile


    df = df[df["playstyle"].isna()]
    df_copy = df_copy[df_copy["playstyle"].isna()]
    df = df.fillna(0)
    df_copy = df_copy.fillna(0)

    prototype = joblib.load("model_prototype.joblib")
    df_copy["positioning_percent_between_players"] = (
    100
    - df_copy["positioning_percent_most_forward"]
    - df_copy["positioning_percent_most_back"]
    )
    df_copy = df_copy.drop(columns=["index","rank", "player_id", "playstyle", "movement_percent_ground"])
    feature_order = prototype.feature_names_in_
    df_model = df_copy[feature_order] # reordering because scikit strict
    df["prototype-prediction"] = prototype.predict(df_model)

    return df.to_dict(orient="records")

@app.post("/api/label_player/{row_index}")
def label_player(row_index: int, label: str):
    df = pd.read_csv("player_stats_3v3.csv")

    if row_index not in df.index:
        return {"error": "Invalid row index"}

    df.loc[df["index"] == row_index, "playstyle"] = label

    df.to_csv("player_stats_3v3.csv", index=False)

    return {"status": "success"}

@app.get("/api/rank_average/{rank}")
def get_rank_average(rank: str):
    df = pd.read_csv("player_stats_3v3_original.csv")
    rank_subset  = df[df["rank"] == rank]
    cols_to_calc = df.drop(columns=["rank", "rank-no", "player_id"])

    result = {"rank": rank, }

    for col in cols_to_calc:
        rank_avg = rank_subset[col].mean()
        percentile = (df[col] <= rank_avg).mean() * 100

        result[f"{col}_avg"] = rank_avg
        result[f"{col}_percentile"] = percentile

    return result

@app.post("/api/user_percentiles")
async def get_user_percentiles(radar: RadarData):

    df = pd.read_csv("player_stats_3v3_original.csv")

    result = {
        "core": [],
        "boost": [],
        "movement": [],
        "positioning": [],
    }

    # CORE
    core_columns = [
        "core_shots",
        "core_goals",
        "core_saves",
        "core_assists",
        "core_shooting_percentage",
    ]

    for item, col in zip(radar.core, core_columns):
        percentile = (df[col] <= item.You_Original).mean() * 100
        result["core"].append(percentile)

    #  BOOST 
    boost_columns = [
        "boost_bpm",
        "boost_count_collected_small",
        "boost_count_collected_big",
        "boost_count_stolen_big",
        "boost_percent_zero_boost",
        "boost_percent_boost_0_25",
        "boost_percent_full_boost",
      ]

    for item, col in zip(radar.boost, boost_columns):
        percentile = (df[col] <= item.You_Original).mean() * 100
        result["boost"].append(percentile)

    # MOVEMENT 
    movement_columns = [
        "movement_avg_speed_percentage",
        "movement_percent_supersonic_speed",
        "movement_percent_ground",
        "movement_percent_low_air",
        "movement_percent_high_air",
        "demo_taken",
        "demo_inflicted",
      ]

    for item, col in zip(radar.movement, movement_columns):
        percentile = (df[col] <= item.You_Original).mean() * 100
        result["movement"].append(percentile)

    # POSITIONING 
    positioning_columns = [
        "positioning_percent_most_back",
        "positioning_percent_most_forward",
        "positioning_percent_closest_to_ball",
        "positioning_percent_farthest_from_ball",
        "positioning_percent_behind_ball",
        "positioning_percent_infront_ball",
        "positioning_percent_defensive_third",
        "positioning_percent_offensive_third",
      ]

    for item, col in zip(radar.positioning, positioning_columns):
        percentile = (df[col] <= item.You_Original).mean() * 100
        result["positioning"].append(percentile)

    return result

@app.post("/api/playstyle_3v3")
def get_playstyle_3v3(player: PlayerStats):

    df = pd.DataFrame(player.dict(), index=[0])
    df = df.rename(columns={"rank_no": "rank-no"})


    probs = model_3v3.predict_proba(df)
    classes = model_3v3.named_steps["logisticregression"].classes_


    ordered_idx = np.argsort(probs[0])[::-1] # high to low
    ordered_classes = classes[ordered_idx]
    ordered_probs = probs[0][ordered_idx]

    print(ordered_classes.tolist())
    print(ordered_probs.tolist())

    return {"ordered_classes": ordered_classes.tolist(), "ordered_probs": ordered_probs.tolist()}