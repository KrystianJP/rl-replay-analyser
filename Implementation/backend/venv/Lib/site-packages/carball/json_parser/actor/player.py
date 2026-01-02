import logging
from .base import BaseActorHandler

logger = logging.getLogger(__name__)

class PlayerHandler(BaseActorHandler):
    type_name = 'TAGame.Default__PRI_TA'

    def update(self, actor: dict, frame_number: int, time: float, delta: float) -> None:
        if 'Engine.PlayerReplicationInfo:PlayerName' not in actor:
            return

        actor_id = actor['Id']
        player_dict = {
            'name': actor["Engine.PlayerReplicationInfo:PlayerName"],
        }
        
        # Conditionally add ['team'] key to player_dict
        player_team = actor.get("Engine.PlayerReplicationInfo:Team", {}).get('actor', None)
        if player_team is not None and player_team != -1:
            player_dict['team'] = player_team

        # --- MODERN ID RESOLUTION ENGINE ---
        if "Engine.PlayerReplicationInfo:UniqueId" in actor:
            try:
                # 1. Identify the platform/actor type
                remote_id_map = actor["Engine.PlayerReplicationInfo:UniqueId"].get('remote_id', {})
                actor_type = list(remote_id_map.keys())[0] if remote_id_map else "Unknown"

                unique_id = None
                actor_name = actor["Engine.PlayerReplicationInfo:PlayerName"]

                # 2. Look for the real ID in PlayerStats (handles the "ID 0" issue)
                if 'PlayerStats' in self.parser.game.properties:
                    for player_stat in self.parser.game.properties['PlayerStats']:
                        if actor_name == player_stat.get('Name'):
                            # Check for Epic Account ID first (Modern Standard)
                            epic_id = player_stat.get('PlayerID', {}).get('fields', {}).get('EpicAccountId')
                            online_id = str(player_stat.get('OnlineID', '0'))
                            
                            if epic_id:
                                unique_id = str(epic_id)
                            elif online_id != "0":
                                unique_id = online_id
                            break

                # 3. Fallback to the remote_id if metadata lookup failed
                if unique_id is None and actor_type in remote_id_map:
                    # Handle Epic/PsyNet nested structure or raw ID
                    val = remote_id_map[actor_type]
                    unique_id = str(val.get('name', val)) if isinstance(val, dict) else str(val)

                # 4. Resolve Party Leader using the same logic
                leader = None
                if "TAGame.PRI_TA:PartyLeader" in actor and actor["TAGame.PRI_TA:PartyLeader"] is not None:
                    leader_info = actor["TAGame.PRI_TA:PartyLeader"].get("remote_id", {})
                    if leader_info:
                        leader_type = list(leader_info.keys())[0]
                        leader_val = leader_info[leader_type]
                        
                        # Use name matching for leaders too if they are Epic users
                        if leader_type in ["PlayStation", "PsyNet", "Epic"]:
                            l_name = leader_val.get('name') if isinstance(leader_val, dict) else None
                            if l_name:
                                for p_stat in self.parser.game.properties.get('PlayerStats', []):
                                    if l_name == p_stat.get('Name'):
                                        leader = p_stat.get('PlayerID', {}).get('fields', {}).get('EpicAccountId') or str(p_stat.get('OnlineID'))
                        
                        if leader is None:
                            leader = str(leader_val.get('name', leader_val)) if isinstance(leader_val, dict) else str(leader_val)

                # 5. Store in parties
                if leader:
                    if leader in self.parser.parties:
                        if unique_id and unique_id not in self.parser.parties[leader]:
                            self.parser.parties[leader].append(unique_id)
                    else:
                        self.parser.parties[leader] = [unique_id] if unique_id else []

            except (KeyError, IndexError, AttributeError) as e:
                logger.warning(f'Could not resolve ID/Party for actor {actor_id}: {str(e)}')

        # --- REGISTRATION ---
        if actor_id not in self.parser.player_dicts:
            self.parser.player_dicts[actor_id] = player_dict
            logger.debug('Found player actor: %s (id: %s)' % (player_dict['name'], actor_id))
            self.parser.player_data[actor_id] = {}

        self.parser.player_data[actor_id][frame_number] = {}

        # Update player_dicts with current actor state
        for _k, _v in {**actor, **player_dict}.items():
            self.parser.player_dicts[actor_id][_k] = _v

        # Update Ping and Camera
        if delta != 0:
            self