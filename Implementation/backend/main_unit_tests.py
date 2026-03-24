import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)


# *** GET /api/header - basic details and name gotten of replay if exists, map name gotten instead of name if replay name empty, players list gotten, error if parse fails
class TestHeader:
    def valid_with_name(self):
        replay_file = open("assets/new.replay", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 200
        #{"status": "success", "name": replay_name, "players": header["players"], "game_id": header["game_id"]}
        json = res.json()
        assert json["name"] == "reset double bump - 3v3 - 2026-01-07"
        assert len(json["players"]) == 6
        assert json["game_id"] == "4E522A0C4AEF7095C5A5AAAAFCF29F52"

    def valid_no_name(self):
        replay_file = open("assets/example.replay", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 200
        json = res.json()
        assert json["name"] == "DFH Stadium (Stormy) - 3v3 - 2024-01-30"

    def invalid_file(self):
        replay_file = open("requirements.txt", "rb")
        res = client.post("/api/header", files={"file": replay_file})
        assert res.status_code == 500

# *** GET /api/rank_average/{rank} - success for both modes, averages and percentiles correctly, unknown rank handled
class TestRankAverage:
    def success(self):
        pass
    def averages_and_percentiles(self):
        pass
    def unknown_rank(self):
        pass

# *** POST /api/user_percentiles/{rank} - success, correct output structure, bad player data handled, unknown rank handled
class TestUserPercentiles:
    def success(self):
        pass
    def correct_output_structure(self):
        pass
    def bad_player_data(self):
        pass
    def unknown_rank(self):
        pass


# *** POST /api/playstyle/{mode} - success, ordered classes probs sum to 1 and are in descending order, bad player data handled
class TestPlaystyle:
    def success(self):
        pass
    def ordered_classes_probs_sum_to_1(self):
        pass
    def ordered_classes_probs_descending_order(self):
        pass
    def invalid_player_data(self):
        pass

# *** GET /api/ballchasing/{id} - success, correct data returned, invalid id handled
class TestBallchasing:
    def success(self):
        pass
    def correct_data_returned(self):
        pass
    def invalid_id(self):
        pass

# *** GET /api/stats_csv - success, percentiles calculated correctly, labelled rows filtered out
class TestStatsCSV:
    def success(self):
        pass
    def percentiles_calculated_correctly(self):
        pass
    def labelled_rows_filtered_out(self):
        pass

# *** POST /api/label_player/{row_index} - success, correct row labelled, invalid row index handled
class TestLabelPlayer:
    def success(self):
        pass
    def correct_row_labelled(self):
        pass
    def invalid_row_index(self):
        pass