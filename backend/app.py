from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
from gtts import gTTS
import tempfile
import uuid
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Store conversation history (use database in production)
conversations = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Arogya Sathi API is running"})

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Convert speech to text using Whisper"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        language = request.form.get('language', 'hi')  # Default to Hindi
        
        # Save temporary file
        temp_path = f"/tmp/{uuid.uuid4()}.wav"
        audio_file.save(temp_path)
        
        # Transcribe using Whisper
        with open(temp_path, 'rb') as audio:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                language=language
            )
        
        os.remove(temp_path)
        
        return jsonify({
            "success": True,
            "text": transcript.text,
            "language": language
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """Analyze symptoms using GPT-4 with medical context"""
    try:
        data = request.json
        user_message = data.get('message')
        session_id = data.get('session_id', str(uuid.uuid4()))
        language = data.get('language', 'en')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Initialize conversation history
        if session_id not in conversations:
            conversations[session_id] = []
        
        # System prompt for medical assistant
        system_prompt = """You are Arogya Sathi, a compassionate AI health assistant for rural India. 
        
Guidelines:
- Provide empathetic, evidence-based health guidance
- Use simple, culturally appropriate language
- Always include safety disclaimers for serious symptoms
- Never diagnose - only provide general health information
- Encourage professional consultation for concerning symptoms
- Provide home remedies only for minor ailments
- Be respectful of traditional medicine while promoting evidence-based care

When analyzing symptoms:
1. Ask clarifying questions
2. Assess severity (low/medium/high risk)
3. Provide immediate care suggestions if appropriate
4. Recommend when to seek professional help
5. Suggest nearby health facilities for high-risk cases

Remember: You're a guide, not a replacement for doctors."""

        # Add user message to history
        conversations[session_id].append({
            "role": "user",
            "content": user_message
        })
        
        # Get AI response
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                *conversations[session_id]
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_message = response.choices[0].message.content
        
        # Add AI response to history
        conversations[session_id].append({
            "role": "assistant",
            "content": ai_message
        })
        
        # Assess risk level based on keywords
        risk_level = assess_risk_level(user_message, ai_message)
        
        return jsonify({
            "success": True,
            "response": ai_message,
            "session_id": session_id,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def assess_risk_level(user_message, ai_response):
    """Simple keyword-based risk assessment"""
    high_risk_keywords = ['chest pain', 'difficulty breathing', 'severe bleeding', 
                          'unconscious', 'seizure', 'stroke', 'heart attack']
    medium_risk_keywords = ['fever', 'persistent pain', 'vomiting', 'diarrhea']
    
    combined_text = (user_message + " " + ai_response).lower()
    
    if any(keyword in combined_text for keyword in high_risk_keywords):
        return "high"
    elif any(keyword in combined_text for keyword in medium_risk_keywords):
        return "medium"
    return "low"

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech using gTTS"""
    try:
        data = request.json
        text = data.get('text')
        language = data.get('language', 'hi')  # Hindi default
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Generate speech
        tts = gTTS(text=text, lang=language, slow=False)
        
        # Save to temporary file
        temp_path = f"/tmp/{uuid.uuid4()}.mp3"
        tts.save(temp_path)
        
        return send_file(temp_path, mimetype='audio/mpeg', as_attachment=True)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/find-nearby-phc', methods=['POST'])
def find_nearby_phc():
    """Find nearby Primary Health Centers (mock data - integrate with real API)"""
    try:
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Mock PHC data - replace with actual database/API
        mock_phcs = [
            {
                "name": "Primary Health Center, Village A",
                "distance": "2.3 km",
                "phone": "+91-1234567890",
                "services": ["General Medicine", "Maternity", "Emergency"],
                "hours": "24/7"
            },
            {
                "name": "Community Health Center, Town B",
                "distance": "5.7 km",
                "phone": "+91-0987654321",
                "services": ["General Medicine", "Surgery", "Pediatrics"],
                "hours": "8 AM - 8 PM"
            }
        ]
        
        return jsonify({
            "success": True,
            "health_centers": mock_phcs
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)


#if __name__ == '__main__':
 #   app.run(debug=True, host='0.0.0.0', port=5000)
