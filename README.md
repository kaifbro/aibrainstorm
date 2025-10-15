Project Overview

AI Brainstorm Board is a web-based platform for brainstorming ideas using cards. Users can:

Register and log in

Add, move, and delete cards in columns

Generate ideas automatically using Hugging Face GPT AI

Tech Stack

Frontend: React.js

Backend: Node.js + Express

Database: SQLite

AI Integration: Hugging Face Inference API

Authentication: JWT + bcrypt

Setup Instructions

Clone the repository:
git clone https://github.com/kaifbro/aibrainstorm.git
cd ai-brainstorm-board

Install dependencies

Backend:
cd backend
npm install

Frontend:
cd ../frontend
npm install

Create Environment Variables

Create a .env file inside the backend folder:

PORT=5000
SECRET_KEY=your_jwt_secret
HF_API_KEY=your_huggingface_api_key


Important: Do not share your .env file. Each user should create their own.

Run the project

Backend:
cd backend
nodemon server.js (or npm run dev)

Frontend:
cd ../frontend
npm start

The backend runs at http://localhost:5000 and frontend at http://localhost:3000.

Features Demo (for Task Video)

User Registration and Login

Creating, moving, and deleting cards

AI idea generation: type a prompt and get AI-generated suggestions

Notes

Backend uses SQLite (brainstorm.db) for storing users and cards.

Frontend communicates with backend via REST APIs.

.gitignore excludes node_modules/, .env, and *.log files.