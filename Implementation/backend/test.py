import os
import gc
import time
import pandas as pd
import traceback
import shutil

# Safe RLGym Parser
from rlgym_tools.rocket_league.replays.parsed_replay import ParsedReplay
# Accurate Carball Analysis
from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game

# --- CONFIGURATION ---
# Use absolute paths to prevent any "File Not Found" confusion
REPLAY_FILE = os.path.abspath("assets/example2.replay")
OUTPUT_CSV = "match_results_summary.csv"

def analyze_match_fixed(replay_path):
    print(f"--- Analyzing: {replay_path} ---")
    
    # FIX 1: Convert path to absolute string for Python 3.7 subprocess compatibility
    path_str = str(os.path.abspath(replay_path))
    
    replay_obj = None
    try:
        # FIX 2: Handle Windows PermissionError [WinError 32]
        # We try to load, and if it fails due to a lock, we force a GC collect
        for attempt in range(3):
            try:
                # rlgym-tools internally calls subprocess; str() is vital here
                replay_obj = ParsedReplay.load(path_str)
                break
            except (PermissionError, TypeError) as e:
                print(f"⚠️ System busy (Attempt {attempt+1}/3): {e}")
                gc.collect() # Force close any dangling file handles
                time.sleep(2) # Give Windows time to release the file
        
        if not replay_obj:
            print("❌ Critical Failure: Could not bypass Windows file lock.")
            return None

        print("✅ Replay parsed into memory.")

        # 3. Transfer data to Carball's Analysis engine
        game = Game()
        # rlgym_tools objects have a __dict__ that carball can ingest
        game.initialize(loaded_json=replay_obj.__dict__) 
        
        _analysis_manager = AnalysisManager(game)
        _analysis_manager.create_analysis()
        
        return _analysis_manager

    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        traceback.print_exc()
        return None

def export_stats_to_csv(analysis_manager, filename):
    proto = analysis_manager.get_protobuf_data()
    all_players_data = []

    for player in proto.players:
        # Checking for nested stats safely
        boost = getattr(player.stats, 'boost', None)
        dist = getattr(player.stats, 'distance', None)
        
        p_stats = {
            "name": player.name,
            "team": "Orange" if player.is_orange else "Blue",
            "goals": player.goals,
            "boost_usage": boost.boost_usage if boost else 0,
            "avg_boost": boost.average_boost_level if boost else 0,
            "distance": dist.total_distance if dist else 0
        }
        all_players_data.append(p_stats)

    df = pd.DataFrame(all_players_data)
    df.to_csv(filename, index=False)
    print(f"✅ Summary saved to: {filename}")

if __name__ == "__main__":
    # Ensure the assets folder exists for the script
    if not os.path.exists(REPLAY_FILE):
        print(f"❌ Error: Replay not found at {REPLAY_FILE}")
    else:
        analysis = analyze_match_fixed(REPLAY_FILE)
        if analysis:
            export_stats_to_csv(analysis, OUTPUT_CSV)