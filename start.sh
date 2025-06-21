#!/bin/bash

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!

# Start backend
cd ../backend
source .venv/bin/activate
python3 app.py

# Optional: kill frontend when backend stops
kill $FRONTEND_PID
