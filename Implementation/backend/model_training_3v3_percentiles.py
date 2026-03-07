import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("player_stats_3v3.csv")

EXCLUDE_COLS = {
    "playstyle", "rank", "rank-no", "player_id", "index",
    "movement_percent_ground",
    "positioning_percent_behind_ball",
    "movement_percent_supersonic_speed"
}

stat_cols = [col for col in df.columns if col not in EXCLUDE_COLS]

print("Calculating percentiles...")
percentile_df = pd.DataFrame(index=df.index)

for col in stat_cols:
    percentile_col = []
    for i, row in df.iterrows():
        rank = row["rank-no"]
        group = df[df["rank-no"].isin([rank - 1, rank, rank + 1])]
        pct = (group[col] <= row[col]).mean() * 100
        percentile_col.append(pct)
    percentile_df[f"{col}_pct"] = percentile_col
    print(f"  Calculated: {col}")

print(f"\nTotal percentile features: {len(percentile_df.columns)}")

X = percentile_df
y = df["playstyle"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=1
)

lr_model = make_pipeline(
    StandardScaler(),
    LogisticRegression(
        max_iter=2000,
        multi_class="multinomial",
        class_weight="balanced",
        random_state=2
    )
)
lr_model.fit(X_train, y_train)

rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    class_weight="balanced",
    random_state=2,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)


def evaluate_model(model, name):
    print(f"\n===== {name} =====")
    y_pred = model.predict(X_test)
    probs = model.predict_proba(X_test)
    classes = model.classes_

    print("Test Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    top2_classes_list = []
    for i in range(len(y_test)):
        sorted_idx = np.argsort(probs[i])[::-1]
        top1_idx = sorted_idx[0]
        top2_idx = sorted_idx[1]

        top1_prob = probs[i][top1_idx]
        top2_prob = probs[i][top2_idx]

        top1_class = classes[top1_idx]
        top2_class = classes[top2_idx]

        if top2_prob / top1_prob > 0.85:
            top2_classes_list.append([top1_class, top2_class])
        else:
            top2_classes_list.append([top1_class])

    top2_correct = np.sum([y_test.iloc[i] in top2_classes_list[i] for i in range(len(y_test))])
    print("Top-2 Accuracy (0.85 threshold):", top2_correct / len(y_test))

    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=1)
    cv_scores = cross_val_score(model, X, y, cv=cv)
    print("CV mean/std:", cv_scores.mean(), cv_scores.std())


evaluate_model(lr_model, "Logistic Regression")
evaluate_model(rf_model, "Random Forest Classifier")

lr_model.fit(X, y)
rf_model.fit(X, y)

joblib.dump(lr_model, "lr_model_3v3.joblib")
joblib.dump(rf_model, "rf_model_3v3.joblib")

# store so that can be calculated for user
import json

rank_stats = {}
for rank in df["rank-no"].unique():
    rank_stats[int(rank)] = {}
    for col in stat_cols:
        group = df[df["rank-no"].isin([rank - 1, rank, rank + 1])][col].tolist()
        rank_stats[int(rank)][col] = group

with open("rank_stats_3v3_all.json", "w") as f:
    json.dump(rank_stats, f)

