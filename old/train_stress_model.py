import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join("C:\\Users\\ABHAY SINGH\\Downloads", "student_lifestyle_dataset.csv")
    MODEL_DIR = os.path.join(BASE_DIR, 'models')
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Loading dataset from:", DATA_PATH)
    if not os.path.exists(DATA_PATH):
        print("Dataset not found! Please check the path.")
        return

    df = pd.read_csv(DATA_PATH)
    print("Dataset shape:", df.shape)

    target = 'Stress_Level'
    features = ['Study_Hours_Per_Day', 'Extracurricular_Hours_Per_Day', 'Sleep_Hours_Per_Day',
                'Social_Hours_Per_Day', 'Physical_Activity_Hours_Per_Day', 'GPA']

    # Keep only required columns
    df = df[features + [target]].dropna()

    X = df[features]
    y = df[target]

    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    joblib.dump(le, os.path.join(MODEL_DIR, 'stress_label_encoder.pkl'))

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'stress_scaler.pkl'))
    joblib.dump(features, os.path.join(MODEL_DIR, 'stress_feature_names.pkl'))

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)

    # Evaluation
    y_pred = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[Stress_Level] Classifier Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save model
    joblib.dump(rf_model, os.path.join(MODEL_DIR, 'stress_model.pkl'))
    print("\nSuccessfully saved stress_model and preprocessing artifacts to models/ directory!")

if __name__ == "__main__":
    main()
