import pandas as pd

file_name = "player_stats_2v2.csv"

df = pd.read_csv(file_name)
df.insert(0, "index", range(1, len(df) + 1))
df.to_csv(file_name, index=False)