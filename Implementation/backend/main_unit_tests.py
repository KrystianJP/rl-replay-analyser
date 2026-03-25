import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app
import pandas as pd
from typing import List
from pydantic import BaseModel
import io

client = TestClient(app)

COMP_COLS = ["core_shots",
        "core_goals",
        "core_saves",
        "core_assists",
        "core_shooting_percentage",
        "boost_bpm",
        "boost_count_collected_small",
        "boost_count_collected_big",
        "boost_count_stolen_big",
        "boost_percent_zero_boost",
        "boost_percent_boost_0_25",
        "boost_percent_full_boost", 
        "movement_avg_speed_percentage",
        "movement_percent_supersonic_speed",
        "movement_percent_ground",
        "movement_percent_low_air",
        "movement_percent_high_air",
        "demo_taken",
        "demo_inflicted",
        "positioning_percent_most_back",
        "positioning_percent_most_forward",
        "positioning_percent_closest_to_ball",
        "positioning_percent_farthest_from_ball",
        "positioning_percent_behind_ball",
        "positioning_percent_infront_ball",
        "positioning_percent_defensive_third",
        "positioning_percent_offensive_third",
        ]

class StatItem(BaseModel):
    category: str
    You_Original: float

class RadarData(BaseModel):
    core: List[StatItem]
    boost: List[StatItem]
    movement: List[StatItem]
    positioning: List[StatItem]

class PlayerStats(BaseModel):
    rank_no: int

    core_shots: float
    core_goals: float
    core_saves: float
    core_assists: float
    core_shooting_percentage: float

    boost_bpm: float
    boost_count_stolen_big: float

    movement_avg_speed_percentage: float
    movement_percent_high_air: float

    positioning_percent_most_back: float
    positioning_percent_most_forward: float
    positioning_percent_farthest_from_ball: float
    positioning_percent_closest_to_ball: float
    positioning_percent_infront_ball: float
    positioning_percent_offensive_third: float
    positioning_percent_defensive_third: float

    demo_inflicted: float

# *** POST /api/upload - success, correct data returned, error if parse fails
class TestUpload:
    valid_res = client.post("/api/upload", files={"file": open("assets/new.replay", "rb")})

    def test_success(self):
        assert self.valid_res.status_code == 200
    def test_correct_data(self):
        csv = pd.read_csv(io.StringIO(self.valid_res.json()["csv"]))
        player = csv.loc[csv["id"] == "1df027d7976a4314b4591b4bd51812cf"].iloc[0].to_dict()
        assert player["averages_average_distance_from_center"] == 2148.02001953125
    def test_error(self):
        replay_file = open("requirements.txt", "rb")
        res = client.post("/api/upload", files={"file": replay_file})
        assert res.status_code == 500

