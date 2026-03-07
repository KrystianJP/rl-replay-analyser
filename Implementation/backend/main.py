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
import shap
import requests
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

RRROCKET_PATH = "./rrrocket.exe"
TOKEN = os.getenv("BALLCHASING_TOKEN")

WAIT_TIME = 0.1666

model_3v3 = joblib.load("rf_model_3v3.joblib")
with open("rank_stats_3v3_all.json") as f:
    rank_stats = json.load(f)

ML_COLS = model_3v3.feature_names_in_.tolist()

COMP_COLS = ["core_shots",
        "core_goals",
        "core_saves",
        "core_assists",
        "core_shooting_percentage",
        "boost_bpm",
        "boost_count_collected_small",
        "boost_count_collected_big",
        "boost_count_stolen_big",
        "boost_percent_zero_boost",
        "boost_percent_boost_0_25",
        "boost_percent_full_boost", 
        "movement_avg_speed_percentage",
        "movement_percent_supersonic_speed",
        "movement_percent_ground",
        "movement_percent_low_air",
        "movement_percent_high_air",
        "demo_taken",
        "demo_inflicted",
        "positioning_percent_most_back",
        "positioning_percent_most_forward",
        "positioning_percent_closest_to_ball",
        "positioning_percent_farthest_from_ball",
        "positioning_percent_behind_ball",
        "positioning_percent_infront_ball",
        "positioning_percent_defensive_third",
        "positioning_percent_offensive_third",
        ]

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
    positioning_percent_farthest_from_ball: float
    positioning_percent_closest_to_ball: float
    positioning_percent_infront_ball: float
    positioning_percent_offensive_third: float
    positioning_percent_defensive_third: float

    demo_inflicted: float

upload_lock = asyncio.Lock()

def safe_get(url, headers, params={}, sleep_time=0.25):
    while True:
        r = requests.get(url, headers=headers, params=params)
        
        if r.status_code == 429:
            print(f"Rate limited. Sleeping {WAIT_TIME} minutes")
            time.sleep(WAIT_TIME * 60)
            continue
        
        r.raise_for_status()
        time.sleep(sleep_time)
        return r

def get_replay(id, token=TOKEN):
    r = safe_get("https://ballchasing.com/api/replays/" + id, headers={
                      'Authorization': token})

    if r.status_code == 200:
        return r.json()
    else:
        r.raise_for_status()

def compute_percentile(value, rank_no, col, rank_stats):
    group = rank_stats.get(str(rank_no), {}).get(col, [])
    return float(np.mean(np.array(group) <= value) * 100)

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
        player_dict["duration"] = (player_dict["positional_tendencies_time_behind_ball"] + player_dict["positional_tendencies_time_in_front_ball"]) / 60
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

    for player in properties.get("PlayerStats", []):
        player_id = str(player.get("PlayerID", {}).get("fields", {}).get("EpicAccountId", ""))
        if player_id == "" or player_id == "0":
            player_id = str(player.get("OnlineID", ""))
        if player_id == "" or player_id == "0":
            player_id = str(player.get("Name", ""))

        player_info = {"name": player.get("Name", "Unknown"), "id": player_id}
        header["players"].append(player_info)

    return header

def get_tree_threshold_direction(model, df, feature_names, feature):
    feature_idx = feature_names.index(feature)
    player_value = df.iloc[0][feature]
    
    high_count = 0
    low_count = 0
    
    for tree in model.estimators_:
        # find all nodes where this feature was used
        tree_feature = tree.tree_.feature
        threshold = tree.tree_.threshold
        
        for node_id, feat_idx in enumerate(tree_feature):
            if feat_idx == feature_idx:
                if player_value > threshold[node_id]:
                    high_count += 1
                else:
                    low_count += 1
    
    return "high" if high_count >= low_count else "low"



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
    df = pd.read_csv("player_stats_2v2.csv")
    df_copy = df.copy()

    COLS_TO_CALC = [x[:-4] for x in ML_COLS]

    cols_to_calc = df[COLS_TO_CALC]
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

    # prototype = joblib.load("model_prototype.joblib")
    # df_copy = df_copy[ML_COLS].drop(columns=["rank-no"])
    # feature_order = prototype.feature_names_in_
    # df_model = df_copy[feature_order] # reordering because scikit strict
    # df["prototype-prediction"] = prototype.predict(df_model)

    return df.to_dict(orient="records")

@app.post("/api/label_player/{row_index}")
def label_player(row_index: int, label: str):
    file = "player_stats_2v2.csv"
    df = pd.read_csv(file)

    if row_index not in df["index"].values:
        return {"error": "Invalid row index"}

    if label == "delete":
        df = df[df["index"] != row_index]
        df.to_csv(file, index=False)
        return {"status": "success"}

    df.loc[df["index"] == row_index, "playstyle"] = label

    df.to_csv(file, index=False)

    return {"status": "success"}

