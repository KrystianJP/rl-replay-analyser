import pandas as pd

df = pd.read_csv("player_stats_3v3.csv")
df.insert(0, "index", range(1, len(df) + 1))
df.to_csv("player_stats_3v3.csv", index=False)