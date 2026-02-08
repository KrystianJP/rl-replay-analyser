import requests
import random
import time

URL = "https://ballchasing.com/api/replays/"
TOKEN = "weVNZnKyOEu3PeMbGybQ8SPovXIUkQxAXguy6fDM"

DATA_STRUCTURE = {"boost":["bpm", "amount_used_while_supersonic", "count_collected_small", "count_collected_big", "percent_zero_boost", "percent_boost_0_25", "percent_full_boost", "count_stolen_big"],
    "movement":["avg_speed", "percent_supersonic_speed", "percent_ground", "percent_low_air", "percent_high_air"], "positioning": ["percent_most_back", "percent_most_forward", "percent_closest_to_ball", "percent_farthest_from_ball", "percent_behind_ball", "percent_infront_ball", "percent_defensive_third", "percent_neutral_third", "percent_offensive_third"], "demo":["inflicted", "taken"]}

def get_replay(id, token=TOKEN):
    time.sleep(0.5)
    r = requests.get(URL + id, headers={
                      'Authorization': token})

    if r.status_code == 200:
        return r.json()
    else:
        r.raise_for_status()

def get_player_replays(id, platform, count=10, token=TOKEN):
    r = requests.get(URL, headers={
                      'Authorization': token}, params={'player-id': f"{platform}:{id}", "count": count})

    if r.status_code == 200:
        data =  r.json()
        # filter replays less than 5 minutes
        return {'list': [replay for replay in data['list'] if replay['duration'] > 300]}
    else:
        r.raise_for_status()

def find_average_stats(players, replay_count=1):
    stats = {}
    for player in players:
        player_replays = get_player_replays(
            player['player_id'], player['platform'], count=replay_count)
        stats[player['player_name']] = average_stats(player_replays, player['player_id'])
    return stats

def average_stats(data, player_id):
    totals = {"boost": [0,0,0,0,0,0,0,0], "movement": [0,0,0,0,0], "positioning": [0,0,0,0,0,0,0,0,0], "demo": [0,0]}
    count = 0
    for replay in data['list']:
        replay_data =get_replay(replay['id'])
        overtime = 0
        if replay_data['overtime']:
            overtime = replay_data['overtime_seconds'] / 60
        replay_duration = 5 + overtime
        players = replay_data['blue']['players'] + replay_data['orange']['players']


        for player in players:
            if player['id']['id'] == player_id:

                for category in DATA_STRUCTURE:
                    for stat in DATA_STRUCTURE[category]:
                        # some require standardising
                        if stat in ["amount_used_while_supersonic", "count_collected_small", "count_collected_big", "count_stolen_big", "inflicted", "taken"]:
                            totals[category][DATA_STRUCTURE[category].index(stat)] += player['stats'][category][stat] / replay_duration
                        else:
                            totals[category][DATA_STRUCTURE[category].index(stat)] += player['stats'][category][stat]

                count += 1
    if count == 0:
        return
    
    # divide by count
    for category in DATA_STRUCTURE:
        for stat in DATA_STRUCTURE[category]:
            totals[category][DATA_STRUCTURE[category].index(stat)] = totals[category][DATA_STRUCTURE[category].index(stat)] / count

    return totals

def test_script(rank, count, each_player_count):
    players_list = []
    seen_player_ids = set()
    r = requests.get(URL, headers={
                      'Authorization': TOKEN}, params={"min-rank":rank, "max-rank": rank, "count": count, "playlist": "ranked-standard"})
    if r.status_code == 200:
        data = r.json()

        for replay in data['list']:
            players = replay['blue']['players'] + replay['orange']['players']

            for player in players:
                player_id = player['id']['id']
                if player_id not in seen_player_ids:
                    seen_player_ids.add(player_id)
                    players_list.append({
                        'player_name': player['name'],
                        'player_id': player_id,
                        'platform': player['id']['platform'],})
                    
        return find_average_stats(players_list, each_player_count)
    else:
        r.raise_for_status()



# print(test_script(rank="champion-3", count=1, each_player_count=4))
print(get_replay("0aaba5c2-ba9e-4a2d-8aac-b6a06e934eb6"))

