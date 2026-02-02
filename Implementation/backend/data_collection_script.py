import requests
import random
import time

URL = "https://ballchasing.com/api/replays/"
TOKEN = "weVNZnKyOEu3PeMbGybQ8SPovXIUkQxAXguy6fDM"

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
        return r.json()
    else:
        r.raise_for_status()

def find_average_speeds(players, replay_count=1):
    speeds = {}
    for player in players:
        player_replays = get_player_replays(
            player['player_id'], player['platform'], count=replay_count)
        speeds[player['player_name']] = average_speed(player_replays, player['player_id'])
    return speeds

def average_speed(data, player_id):
    total_speed = 0
    count = 0
    for replay in data['list']:
        replay_data =get_replay(replay['id'])
        players = replay_data['blue']['players'] + replay_data['orange']['players']

        for player in players:
            if player['id']['id'] == player_id:
                total_speed += player['stats']['movement']['avg_speed_percentage']
                count += 1

    return total_speed / count if count > 0 else 0

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
                    
        return find_average_speeds(players_list, each_player_count)
    else:
        r.raise_for_status()

print(test_script(rank="champion-3", count=1, each_player_count=4))