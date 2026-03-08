import logging
from .base import *
from carball.json_parser.actor_parsing import CarActor

logger = logging.getLogger(__name__)

class CarHandler(BaseActorHandler):
    type_name = 'Archetypes.Car.Car_Default'

    def update(self, actor: dict, frame_number: int, time: float, delta: float) -> None:
        # # Inside the update method, right after you look for the boost key ***
        # if 'TAGame.Car_TA:ReplicatedBoost' in actor:
        #     print(f"DEBUG 1 (Raw Actor): Frame {frame_number} - Found boost: {actor['TAGame.Car_TA:ReplicatedBoost']}")
        # else:
        #     # If this prints, your JSON keys don't match your code
        #     print(f"DEBUG 1 (Error): Frame {frame_number} - Boost key NOT found in actor keys: {actor.keys()}")

        if 'Engine.Pawn:PlayerReplicationInfo' not in actor:
            return

        player_actor_id = actor['Engine.Pawn:PlayerReplicationInfo']['actor']
        if player_actor_id == -1:
            self.add_demo(actor, frame_number)
            return

        self.parser.player_car_ids[player_actor_id] = actor['Id']
        self.parser.car_player_ids[actor['Id']] = player_actor_id

        # --- EXPLICIT BOOST EXTRACTION FOR MODERN REPLAYS ---
        boost_float = 0.0
        boost_active = False
        
        # Check the modern key location
        if 'TAGame.Car_TA:ReplicatedBoost' in actor:
            boost_attr = actor['TAGame.Car_TA:ReplicatedBoost']
            if isinstance(boost_attr, dict):
                # Modern dictionary format: {"amount": 255, "active": 1, ...}
                # We extract the raw 0-255 value for the Analysis Engine
                boost_float = float(boost_attr.get('amount', boost_attr.get('boost_amount', 0)))
                boost_active = bool(boost_attr.get('active', 0) % 2 == 1)
                
                # Handle pickup detection via grant_count
                grant_count = boost_attr.get('grant_count', 0)
                if not hasattr(self, '_last_grant_count'): self._last_grant_count = {}
                if actor['Id'] in self._last_grant_count:
                    if grant_count > self._last_grant_count[actor['Id']]:
                        self.parser.player_data[player_actor_id][frame_number]['boost_collect'] = True
                self._last_grant_count[actor['Id']] = grant_count
            else:
                # Legacy integer format
                boost_float = float(boost_attr)

        # --- DATA INJECTION ---
        # We manually inject into the frame data AND the actor data_dict
        # to ensure the Pandas DataFrame columns are created correctly.
        RBState = actor.get(REPLICATED_RB_STATE_KEY, {})
        if not RBState.get('sleeping', True):
            self.parser.current_car_ids_to_collect.append(actor['Id'])
            
            # Get basic physics (pos, rot, vel)
            data_dict = CarActor.get_data_dict(actor)
            
            # OVERWRITE 'boost' keys with our manually extracted float values
            # This prevents the "Dictionary in DataFrame" error
            data_dict['boost'] = boost_float
            data_dict['boost_active'] = boost_active
            
            # Save to the parser
            if frame_number not in self.parser.player_data[player_actor_id]:
                self.parser.player_data[player_actor_id][frame_number] = {}
                
            self.parser.player_data[player_actor_id][frame_number].update(data_dict)

    def add_demo(self, actor, frame_number):
        demo_key = None
        if 'TAGame.Car_TA:ReplicatedDemolish' in actor:
            demo_key = 'TAGame.Car_TA:ReplicatedDemolish'
        elif 'TAGame.Car_TA:ReplicatedDemolishExtended' in actor:
            demo_key = 'TAGame.Car_TA:ReplicatedDemolishExtended'

        if demo_key:
            demo_data = actor[demo_key]
            
            def get_id(field_data):
                if isinstance(field_data, dict):
                    return field_data.get('actor')
                return field_data

            raw_attacker = demo_data.get('attacker_pri') or demo_data.get('attacker')
            raw_victim = demo_data.get('victim')

            attacker_id = get_id(raw_attacker)
            victim_id = get_id(raw_victim)

            if attacker_id is not None and victim_id is not None:
                try:
                    attacker_player_id = self.parser.car_player_ids.get(attacker_id) or attacker_id
                    victim_player_id = self.parser.car_player_ids.get(victim_id) or victim_id

                    if attacker_player_id in self.parser.player_dicts and victim_player_id in self.parser.player_dicts:
                        demo_record = {
                            'attacker_player_id': attacker_player_id,
                            'victim_player_id': victim_player_id,
                            'frame_number': frame_number
                        }
                        # Include velocities if they exist, otherwise use 0 to prevent KeyError later
                        demo_record['attack_velocity'] = demo_data.get('attack_velocity', {'x': 0, 'y': 0, 'z': 0})
                        demo_record['victim_velocity'] = demo_data.get('victim_velocity', {'x': 0, 'y': 0, 'z': 0})
                        
                        self.parser.demos_data.append(demo_record)
                        actor.pop(demo_key)
                except Exception as e:
                    pass