# *** GET /api/header - basic details and name gotten of replay if exists, map name gotten instead of name if replay name empty, players list gotten, error if parse fails
class TestHeader:
    def test_valid_with_name(self):
        replay_file = open("assets/new.replay", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 200
        #{"status": "success", "name": replay_name, "players": header["players"], "game_id": header["game_id"]}
        json = res.json()
        assert json["name"] == "reset double bump - 3v3 - 2026-01-07"
        assert len(json["players"]) == 6
        assert json["game_id"] == "4E522A0C4AEF7095C5A5AAAAFCF29F52"

    def test_valid_no_name(self):
        replay_file = open("assets/example.replay", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 200
        json = res.json()
        assert json["name"] == "DFH Stadium (Stormy) - 3v3 - 2024-01-30"

    def test_invalid_file(self):
        replay_file = open("requirements.txt", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 500

# *** GET /api/rank_average/{rank} - success for both modes, averages and percentiles correctly, unknown rank handled
class TestRankAverage:
    def test_success(self):
        res1 = client.get("/api/rank_average/platinum-1?mode=2")
        res2 = client.get("/api/rank_average/platinum-1?mode=3")
        assert res1.status_code == 200
        assert res2.status_code == 200
    def test_averages_and_percentiles(self):
        res = client.get("/api/rank_average/platinum-1?mode=2")
        df = pd.read_csv("player_stats_2v2_original.csv")
        rank_subset  = df[df["rank"] == "platinum-1"]
        cols_to_calc = df.drop(columns=["rank", "rank-no", "player_id"])
        cols_to_calc = df[COMP_COLS]

        result = {"rank": "platinum-1" }

        for col in cols_to_calc:
            rank_avg = rank_subset[col].mean()
            percentile = (df[col] <= rank_avg).mean() * 100

            result[f"{col}_avg"] = rank_avg
            result[f"{col}_percentile"] = percentile

        assert res.json() == result
    def test_unknown_rank(self): # we want exception since this shouldn't ever happen
        res = client.get("/api/rank_average/unknown_rank?mode=2")
        assert res.status_code == 404

# *** POST /api/user_percentiles/{rank} - success, correct values, bad radar data handled, unknown rank handled
class TestUserPercentiles:
    radar = RadarData(
        core=[StatItem(category="shots", You_Original=50.0)],
        boost=[StatItem(category="bpm", You_Original=700.0)],
        movement=[StatItem(category="movement", You_Original=55.0)],
        positioning=[StatItem(category="positioning", You_Original=40.0)]
    )

    def test_success(self):
        res = client.post("/api/user_percentiles/platinum-1?mode=2", json=self.radar.dict())
        assert res.status_code == 200

    def test_correct_values(self):
        df = pd.read_csv("player_stats_2v2_original.csv")
        res = client.post("/api/user_percentiles/platinum-1?mode=2", json=self.radar.dict())
        percentiles_all = {
            "core": [],
            "boost": [],
            "movement": [],
            "positioning": [],
        }
        percentiles_rank = {
            "core": [],
            "boost": [],
            "movement": [],
            "positioning": [],
        }

        category_cols = [["core", "core_shots"], ["boost", "boost_bpm"], ["movement", "movement_avg_speed_percentage"], ["positioning", "positioning_percent_most_back"]]
        for category, col in category_cols:
            you_original = getattr(self.radar, category)[0].You_Original
            percentile_all = (df[col] <= you_original).mean() * 100
            percentile_rank = (df.loc[df["rank"] == "platinum-1"][col] <= you_original).mean() * 100
            percentiles_all[category].append(percentile_all)
            percentiles_rank[category].append(percentile_rank)

        assert res.json()["percentiles_rank"] == percentiles_rank

    def test_bad_radar_data(self):
        res = client.post("/api/user_percentiles/platinum-1?mode=3", json={"bad": "data"})
        assert res.status_code == 422
        
    def test_unknown_rank(self):
        res = client.post("/api/user_percentiles/unknown_rank?mode=2", json=self.radar.dict())
        assert res.status_code == 404


# *** POST /api/playstyle/{mode} - success, ordered classes probs sum to 1 and are in descending order, bad player data handled
class TestPlaystyle:
    player_stats = PlayerStats(
        rank_no=6,

        core_shots=3,
        core_goals=40,
        core_saves=1,
        core_assists=0.5,
        core_shooting_percentage=50,

        boost_bpm=500,
        boost_count_stolen_big=4,

        movement_avg_speed_percentage=50,
        movement_percent_high_air=50,

        positioning_percent_most_back=50,
        positioning_percent_most_forward=50,
        positioning_percent_farthest_from_ball=50,
        positioning_percent_closest_to_ball=50,
        positioning_percent_infront_ball=50,
        positioning_percent_offensive_third=50,
        positioning_percent_defensive_third=50,

        demo_inflicted=5,
    )

    def success(self):
        res = client.post("/api/playstyle/2", json=self.player_stats.dict())
        res2 = client.post("/api/playstyle/3", json=self.player_stats.dict())
        assert res.status_code == 200
        assert res2.status_code == 200
    def test_ordered_classes_probs_sum_to_1(self):
        res = client.post("/api/playstyle/2", json=self.player_stats.dict())
        assert sum(res.json()["ordered_probs"]) == 1
    def test_ordered_classes_probs_descending_order(self):
        res = client.post("/api/playstyle/2", json=self.player_stats.dict())
        ordered_probs = res.json()["ordered_probs"]
        correct_order = sorted(ordered_probs, reverse=True)
        assert ordered_probs == correct_order
    def test_invalid_player_data(self):
        res = client.post("/api/playstyle/2", json={"bad": "data"})
        assert res.status_code == 422

# *** GET /api/ballchasing/{id} - success, correct data returned, invalid id handled
class TestBallchasing:
    id = "4a84d9fb-60f4-4804-a6e9-942c7add3f60"
    def test_success(self):
        res = client.get("/api/ballchasing/" + self.id)
        assert res.status_code == 200
    def test_correct_data_returned(self):
        res = client.get("/api/ballchasing/" + self.id)
        assert res.json()["header"]["name"] == "2026-03-23.23.00 Cozmanic Ranked Standard Win"
    def test_invalid_id(self):
        res = client.get("/api/ballchasing/invalid_id")
        assert res.status_code == 404