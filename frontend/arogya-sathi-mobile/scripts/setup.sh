#!/bin/bash

echo "🌿 Setting up Arogya Sathi..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate || . venv/Scripts/activate
pip install -r requirements.txt

# Create .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your OpenAI API key"
fi

cd ..

# Frontend setup
echo "📱 Setting up mobile app..."
cd frontend/arogya-sathi-mobile
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add OpenAI API key to backend/.env"
echo "2. Update API_URL in mobile app screens"
echo "3. Run: ./scripts/start-backend.sh"
echo "4. Run: ./scripts/start-mobile.sh"
