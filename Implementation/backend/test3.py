import pandas as pd

df = pd.read_csv("player_stats.csv")
df.insert(0, "index", range(1, len(df) + 1))
df.to_csv("player_stats.csv", index=False)