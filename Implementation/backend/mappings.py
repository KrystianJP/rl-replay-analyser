PLAYLIST_MAP = {
    2: "Doubles (Casual)",
    3: "Standard (Casual)",
    6: "Private Match",
    11: "Doubles (Ranked)",
    13: "Standard (Ranked)",
}

MAP_MAP = {"arc_darc_p":"Starbase ARC (Aftermath)","arc_p":"Starbase ARC","arc_standard_p":"Starbase ARC (Standard)","bb_p":"Champions Field (NFL)","beach_night_grs_p":"Salty Shores (Salty Fest)","beach_night_p":"Salty Shores (Night)","beach_p":"Salty Shores","beachvolley":"Salty Shores (Volley)","chn_stadium_day_p":"Forbidden Temple (Day)","chn_stadium_p":"Forbidden Temple","cs_day_p":"Champions Field (Day)","cs_hw_p":"Rivals Arena","cs_p":"Champions Field","eurostadium_dusk_p":"Mannfield (Dusk)","eurostadium_night_p":"Mannfield (Night)","eurostadium_p":"Mannfield","eurostadium_rainy_p":"Mannfield (Stormy)","eurostadium_snownight_p":"Mannfield (Snowy)","farm_grs_p":"Farmstead (Pitched)","farm_hw_p":"Farmstead (Spooky)","farm_night_p":"Farmstead (Night)","farm_p":"Farmstead","farm_upsidedown_p":"Farmstead (The Upside Down)","ff_dusk_p":"Estadio Vida (Dusk)","fni_stadium_p":"Forbidden Temple (Fire & Ice)","haunted_trainstation_p":"Urban Central (Haunted)","hoopsstadium_p":"Dunk House","hoopsstreet_p":"The Block (Dusk)","ko_calavera_p":"Calavera","ko_carbon_p":"Carbon","ko_quadron_p":"Quadron","labs_basin_p":"Basin","labs_circlepillars_p":"Pillars","labs_corridor_p":"Corridor","labs_cosmic_p":"Cosmic","labs_cosmic_v4_p":"Cosmic","labs_doublegoal_p":"Double Goal","labs_doublegoal_v2_p":"Double Goal","labs_galleon_mast_p":"Galleon Retro","labs_galleon_p":"Galleon","labs_holyfield_p":"Loophole","labs_octagon_02_p":"Octagon","labs_octagon_p":"Octagon","labs_pillarglass_p":"Hourglass","labs_pillarheat_p":"Barricade","labs_pillarwings_p":"Colossus","labs_underpass_p":"Underpass","labs_underpass_v0_p":"Underpass","labs_utopia_p":"Utopia Retro","music_p":"Neon Fields","neotokyo_arcade_p":"Neo Tokyo (Arcade)","neotokyo_hax_p":"Neo Tokyo (Hacked)","neotokyo_p":"Neo Tokyo","neotokyo_standard_p":"Neo Tokyo (Standard)","neotokyo_toon_p":"Neo Tokyo (Comic)","outlaw_oasis_p":"Deadeye Canyon (Oasis)","outlaw_p":"Deadeye Canyon","park_bman_p":"Beckwith Park (Night)","park_night_p":"Beckwith Park (Midnight)","park_p":"Beckwith Park","park_rainy_p":"Beckwith Park (Stormy)","park_snowy_p":"Beckwith Park (Snowy)","shattershot_p":"Core 707","stadium_day_p":"DFH Stadium (Day)","stadium_foggy_p":"DFH Stadium (Stormy)","stadium_p":"DFH Stadium","stadium_race_day_p":"DFH Stadium (Circuit)","stadium_winter_p":"DFH Stadium (Snowy)","street_p":"Sovereign Heights (Dusk)","swoosh_p":"Champions Field (Nike FC)","throwbackhockey_p":"Throwback Stadium (Snowy)","throwbackstadium_p":"Throwback Stadium","trainstation_dawn_p":"Urban Central (Dawn)","trainstation_night_p":"Urban Central (Night)","trainstation_p":"Urban Central","trainstation_spooky_p":"Urban Central (Spooky)","underwater_grs_p":"AquaDome (Salty Shallows)","underwater_p":"Aquadome","utopiastadium_dusk_p":"Utopia Coliseum (Dusk)","utopiastadium_lux_p":"Utopia Coliseum (Gilded)","utopiastadium_p":"Utopia Coliseum","utopiastadium_snow_p":"Utopia Coliseum (Snowy)","wasteland_grs_p":"Wasteland (Pitched)","wasteland_night_p":"Wasteland (Night)","wasteland_night_s_p":"Wasteland (Standard, Night)","wasteland_p":"Wasteland","wasteland_s_p":"Wasteland (Standard)","woods_night_p":"Drift Woods (Night","woods_p":"Drift Woods"}

def rollback_map_name(map_code: str) -> str:
    parts = map_code.lower().split("_")
    if len(parts) < 3:
        return map_code
    if parts[0] + "_" + parts[2] in MAP_MAP:
        return MAP_MAP[parts[0] + "_" + parts[2]]
    return map_code

def get_playlist_name(playlist_id: int) -> str:
    return PLAYLIST_MAP.get(playlist_id, "Unknown / Illegal Playlist")

def get_map_name(map_code: str) -> str:
    return MAP_MAP.get(map_code.lower(), rollback_map_name(map_code))