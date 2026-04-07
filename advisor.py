import google.generativeai as genai
import os

# Hardcoded API key for testing based on user input
# Hardcoded API key for testing based on user input
API_KEY = "AIzaSyCvsMeqFZ3Reon7xxshehQ58osPQPFz6XQ"

if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

def generate_advice(metrics, predicted_productivity, burnout_risk, exam_score, focus_index):
    if not model:
        return "Note: Gemini GenAI is disabled because GEMINI_API_KEY is not set. Your digital twin suggests getting more balanced sleep and managing stress points effectively."
    
    prompt = f"""
    You are an AI Personal Life Copilot and Digital Twin built for a final-year university student.
    
    The student's simulated metrics are:
    - Sleep: {metrics.get('sleep_hours', 0)} hours
    - Study: {metrics.get('study_hours', 0)} hours
    - Screen Time: {metrics.get('screen_time_hours', 0)} hours
    - Stress Level: {metrics.get('stress_level', 0)}/10
    
    Based on our 4 ML prediction models:
    - Forecasted Productivity Score: {predicted_productivity:.1f}/100
    - Burnout Risk: {'High' if burnout_risk == 1 else 'Low'}
    - Predicted Exam Score: {exam_score:.1f}/100
    - Current Focus Index: {focus_index:.1f}/10.0
    
    Provide brief, friendly, actionable advice (2 paragraphs max).
    Explain why their performance is predicted to be at this level, what habits are causing issues, and suggest a personalized improvement strategy using simple, everyday English. Avoid complex robotic phrasing or difficult jargon so anyone can understand you easily.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"

def chat_with_twin(user_message, metrics, predicted_productivity, burnout_risk, exam_score, focus_index, syllabus_text=""):
    if not model:
        return "I'm offline! Please connect a Gemini API key to chat with me."
        
    context = f"""
    You are an AI Personal Life Copilot.
    Current student context:
    Sleep: {metrics.get('sleep_hours', 0)}h, Study: {metrics.get('study_hours', 0)}h, Screen Time: {metrics.get('screen_time_hours', 0)}h, Stress: {metrics.get('stress_level', 0)}/10.
    Simulated Productivity Score: {predicted_productivity:.1f}/100.
    Predicted Exam Score: {exam_score:.1f}/100.
    Focus Index: {focus_index:.1f}/10.
    Burnout Risk: {'High' if burnout_risk == 1 else 'Low'}.
    
    The user is talking directly to you. Keep your answers brief, warm, and highly supportive. Use simple, everyday English that a layman can understand. Avoid complex scientific jargon or robotic "AI" talk.
    """
    
    if syllabus_text:
        context += f"\n\n[SYSTEM KNOWLEDGE BASE - SYLLABUS]\nThe user has provided their study material:\n'{syllabus_text}'\nIf the user asks you to quiz, test, or help them study, generate questions based EXACTLY on this material. Wait for their answers and grade them.\n"
        
    context += f"\nUser's message: '{user_message}'\n"
    
    try:
        response = model.generate_content(context)
        return response.text
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "quota" in error_str.lower():
            return "⚠️ I hit my Google API Free Tier limit! (Because you provided a massive syllabus PDF, I can only send a few messages per minute). Please wait 30 seconds before asking another question!"
        return f"Error: {error_str}"
