import subprocess
import json
import os
from datetime import datetime
from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game
from mappings import get_map_name, get_playlist_name

REPLAY_PATH = "assets/example2.replay" 
RRROCKET_PATH = "./rrrocket.exe"

def get_replay_metadata(file_path):
    print(f"--- Analyzing: {file_path} ---")
    
    try:
        result = subprocess.run(
            [RRROCKET_PATH, "-n", "--json-lines", file_path],
            capture_output=True, 
            text=True, 
            check=True,
            encoding='utf-8'
        )
        replay_dict = json.loads(result.stdout.splitlines()[0])
    except Exception as e:
        print(f"Decompile failed: {e}")
        return None

    game = Game()
    game.initialize(loaded_json=replay_dict)
    analysis_manager = AnalysisManager(game)
    analysis_manager.create_analysis()
    
    proto = analysis_manager.get_protobuf_data()
    
    metadata = {
        "game_mode_id": proto.game_metadata.playlist,
        "map_name": proto.game_metadata.map,
        "unix_timestamp": proto.game_metadata.time,
        "human_date": datetime.fromtimestamp(proto.game_metadata.time).strftime('%Y-%m-%d')
    }
    
    return metadata

if __name__ == "__main__":
    if not os.path.exists(REPLAY_PATH):
        print(f"Replay file not found at {REPLAY_PATH}")
    else:
        data = get_replay_metadata(REPLAY_PATH)
        if data:
            print("\n--- METADATA RESULTS ---")
            print(f"Playlist: {get_playlist_name(data['game_mode_id'])}")
            print(f"Map:         {get_map_name(data['map_name'])}")
            print(f"Date:        {data['human_date']}")
            print("------------------------")