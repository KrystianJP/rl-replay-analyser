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

X = df.drop(columns=[
    "playstyle", "rank", "player_id", "index",
    "movement_percent_ground", "positioning_percent_farthest_from_ball",
    "positioning_percent_behind_ball", "movement_percent_supersonic_speed"
])
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

def evaluate_model(model, name, X, y):
    print(f"\n===== {name} =====")

    y_pred = model.predict(X_test)
    probs = model.predict_proba(X_test)
    classes = model.classes_

    print("Test Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    # top-2 Accuracy
    top2_classes_list = []
    for i in range(len(y_test)):
        sorted_idx = np.argsort(probs[i])[::-1]  # descending
        top1_idx = sorted_idx[0]
        top2_idx = sorted_idx[1]
        
        top1_prob = probs[i][top1_idx]
        top2_prob = probs[i][top2_idx]
        
        top1_class = classes[top1_idx]
        top2_class = classes[top2_idx]
        
        # apply 0.85 threshold
        if top2_prob / top1_prob > 0.85:
            top2_classes_list.append([top1_class, top2_class])
        else:
            top2_classes_list.append([top1_class])
    
    top2_correct = np.sum([y_test.iloc[i] in top2_classes_list[i] for i in range(len(y_test))])
    print("Top-2 Accuracy (0.85 threshold):", top2_correct / len(y_test))

    # Cross-validation
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=1)
    cv_scores = cross_val_score(model, X, y, cv=cv)
    print("CV mean/std:", cv_scores.mean(), cv_scores.std())

evaluate_model(lr_model, "Logistic Regression", X, y)
evaluate_model(rf_model, "Random Forest Classifier", X, y)

lr_model.fit(X,y)
rf_model.fit(X,y)

class_means = X.groupby(y).mean()
class_means.to_json("class_means_3v3.json")

# joblib.dump(lr_model, "lr_model_3v3.joblib")
# joblib.dump(rf_model, "rf_model_3v3.joblib")