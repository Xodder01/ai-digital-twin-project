import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os

os.makedirs('models', exist_ok=True)

def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    # Generate realistic student data
    sleep_hours = np.random.normal(7, 1.5, num_samples).clip(3, 12)
    study_hours = np.random.normal(5, 2, num_samples).clip(0, 14)
    screen_time_hours = np.random.normal(4, 2, num_samples).clip(1, 12)
    stress_level = np.random.normal(5, 2, num_samples).clip(1, 10)
    
    # Calculate a mock productivity score (0-100)
    productivity_score = (
        (study_hours * 5) + 
        (sleep_hours * 4) - 
        (screen_time_hours * 2) - 
        (stress_level * 3) +
        np.random.normal(0, 5, num_samples) # noise
    )
    # Normalize productivity score to 0-100
    productivity_score = ((productivity_score - productivity_score.min()) / 
                          (productivity_score.max() - productivity_score.min()) * 100)
    
    # Calculate a mock burnout risk (binary 0 or 1)
    burnout_probability = (stress_level * 0.1) + ((10 - sleep_hours) * 0.05) + (screen_time_hours * 0.02)
    burnout_risk = (burnout_probability > 0.65).astype(int)
    
    # Calculate EXAM SCORE (0-100) mathematically
    # Boosted multiplier so 14 hours of study guarantees a 95-100%
    exam_score = (
        (study_hours * 8.0) +
        (sleep_hours * 3.5) -
        (stress_level * 2.0) -
        (screen_time_hours * 2.0) +
        np.random.normal(5, 3, num_samples) # Bias
    )
    exam_score = np.clip(exam_score, 0, 100)

    # Calculate FOCUS INDEX (1-10) weighted negatively by screen time/stress
    focus_index = (
        10 - 
        (screen_time_hours * 0.5) - 
        (stress_level * 0.4) + 
        (sleep_hours * 0.1) +
        np.random.normal(0, 0.4, num_samples)
    )
    focus_index = np.clip(focus_index, 1.0, 10.0)

    data = pd.DataFrame({
        'sleep_hours': sleep_hours,
        'study_hours': study_hours,
        'screen_time_hours': screen_time_hours,
        'stress_level': stress_level,
        'productivity_score': productivity_score,
        'burnout_risk': burnout_risk,
        'exam_score': exam_score,
        'focus_index': focus_index
    })
    
    data.to_csv('synthetic_student_data.csv', index=False)
    print("Dataset generated and saved as synthetic_student_data.csv")
    return data

def train_and_save_models(df):
    features = ['sleep_hours', 'study_hours', 'screen_time_hours', 'stress_level']
    X = df[features]
    
    # Productivity Model (Regression)
    y_prod = df['productivity_score']
    X_train, X_test, y_prod_train, y_prod_test = train_test_split(X, y_prod, test_size=0.2, random_state=42)
    
    prod_model = RandomForestRegressor(n_estimators=100, random_state=42)
    prod_model.fit(X_train, y_prod_train)
    prod_score = prod_model.score(X_test, y_prod_test)
    print(f"Productivity Model R2 Score: {prod_score:.4f}")
    
    # Burnout Model (Classification)
    y_burn = df['burnout_risk']
    X_train_b, X_test_b, y_burn_train, y_burn_test = train_test_split(X, y_burn, test_size=0.2, random_state=42)
    
    # Scale features for Logistic Regression
    scaler = StandardScaler()
    X_train_b_scaled = scaler.fit_transform(X_train_b)
    X_test_b_scaled = scaler.transform(X_test_b)
    
    burn_model = LogisticRegression(random_state=42)
    burn_model.fit(X_train_b_scaled, y_burn_train)
    burn_acc = burn_model.score(X_test_b_scaled, y_burn_test)
    print(f"Burnout Risk Model Accuracy: {burn_acc:.4f}")
    
    # Exam Score Model (Regression)
    y_exam = df['exam_score']
    X_train_e, X_test_e, y_exam_train, y_exam_test = train_test_split(X, y_exam, test_size=0.2, random_state=42)
    exam_model = RandomForestRegressor(n_estimators=100, random_state=42)
    exam_model.fit(X_train_e, y_exam_train)
    print(f"Exam Score Model R2 Score: {exam_model.score(X_test_e, y_exam_test):.4f}")

    # Focus Index Model (Regression)
    y_focus = df['focus_index']
    X_train_f, X_test_f, y_focus_train, y_focus_test = train_test_split(X, y_focus, test_size=0.2, random_state=42)
    focus_model = RandomForestRegressor(n_estimators=100, random_state=42)
    focus_model.fit(X_train_f, y_focus_train)
    print(f"Focus Index Model R2 Score: {focus_model.score(X_test_f, y_focus_test):.4f}")

    # Save the models and scaler
    joblib.dump(prod_model, 'models/productivity_model.pkl')
    joblib.dump(burn_model, 'models/burnout_model.pkl')
    joblib.dump(exam_model, 'models/exam_model.pkl')
    joblib.dump(focus_model, 'models/focus_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    print("All 4 Models and Scaler saved successfully in models/ folder.")

if __name__ == "__main__":
    df = generate_synthetic_data(2000)
    train_and_save_models(df)
