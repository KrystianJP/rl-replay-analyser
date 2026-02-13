import requests
import time
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

URL = "https://ballchasing.com/api/replays/"
TOKEN = os.getenv("BALLCHASING_TOKEN")
output_file = "player_stats.csv"

RANK_TO_INT = {
    "bronze-1": 1,
    "bronze-2": 2,
    "bronze-3": 3,

    "silver-1": 4,
    "silver-2": 5,
    "silver-3": 6,

    "gold-1": 7,
    "gold-2": 8,
    "gold-3": 9,

    "platinum-1": 10,
    "platinum-2": 11,
    "platinum-3": 12,

    "diamond-1": 13,
    "diamond-2": 14,
    "diamond-3": 15,

    "champion-1": 16,
    "champion-2": 17,
    "champion-3": 18,

    "grand-champion-1": 19,
    "grand-champion-2": 20,
    "grand-champion-3": 21,

    "supersonic-legend": 22
}


DATA_STRUCTURE = {"core": ["shots", "goals", "saves", "assists", "shooting_percentage"],"boost":["bpm", "amount_used_while_supersonic", "count_collected_small", "count_collected_big", "percent_zero_boost", "percent_boost_0_25", "percent_full_boost", "count_stolen_big"],
    "movement":["avg_speed_percentage", "percent_supersonic_speed", "percent_ground", "percent_low_air", "percent_high_air"], "positioning": ["percent_most_back", "percent_most_forward", "percent_closest_to_ball", "percent_farthest_from_ball", "percent_behind_ball", "percent_infront_ball", "percent_defensive_third", "percent_neutral_third", "percent_offensive_third"], "demo":["inflicted", "taken"]}

def safe_get(url, headers, params={}, sleep_time=0.5):
    while True:
        r = requests.get(url, headers=headers, params=params)
        
        if r.status_code == 429:
            print("Rate limited. Sleeping 10 seconds")
            time.sleep(10)
            continue
        
        r.raise_for_status()
        time.sleep(sleep_time)
        return r

def get_replay(id, token=TOKEN):
    r = safe_get(URL + id, headers={
                      'Authorization': token})

    if r.status_code == 200:
        return r.json()
    else:
        r.raise_for_status()

def get_player_replays(id, platform, count=10, token=TOKEN):
    r = safe_get(URL, headers={
                      'Authorization': token}, params={'player-id': f"{platform}:{id}", "count": count*4, "playlist": "ranked-standard"})

    if r.status_code == 200:
        data =  r.json()
        # filter replays less than 5 minutes
        filtered_replays = [replay for replay in data['list'] if replay['duration'] > 300]
        return {'list': filtered_replays[:count]}
    else:
        r.raise_for_status()

def find_average_stats(players):
    rows = []
    for player in players:
        
        player_data = average_stats(player['replays'], player['player_id'])
        row = {"rank": player['rank'], "rank-no": RANK_TO_INT[player['rank']], "player_id": player['player_id'], "player_name": player['player_name']}
        for category in DATA_STRUCTURE:
            for j,stat in enumerate(DATA_STRUCTURE[category]):
                row[f"{category}_{stat}"] = player_data[category][j]
        rows.append(row)

    return rows

def average_stats(data, player_id):
    totals = {"core": [0,0,0,0,0],"boost": [0,0,0,0,0,0,0,0], "movement": [0,0,0,0,0], "positioning": [0,0,0,0,0,0,0,0,0], "demo": [0,0]} # 6th core value is assist to goal ratio
    count = 0
    for replay in data['list']:
        replay_data =get_replay(replay['id'])
        overtime = 0
        if replay_data['overtime']:
            overtime = replay_data['overtime_seconds'] / 60
        replay_duration = 5 + overtime

        players = replay_data['blue']['players'] + replay_data['orange']['players']

        blue_goals = replay_data["blue"]['stats']['core']["goals"]
        orange_goals = replay_data["orange"]['stats']['core']["goals"]

        for i,player in enumerate(players):
            if player['id']['id'] == player_id:

                if i <= len(players)//2 - 1: # blue
                    goals = blue_goals
                else:
                    goals = orange_goals

                for category in DATA_STRUCTURE:
                    for j,stat in enumerate(DATA_STRUCTURE[category]):
                        # some require standardising
                        if stat in ["amount_used_while_supersonic", "count_collected_small", "count_collected_big", "count_stolen_big", "inflicted", "taken", "saves", "shots"]:
                            totals[category][j] += player['stats'][category][stat] / replay_duration
                        elif stat == "goals":
                            totals["core"][1] += 100 / (len(players)//2) if goals == 0 else player['stats'][category][stat] * 100 / goals # average if no goals
                        elif stat == "assists":
                            totals["core"][3] += 100 / (len(players)//2) if goals == 0 else player['stats'][category][stat] * 100 / goals
                        else:
                            totals[category][j] += player['stats'][category][stat]

                count += 1
    if count == 0:
        return totals
    
    # divide by count
    for category in DATA_STRUCTURE:
        for i,stat in enumerate(DATA_STRUCTURE[category]):
            totals[category][i] = int(totals[category][i] * 1000 / count) / 1000

    return totals

def test_script(rank, count, each_player_count):
    players_list = []
    seen_player_ids = set()
    r = safe_get(URL, headers={
                      'Authorization': TOKEN}, params={"min-rank":rank, "max-rank": rank, "count": 10, "playlist": "ranked-standard"})
    if r.status_code == 200:
        data = r.json()

        for replay in data['list']:
            players = replay['blue']['players'] + replay['orange']['players']

            for player in players:

                player_replays = get_player_replays(
                    player['id']['id'],  platform=player['id']['platform'], count=each_player_count)
                
                if len(player_replays['list']) < each_player_count:
                    continue

                player_id = player['id']['id']
                if player_id not in seen_player_ids:
                    seen_player_ids.add(player_id)
                    players_list.append({
                        'player_name': player['name'],
                        'player_id': player_id,
                        'platform': player['id']['platform'],
                        'replays': player_replays,
                        'rank': rank
                        })
                    
                    if len(players_list) == count:
                        return find_average_stats(players_list)
     
        
    else:
        r.raise_for_status()

ranks = ["platinum-1", "platinum-2", "platinum-3", "diamond-1", "diamond-2", "diamond-3", "champion-1", "champion-2", "champion-3"]

start = time.time()

for rank in ranks:
    result = test_script(rank=rank, count=6, each_player_count=3)

    if result:
        df = pd.DataFrame(result)
        df.to_csv(
            output_file,
            mode='a',
            header=not os.path.isfile(output_file),
            index=False
        )


print(f"Time taken: {time.time() - start}")

# print(get_replay("0aaba5c2-ba9e-4a2d-8aac-b6a06e934eb6"))

