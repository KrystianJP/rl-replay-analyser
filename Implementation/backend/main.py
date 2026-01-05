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
    analysis_manager.create_analysis()
    proto = analysis_manager.get_protobuf_data()

    return proto


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headers
)

@app.post("/api/upload")
async def upload_replay(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".replay") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file.flush()

        try:
            proto = get_replay_proto(temp_file.name)
            playlist = get_playlist_name(proto.game_metadata.playlist)
            map_name = get_map_name(proto.game_metadata.map)
            return {"playlist": playlist, "map": map_name, "date": datetime.fromtimestamp(proto.game_metadata.time).strftime("%Y-%m-%d")}
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Saved but failed to process replay: {e}")
    
    