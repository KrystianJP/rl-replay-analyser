import carball
import pandas as pd
import json
import subprocess
import os
import traceback
from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game

# --- CONFIGURATION ---
REPLAY_FILE = "assets/example3.replay"  
RRROCKET_PATH = "./rrrocket.exe" 
OUTPUT_CSV = "match_results_summary.csv"

def analyze_match(replay_path):
    print(f"--- Processing: {replay_path} ---")
    
    if not os.path.exists(RRROCKET_PATH):
        print(f"❌ Error: {RRROCKET_PATH} not found.")
        return None

    # 1. Decompile .replay to JSON via rrrocket CLI
    try:
        result = subprocess.run(
            [RRROCKET_PATH, "-n", "--json-lines", replay_path], # Added -n here
            capture_output=True, 
            text=True, 
            check=True,
            encoding='utf-8'
        )
        replay_dict = json.loads(result.stdout.splitlines()[0])
        print("✅ Decompile successful.")
    except Exception as e:
        print(f"❌ Decompile failed: {e}")
        return None

    # 2. Initialize and Analyze
    game = Game()
    game.initialize(loaded_json=replay_dict)
    _analysis_manager = AnalysisManager(game)
    _analysis_manager.create_analysis()
    
    return _analysis_manager

def export_to_csv(analysis_manager, filename="master_high_level_stats.csv"):
    """
    Dynamically extracts EVERY stat found in the discovery phase.
    """
    proto = analysis_manager.get_protobuf_data()
    all_players_data = []

    for player in proto.players:
        # 1. Start with basic info
        player_dict = {
            "player_name": player.name,
            "team": "Orange" if player.is_orange else "Blue",
            "is_bot": player.is_bot,
            "score": player.score,
            "goals": player.goals,
            "assists": player.assists,
            "saves": player.saves,
            "shots": player.shots
        }

        # 2. Dynamically loop through every category in stats
        # This prevents the script from crashing if a field name changes
        for category_field, category_value in player.stats.ListFields():
            category_name = category_field.name
            
            if hasattr(category_value, "ListFields"):
                for stat_field, stat_value in category_value.ListFields():
                    # Check if the value is a complex sub-message (like carry_stats)
                    # If it's a simple number/bool, add it directly
                    if not hasattr(stat_value, "ListFields"):
                        column_name = f"{category_name}_{stat_field.name}"
                        player_dict[column_name] = stat_value
            else:
                player_dict[category_name] = category_value

        all_players_data.append(player_dict)

    # 3. Create DataFrame and clean up
    df = pd.DataFrame(all_players_data)
    
    # Optional: Fill missing stats with 0 (e.g. if a player had 0 kickoffs)
    df = df.fillna(0)
    
    df.to_csv(filename, index=False)
    print(f"✅ Master stats exported to: {filename}")
    print(f"Total metrics captured: {len(df.columns)}")

if __name__ == "__main__":
    try:
        analysis = analyze_match(REPLAY_FILE)
        if analysis:
            export_to_csv(analysis, OUTPUT_CSV)

    except Exception:
        traceback.print_exc()
