#!/bin/bash

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
CI=false npm run build

echo "Installing backend dependencies..."
cd ../backend
pip3 install -r requirements.txt

echo "Starting Flask server..."
python3 app.py