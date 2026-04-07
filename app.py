from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
from advisor import generate_advice, chat_with_twin
import PyPDF2

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'])



# Load Models
try:
    prod_model = joblib.load('models/productivity_model.pkl')
    burn_model = joblib.load('models/burnout_model.pkl')
    exam_model = joblib.load('models/exam_model.pkl')
    focus_model = joblib.load('models/focus_model.pkl')
    scaler = joblib.load('models/scaler.pkl')
    
    # Global variable to store syllabus text 
    uploaded_syllabus_text = ""
    print("All 4 Final Year Project Models loaded successfully.")
except FileNotFoundError:
    print("Warning: Models not found. Please run train_models.py first.")
    prod_model, burn_model, exam_model, focus_model, scaler = None, None, None, None, None



@app.route('/predict', methods=['POST'])
def predict():
    if not prod_model:
        return jsonify({'error': 'Models not trained yet'}), 500
        
    data = request.json
    try:
        # Expected keys: sleep_hours, study_hours, screen_time_hours, stress_level
        df = pd.DataFrame([data])
        
        # Predict Productivity
        prod_score = prod_model.predict(df)[0]
        
        # Predict Burnout
        df_scaled = scaler.transform(df)
        burn_risk = int(burn_model.predict(df_scaled)[0])
        
        # Predict Exam Score & Focus
        exam_score = float(exam_model.predict(df)[0])
        focus_index = float(focus_model.predict(df)[0])

        return jsonify({
            'productivity_score': round(prod_score, 1),
            'burnout_risk': burn_risk, # 0 or 1
            'exam_score': round(exam_score, 1),
            'focus_index': round(focus_index, 1),
            'message': 'Prediction successful'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/simulate', methods=['POST'])
def simulate():
    """
    Takes user's what-if metrics, runs them through the ML models,
    then generates a personalized narrative using GenAI.
    """
    if not prod_model:
        return jsonify({'error': 'Models not trained yet'}), 500
        
    data = request.json
    try:
        df = pd.DataFrame([data])
        
        prod_score = prod_model.predict(df)[0]
        df_scaled = scaler.transform(df)
        burn_risk = int(burn_model.predict(df_scaled)[0])
        exam_score = float(exam_model.predict(df)[0])
        focus_index = float(focus_model.predict(df)[0])
        
        # Generate Goal Probability
        base_goal_prob = prod_score - (burn_risk * 25)
        goal_prob = max(5, min(99, int(base_goal_prob)))

        # Generate Habit Impact Analysis
        sleep_impact = round((data.get('sleep_hours', 0) - 7) * 5)
        study_impact = round((data.get('study_hours', 0) - 4) * 6)
        screen_impact = round((4 - data.get('screen_time_hours', 0)) * 4)
        stress_impact = round((5 - data.get('stress_level', 0)) * 8)
        
        habit_impact = {
            "Sleep": sleep_impact,
            "Study": study_impact,
            "Screen Time": screen_impact,
            "Stress": stress_impact
        }

        # Generate Weekly Trend Array
        trend = [int(prod_score)]
        for i in range(1, 7):
            daily_change = (study_impact * 0.2) + (sleep_impact * 0.3) - (burn_risk * 8 * (i/2))
            next_val = max(0, min(100, trend[-1] + daily_change))
            trend.append(int(next_val))

        # Call GenAI Advisor (Pass all 4 metrics so the AI Twin acts comprehensively)
        advice = generate_advice(data, prod_score, burn_risk, exam_score, focus_index)
        
        return jsonify({
            'new_productivity_score': round(prod_score, 1),
            'new_burnout_risk': burn_risk,
            'exam_score': round(exam_score, 1),
            'focus_index': round(focus_index, 1),
            'ai_advice': advice,
            'goal_probability': goal_prob,
            'habit_impact': habit_impact,
            'weekly_trend': trend
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/chat', methods=['POST'])
def chat():
    global uploaded_syllabus_text
    data = request.json
    msg = data.get('message', '')
    metrics = data.get('metrics', {})
    
    # We re-run the prediction quickly just to have the context for advice
    try:
        input_data = pd.DataFrame([metrics])
        prod = float(prod_model.predict(input_data)[0])
        input_scaled = scaler.transform(input_data)
        fail = int(burn_model.predict(input_scaled)[0])
        exam = float(exam_model.predict(input_data)[0])
        focus = float(focus_model.predict(input_data)[0])
        
        reply = chat_with_twin(msg, metrics, prod, fail, exam, focus, uploaded_syllabus_text)
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/upload_syllabus', methods=['POST'])
def upload_syllabus():
    global uploaded_syllabus_text
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and file.filename.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
                
            # Restrict size to prevent free-tier API crashes (Limit to ~60k chars)
            if len(text) > 60000:
                text = text[:60000] + "\n\n[TRUNCATED DUE TO FREE TIER LIMITS]"
                
            uploaded_syllabus_text = text
            return jsonify({'message': 'Syllabus PDF successfully ingrained in twin memory!'})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
            
    return jsonify({'error': 'Invalid file. Please strictly upload a PDF.'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
