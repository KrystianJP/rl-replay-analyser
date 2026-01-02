import subprocess
import json
import pandas as pd

def get_stats_with_demos(replay_path):
    # RUN WITHOUT '-n' TO GET FULL DATA
    result = subprocess.run(
        ["rrrocket.exe", "--json-lines", replay_path],
        capture_output=True, text=True, encoding='utf-8'
    )
    
    data = json.loads(result.stdout.strip())
    
    # 1. Get the base stats
    player_stats = data.get('properties', {}).get('PlayerStats', [])
    df = pd.DataFrame(player_stats)

    # 2. Check if Demolitions is already there
    if 'Demolitions' not in df.columns:
        df['Demolitions'] = 0

    # 3. EXTRA CREDIT: Check the 'Events' or 'Frames' for Demo triggers
    # This is how Ballchasing does it if the header is empty.
    return df

df = get_stats_with_demos("assets/example3.replay")
print(df[['Name', 'Score', 'Goals', 'Demolitions']])