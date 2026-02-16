import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib

df = pd.read_csv("player_stats_prototype.csv")

X = df.drop(columns=["playstyle", "rank", "player_id", "player_name"])
y = df["playstyle"]

model = make_pipeline(
    StandardScaler(),
    LogisticRegression(
        max_iter=2000,
        multi_class="multinomial",
        class_weight="balanced",
        random_state=1
    )
)

model2 = RandomForestClassifier(
    n_estimators=200,
    max_depth=5,
    min_samples_leaf=3,
    random_state=1,
    class_weight="balanced"
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=1)
scores = cross_val_score(model, X, y, cv=cv)

scores2 = cross_val_score(model2, X, y, cv=cv)

print("Logistic Regression Results")
print(scores.mean())
print(scores.std())
print("-------------------")
print("Random Forest Results")
print(scores2.mean())
print(scores2.std())
print("-------------------")

model.fit(X, y)
joblib.dump(model, "model_prototype.joblib")

feature_names = X.columns
logreg = model.named_steps["logisticregression"]
coefs = logreg.coef_
classes = logreg.classes_
for i, class_name in enumerate(classes):
    print(f"\n=== {class_name} ===")
    
    class_coefs = coefs[i]
    
    top_positive = np.argsort(class_coefs)[-5:]
    top_negative = np.argsort(class_coefs)[:5]
    
    print("Top positive features:")
    for idx in reversed(top_positive):
        print(f"  {feature_names[idx]}: {class_coefs[idx]:.3f}")
    
    print("Top negative features:")
    for idx in top_negative:
        print(f"  {feature_names[idx]}: {class_coefs[idx]:.3f}")