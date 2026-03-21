#!/bin/bash

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build

echo "Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt   # ✅ this now works because we are inside backend

echo "Starting Flask server..."
python app.py