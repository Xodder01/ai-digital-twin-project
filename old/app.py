from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
import numpy as np

app = Flask(__name__)
# Enable CORS for the React frontend
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Load all models and preprocessors globally on startup
try:
    label_encoders = joblib.load(os.path.join(MODEL_DIR, 'label_encoders.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    scaler_cluster = joblib.load(os.path.join(MODEL_DIR, 'scaler_cluster.pkl'))
    feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))
    
    prod_model = joblib.load(os.path.join(MODEL_DIR, 'productivity_score_model.pkl'))
    focus_model = joblib.load(os.path.join(MODEL_DIR, 'focus_index_model.pkl'))
    exam_model = joblib.load(os.path.join(MODEL_DIR, 'exam_score_model.pkl'))
    burnout_model = joblib.load(os.path.join(MODEL_DIR, 'burnout_classifier_model.pkl'))
    kmeans_model = joblib.load(os.path.join(MODEL_DIR, 'kmeans_behavior_model.pkl'))
    
    stress_le = joblib.load(os.path.join(MODEL_DIR, 'stress_label_encoder.pkl'))
    stress_scaler = joblib.load(os.path.join(MODEL_DIR, 'stress_scaler.pkl'))
    stress_features = joblib.load(os.path.join(MODEL_DIR, 'stress_feature_names.pkl'))
    stress_model = joblib.load(os.path.join(MODEL_DIR, 'stress_model.pkl'))
    print("All ML models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Incoming prediction request...")

        # Convert to pandas DataFrame
        df_input = pd.DataFrame([data])
        
        # Apply strict column ordering using saved feature_names
        # Default numeric to 0 and categorical to 'Average'/'Other' if missing
        for col in feature_names:
            if col not in df_input.columns:
                if col in ['gender', 'academic_level', 'internet_quality']:
                    if col == 'internet_quality': df_input[col] = 'Average'
                    elif col == 'academic_level': df_input[col] = 'Undergraduate'
                    else: df_input[col] = 'Other'
                else:
                    df_input[col] = 0.0
                    
        df_input = df_input[feature_names]

        # 1. Encode Categoricals
        categorical_cols = ['gender', 'academic_level', 'internet_quality']
        for col in categorical_cols:
            if col in label_encoders:
                # Handle unknown labels if any (fallback to 0th class)
                known_classes = label_encoders[col].classes_
                val = str(df_input.loc[0, col])
                if val not in known_classes:
                    val = known_classes[0]
                df_input[col] = label_encoders[col].transform([val])[0]
        
        # 2. Scale Features
        X_scaled = scaler.transform(df_input)

        # 3. Predict Regression Outputs
        productivity = float(prod_model.predict(X_scaled)[0])
        focus = float(focus_model.predict(X_scaled)[0])
        exam = float(exam_model.predict(X_scaled)[0])
        
        # 4. Predict Burnout Risk (Classification)
        burnout_risk = int(burnout_model.predict(X_scaled)[0]) # 1 = High, 0 = Low
        
        # 5. Predict Behavior Cluster
        behavioral_features = ['study_hours', 'screen_time_hours', 'gaming_hours', 'sleep_hours', 'social_media_hours', 'exercise_minutes']
        df_cluster = df_input[behavioral_features]
        X_cluster_scaled = scaler_cluster.transform(df_cluster)
        cluster_id = int(kmeans_model.predict(X_cluster_scaled)[0])

        # 6. Predict Stress Level
        study_val = float(data.get('study_hours', 0.0))
        sleep_val = float(data.get('sleep_hours', 0.0))
        exercise_val = float(data.get('exercise_minutes', 0.0)) / 60.0
        extra_val = float(data.get('extracurricular_hours', 0.0))
        social_val = float(data.get('social_media_hours', 2.0))
        gpa_val = float(data.get('gpa', 3.0))

        df_stress = pd.DataFrame([{
            'Study_Hours_Per_Day': study_val,
            'Extracurricular_Hours_Per_Day': extra_val,
            'Sleep_Hours_Per_Day': sleep_val,
            'Social_Hours_Per_Day': social_val,
            'Physical_Activity_Hours_Per_Day': exercise_val,
            'GPA': gpa_val
        }])[stress_features]
        
        X_stress_scaled = stress_scaler.transform(df_stress)
        stress_class = int(stress_model.predict(X_stress_scaled)[0])
        stress_label = str(stress_le.inverse_transform([stress_class])[0])

        # Generate intelligent recommendations based on rules
        recommendations = []
        if burnout_risk == 1:
            recommendations.append("🚨 High burnout risk detected. Consider reducing overall screen time and incorporating regular breaks.")
        if float(df_input.loc[0, 'sleep_hours']) < 6:
            recommendations.append("💤 Sleeping less than 6 hours heavily impacts your cognitive focus. Try aiming for 7-8 hours tonight.")
        if float(df_input.loc[0, 'mental_health_score']) <= 4:
            recommendations.append("🧠 Your mental health score is low. It's okay to take a step back from studies and prioritize self-care.")
        if float(df_input.loc[0, 'gaming_hours']) > 3:
            recommendations.append("🎮 Gaming for over 3 hours might be negatively affecting your productivity. Try capping it to 1-2 hours a day.")
            
        if stress_label == 'High':
            recommendations.append("⚠️ High stress level detected! Ensure you are taking sufficient breaks and consider lightening your workload.")
        
        if len(recommendations) == 0:
            recommendations.append("🌟 Your lifestyle habits are incredibly well-balanced! Keep up this routine for consistent high performance.")

        # Prepare JSON Response
        response = {
            'predictions': {
                'productivity_score': round(productivity, 2),
                'focus_index': round(focus, 2),
                'exam_score': round(exam, 2),
                'burnout_risk': "High Risk" if burnout_risk == 1 else "Low Risk",
                'behavior_cluster': cluster_id,
                'stress_level': stress_label
            },
            'recommendations': recommendations
        }
        
        return jsonify(response), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
