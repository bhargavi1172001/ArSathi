#!/bin/bash
cd backend
source venv/bin/activate || . venv/Scripts/activate
echo "🌿 Starting Arogya Sathi Backend..."
python app.py
