import requests
import time
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

URL = "https://ballchasing.com/api/replays/"
TOKEN = os.getenv("BALLCHASING_TOKEN")
WAIT_TIME = 0.1

def safe_get(url, headers, params={}, sleep_time=0.25):
    while True:
        r = requests.get(url, headers=headers, params=params)
        
        if r.status_code == 429:
            print(f"Rate limited. Sleeping {WAIT_TIME} minutes")
            time.sleep(WAIT_TIME * 60)
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

print(get_replay("73f56936-2c47-4fae-81b8-01da4e2c6f6d"))
