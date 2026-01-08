from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import carball
import pandas as pd
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

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

RRROCKET_PATH = "./rrrocket.exe"

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

    # analyse with carball to get proto
    game = Game()
    game.initialize(loaded_json=replay_dict)
    analysis_manager = AnalysisManager(game)
    analysis_manager.create_analysis(clean=False)
    proto = analysis_manager.get_protobuf_data()

    return proto

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

    
    header = {
        "game_id": properties.get('id', ''),
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

@app.post("/api/upload")
def upload_replay(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".replay") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file.flush()

        try:
            proto = get_replay_proto(temp_file.name)  

            # fallback data
            playlist = get_playlist_name(proto.game_metadata.playlist)
            map_name = get_map_name(proto.game_metadata.map)
            date = datetime.fromtimestamp(proto.game_metadata.time).strftime("%Y-%m-%d")
            # check for actual name first
            if hasattr(proto.game_metadata, 'name') and proto.game_metadata.name != "None":
                return {"status": "name found", "name": proto.game_metadata.name +  " - " + playlist + " - " + date}
            
            replay_name = map_name + " - " + playlist + " - " + date
            return {"status": "no name", "name": replay_name}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Saved but failed to process replay: {e}")
    
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

            return {"status": "success", "name": replay_name}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get header: {e}")