@app.get("/api/rank_average/{rank}")
def get_rank_average(rank: str):
    df = pd.read_csv("player_stats_3v3_original.csv")
    rank_subset  = df[df["rank"] == rank]
    cols_to_calc = df.drop(columns=["rank", "rank-no", "player_id"])
    cols_to_calc = df[COMP_COLS]

    result = {"rank": rank, }

    for col in cols_to_calc:
        rank_avg = rank_subset[col].mean()
        percentile = (df[col] <= rank_avg).mean() * 100

        result[f"{col}_avg"] = rank_avg
        result[f"{col}_percentile"] = percentile

    return result

@app.post("/api/user_percentiles/{rank}")
async def get_user_percentiles(radar: RadarData, rank: str):

    df = pd.read_csv("player_stats_3v3_original.csv")

    percentiles_all = {
        "core": [],
        "boost": [],
        "movement": [],
        "positioning": [],
    }

    percentiles_rank = {
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
        percentile_all = (df[col] <= item.You_Original).mean() * 100
        percentile_rank = (df.loc[df["rank"] == rank][col] <= item.You_Original).mean() * 100
        percentiles_all["core"].append(percentile_all)
        percentiles_rank["core"].append(percentile_rank)

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
        percentile_all = (df[col] <= item.You_Original).mean() * 100
        percentile_rank = (df.loc[df["rank"] == rank][col] <= item.You_Original).mean() * 100
        percentiles_all["boost"].append(percentile_all)
        percentiles_rank["boost"].append(percentile_rank)

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
        percentile_all = (df[col] <= item.You_Original).mean() * 100
        percentile_rank = (df.loc[df["rank"] == rank][col] <= item.You_Original).mean() * 100
        percentiles_all["movement"].append(percentile_all)
        percentiles_rank["movement"].append(percentile_rank)

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
        percentile_all = (df[col] <= item.You_Original).mean() * 100
        percentile_rank = (df.loc[df["rank"] == rank][col] <= item.You_Original).mean() * 100
        percentiles_all["positioning"].append(percentile_all)
        percentiles_rank["positioning"].append(percentile_rank)

    return {"percentiles_all": percentiles_all, "percentiles_rank":percentiles_rank}

def temperature_scaled_proba(model, df, T=2.0):
    logits = model.decision_function(df)
    scaled = logits / T
    e = np.exp(scaled - scaled.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

@app.post("/api/playstyle/{mode}")
def get_playstyle(player: PlayerStats, mode: int):

    df = pd.DataFrame(player.dict(), index=[0])
    df = df.rename(columns={"rank_no": "rank-no"})
    stat_cols = [col.replace("_pct", "") for col in ML_COLS]
    for col in stat_cols:
        df[f"{col}_pct"] = compute_percentile(
            df[col].iloc[0], df["rank-no"].iloc[0], col, rank_stats
        )
    
    df = df[ML_COLS]

    if mode == 3:
        probs = model_3v3.predict_proba(df)
        # probs = temperature_scaled_proba(model_3v3, df, T=2.0)
        classes = model_3v3.classes_
        feature_names = df.columns.tolist()


    ordered_idx = np.argsort(probs[0])[::-1] # high to low
    ordered_classes = classes[ordered_idx]
    ordered_probs = probs[0][ordered_idx]

    # using shap to get feature importance
    explainer = shap.TreeExplainer(model_3v3)
    shap_values = explainer.shap_values(df)

    shap_top = shap_values[ordered_idx[0]][0]
    top_shap_idxs = np.argsort(shap_top)[::-1][:3] # top 5
    top_stats = [ {"feature": feature_names[i], "shap_value": shap_top[i], "feature_value": df.iloc[0][feature_names[i]], "direction": get_tree_threshold_direction(model_3v3, df, feature_names, feature_names[i])} for i in top_shap_idxs ]

    return {"ordered_classes": ordered_classes.tolist(), "ordered_probs": ordered_probs.tolist(), "top_stats": top_stats}

from format_ballchasing import ballchasing_mapping
@app.get("/api/ballchasing/{id}")
def get_ballchasing(id: str):
    replay_data = get_replay(id, TOKEN)

    if replay_data is None:
        return {"error": "Replay not found"}
    
    players = replay_data['blue']['players'] + replay_data['orange']['players']

    for player in replay_data['blue']['players']:
        player["team"] = "Blue"
    for player in replay_data['orange']['players']:
        player["team"] = "Orange"

    overtime = 0
    if replay_data['overtime']:
        overtime = replay_data['overtime_seconds'] / 60
    replay_duration = 5 + overtime
    if replay_duration < 300:
        replay_duration = replay_data['duration'] / 60

    players_formatted = []

    for player in players:
        player_data = {}
        player_data['id'] = player['id']['id']
        player_data['team'] = player['team']
        player_data['ballchasing'] = "Yes"
        player_data['duration'] = replay_duration
        for category in ballchasing_mapping.keys():
            for stat in ballchasing_mapping[category].keys():
                player_data[ballchasing_mapping[category][stat]] = player['stats'][category][stat]
        players_formatted.append(player_data)

    players_list = [{"name": player['name'], "id":player["id"]["id"]} for player in players]

    result = {"id": replay_data["rocket_league_id"], "players": players_list, "data": players_formatted}

    header = {"status": "success", "name": replay_data["title"], "players": players_list, "game_id": replay_data["rocket_league_id"]}

    return {"data": result, "header": header}