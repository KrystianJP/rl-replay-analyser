import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

df = pd.read_csv("player_stats_3v3.csv")

X = df.drop(columns=[
    "playstyle", "rank", "player_id", "index",
    "movement_percent_ground", "positioning_percent_farthest_from_ball",
    "positioning_percent_behind_ball", "movement_percent_supersonic_speed"
])
y = df["playstyle"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=1
)

model = make_pipeline(
    StandardScaler(),
    LogisticRegression(
        max_iter=2000,
        multi_class="multinomial",
        class_weight="balanced",
        random_state=1
    )
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
probs = model.predict_proba(X_test) # list of 
classes = model.named_steps["logisticregression"].classes_

top2_classes_list = []
top2_probs_list = []

for i in range(len(y_test)):
    top2_idx = np.argsort(probs[i])[-2:]
    top_classes = classes[top2_idx]
    top_probs = probs[i][top2_idx]
    # if 2nd is > 85% of 1st add both, otherwise add just top
    if top_probs[1] / top_probs[0] > 0.85:
        top2_classes_list.append(top_classes.tolist())
        top2_probs_list.append(top_probs.tolist())
    else:
        top2_classes_list.append([top_classes[1]])
        top2_probs_list.append([top_probs[1]])

top2_correct = np.sum([y_test.iloc[i] in top2_classes_list[i] for i in range(len(y_test))])
top2_acc = top2_correct / len(y_test)

print("Test Accuracy:", accuracy_score(y_test, y_pred))
print("Top-2 Accuracy:", top2_acc)
print(classification_report(y_test, y_pred))
print("-------------------")

cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=1)
cv_scores = cross_val_score(model, X_train, y_train, cv=cv)
print("CV mean/std:", cv_scores.mean(), cv_scores.std())

joblib.dump(model, "model_3v3.joblib")