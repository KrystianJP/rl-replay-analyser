import json

def parse_rrrocket_json(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

    # 1. Map Object IDs to Pad Sizes
    # We scan the 'objects' list in the JSON to find the internal IDs for pads
    objects = data.get('objects', [])
    big_pad_ids = [i for i, obj in enumerate(objects) if "BoostPadFull" in obj]
    small_pad_ids = [i for i, obj in enumerate(objects) if "BoostPadSmall" in obj]

    # 2. Map Actor IDs to their Class (e.g., Actor 50 is a 'Full' pad)
    actor_to_type = {}
    network_frames = data.get('network_frames', {})
    for frame in network_frames.get('frames', []):
        for update in frame.get('new_actors', []):
            a_id = update['actor_id']
            o_id = update['object_id']
            if o_id in big_pad_ids:
                actor_to_type[a_id] = "LARGE"
            elif o_id in small_pad_ids:
                actor_to_type[a_id] = "SMALL"

    # 3. State Tracking for Players
    pri_to_name = {}
    car_to_pri = {}
    stats = {}
    last_pickup_frame = {} 

    for p in data['properties'].get('PlayerStats', []):
        stats[p['Name']] = {'demos': 0, 'small_pads': 0, 'large_pads': 0}

    # 4. Process Frames for Events
    for frame in network_frames.get('frames', []):
        f_num = frame.get('number', 0)
        for update in frame.get('updated_actors', []):
            actor_id = update.get('actor_id')
            attr = update.get('attribute', {})

            # Bridge Building
            if "String" in attr and attr["String"] in stats:
                pri_to_name[actor_id] = attr["String"]
            if "ActiveActor" in attr:
                target = attr["ActiveActor"].get("actor")
                if target in pri_to_name:
                    car_to_pri[actor_id] = pri_to_name[target]
                elif target in car_to_pri:
                    car_to_pri[actor_id] = car_to_pri[target]

            # Demos
            if "DemolishExtended" in attr:
                attacker_id = attr["DemolishExtended"].get('attacker_pri', {}).get('actor')
                name = pri_to_name.get(attacker_id)
                if name:
                    stats[name]['demos'] += 1

            # THE PICKUP LOGIC
            # If the pad actor (actor_id) triggers 'PickupNew', it means it was taken
            if "TAGame.VehiclePickup_TA:PickupNew" in attr or "PickupNew" in attr:
                pickup_info = attr.get("TAGame.VehiclePickup_TA:PickupNew") or attr.get("PickupNew")
                car_id = pickup_info.get('instigator') # Actor ID of the car
                
                # Check if we know this car and the pad type
                player_name = car_to_pri.get(car_id)
                pad_type = actor_to_type.get(actor_id)

                if player_name and pad_type:
                    # Prevent multi-counting the same frame
                    if f_num != last_pickup_frame.get((player_name, actor_id)):
                        if pad_type == "LARGE":
                            stats[player_name]['large_pads'] += 1
                        else:
                            stats[player_name]['small_pads'] += 1
                        last_pickup_frame[(player_name, actor_id)] = f_num

    return stats

# --- Final Execution ---
results = parse_rrrocket_json('replay.json')
print("\n--- Final Stats (Class-Based Detection) ---")
print(f"{'Player':<20} | {'Demos':<5} | {'Small':<6} | {'Large':<6}")
print("-" * 50)
for player, s in results.items():
    print(f"{player:<20} | {s['demos']:<5} | {s['small_pads']:<6} | {s['large_pads']:<6}")