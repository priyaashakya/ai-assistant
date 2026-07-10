# AI Virtual Assistant — MERN Stack

A JARVIS-style voice assistant web app (MongoDB, Express, React, Node) with:

- Signup / Login with JWT auth (httpOnly cookie)
- Custom assistant avatar picker (6 built-in placeholder avatars + upload your own, stored via Cloudinary)
- Custom assistant name ("wake word")
- Browser voice recognition (Web Speech API) — say the assistant's name to activate
- Gemini AI processes your command and returns a structured response (intent + spoken reply)
- Text-to-speech reply (SpeechSynthesis API)
- Command actions: Google search, YouTube search, open Instagram/Facebook/WhatsApp/Calculator, get time/date/day/month, weather
- Command history saved per user

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.sample .env   # fill in MongoDB URL, JWT secret, Cloudinary keys, Gemini API URL+key
npm run dev
```
Runs on http://localhost:8000

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

### 3. Get a Gemini API key
Visit https://aistudio.google.com/app/apikey, generate a key, and put it in the `GEMINI_API_URL` in your `.env` (replace `your_gemini_api_key` at the end of the URL).

### 4. Cloudinary
Create a free account at https://cloudinary.com, grab your cloud name/API key/secret from the dashboard.

## Swapping in your own assistant avatar images
Replace the placeholder files in `frontend/src/assets/` (assistant1.png ... assistant6.png) with your own images, keeping the same filenames — or update the imports in `frontend/src/pages/Customize.jsx`.

## Notes
- Voice recognition requires Chrome/Edge (Web Speech API support) and a working microphone, over HTTPS or localhost.
- The assistant only responds to commands that include its name (the wake word you set during setup).
