# Daruka-Interview-Bot



DARUKA
INTERVIEW BOT
Complete Architecture & Master Plan


AI-Powered Mock Interview Platform
Voice Bot  |  Code Execution  |  AI Evaluation  |  Resume Analysis




Stack: React + FastAPI + MySQL + Ollama + Whisper + Piper + Docker
Local Deployment  |  Version 1.0  |  2025


  SECTION 1  
PROJECT OVERVIEW
1. Daruka Interview Bot — Project Overview
Daruka Interview Bot is a locally-deployed, AI-powered mock interview platform built for students preparing for technical job interviews. It simulates a real interview experience — voice-driven Q&A, live code execution, AI evaluation, and detailed performance reports — without requiring any paid API services.

1.1 What It Does
Conducts voice-to-voice AI interviews using Whisper (speech-to-text) + Piper (text-to-speech) + Ollama (LLM brain).
Includes an integrated code editor (Monaco) with Python and Java execution inside Docker sandboxes.
Analyzes resumes using Ollama to identify skill gaps vs. the selected role.
Generates detailed performance reports: Technical %, Programming %, Role Gap %, Communication %, Overall %, Strengths, Weaknesses, Tips.
Tracks all past interview attempts on a results dashboard.
Has a single Admin Panel to monitor users and interviews.

1.2 User Types

1.3 Tech Stack

1.4 Color Palette (Use Exactly These)
// src/config/colors.ts
export const C = {
  primary:    '#1A3A5C',   // Dark Navy  — headings, sidebar, primary buttons
  accent:     '#2980B9',   // Blue       — links, highlights, active states
  light:      '#D6EAF8',   // Light Blue — card backgrounds, hover fills
  mid:        '#85C1E9',   // Medium Blue — secondary text, borders
  white:      '#FFFFFF',
  black:      '#000000',
  gray:       '#555555',   // Body text
  lightGray:  '#F2F3F4',   // Page background, input fields
  border:     '#AED6F1',   // All borders
  success:    '#1E8449',   // Pass / correct
  warning:    '#D35400',   // Fail / warning
  danger:     '#C0392B',   // Errors
};

  SECTION 2  
COMPLETE FOLDER STRUCTURE
2. Complete Folder Structure
2.1 Root
daruka-interview-bot/
├── frontend/                   ← React + TypeScript app
├── backend/                    ← FastAPI app
├── sandbox/                    ← Docker images for code execution
├── docker-compose.local.yml    ← Full local stack
├── .env.example                ← Template — copy to .env
└── README.md

2.2 Frontend Structure
frontend/
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx                         ← React DOM entry point
    ├── App.tsx                          ← Router + route guards
    ├── index.css                        ← Tailwind base + global styles
    │
    ├── assets/                          ← Static files
    │   ├── logo.svg                     ← Daruka logo
    │   ├── mic-idle.svg                 ← Mic animation (idle state)
    │   ├── mic-recording.svg            ← Mic animation (recording)
    │   └── mic-processing.svg           ← Mic animation (AI thinking)
    │
    ├── config/
    │   ├── colors.ts                    ← Exact hex palette (Section 1.4)
    │   └── api.ts                       ← Axios instance, base URL, interceptors
    │
    ├── context/
    │   ├── AuthContext.tsx              ← User state, login/logout, token refresh
    │   └── InterviewContext.tsx         ← Active session state (role, resume, answers)
    │
    ├── store/                           ← Zustand stores
    │   ├── authStore.ts
    │   └── interviewStore.ts
    │
    ├── hooks/
    │   ├── useMediaRecorder.ts          ← MediaRecorder API wrapper (audio capture)
    │   ├── useWebcamProctor.ts          ← Webcam stream + YOLO proctoring calls
    │   └── useMonacoTheme.ts            ← Monaco dark/light theme config
    │
    ├── components/
    │   ├── ui/                          ← Primitive reusable components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Toast.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   └── ProgressBar.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx               ← Top bar (logo + user menu)
    │   │   ├── Sidebar.tsx              ← Left nav (dashboard links)
    │   │   └── AdminLayout.tsx          ← Admin-only layout wrapper
    │   ├── CodeEditor/
    │   │   └── MonacoWrapper.tsx        ← Monaco editor with lang selector + run btn
    │   ├── interview/
    │   │   ├── VoiceBot.tsx             ← Mic image + question text + record button
    │   │   ├── TimerBadge.tsx           ← Interview elapsed time display
    │   │   └── ProctorOverlay.tsx       ← Warning if face not detected
    │   └── results/
    │       ├── ScoreRing.tsx            ← Circular % score component
    │       └── MetricRow.tsx            ← Single result row in history table
    │
    ├── pages/
    │   ├── Landing.tsx                  ← Home page (hero + CTA)
    │   ├── Auth/
    │   │   ├── Login.tsx
    │   │   └── Signup.tsx
    │   ├── Dashboard.tsx                ← 3 feature cards
    │   ├── Profile/
    │   │   └── ResumeProfile.tsx        ← Profile form + resume list
    │   ├── Results/
    │   │   ├── MetricsList.tsx          ← All past interviews table
    │   │   └── ReportDetail.tsx         ← Single interview deep report
    │   ├── Interview/
    │   │   ├── Setup.tsx                ← Role + Resume + Experience selector
    │   │   ├── SystemCheck.tsx          ← Camera / Mic / Fullscreen check
    │   │   ├── ActiveSession.tsx        ← Split: Voice Bot (left) + Monaco (right)
    │   │   └── FeedbackWaiting.tsx      ← Post-interview waiting screen
    │   └── Admin/
    │       └── AdminPanel.tsx           ← Admin dashboard
    │
    ├── types/
    │   ├── auth.ts
    │   ├── interview.ts
    │   └── report.ts
    │
    └── utils/
        ├── validators.ts
        └── formatters.ts

2.3 Backend Structure
backend/
├── Dockerfile
├── requirements.txt
├── .env.example
├── alembic.ini
├── alembic/                             ← DB migration scripts
└── app/
    ├── main.py                          ← FastAPI app factory
    ├── api/                             ← Route handlers
    │   ├── auth.py                      ← /auth/*
    │   ├── profile.py                   ← /profile/*
    │   ├── resume.py                    ← /resume/*
    │   ├── interview.py                 ← /interview/*
    │   ├── coding.py                    ← /coding/*
    │   ├── report.py                    ← /report/*
    │   ├── admin.py                     ← /admin/*
    │   └── websocket.py                 ← /ws/interview/{session_id}
    ├── core/
    │   ├── config.py                    ← Pydantic Settings (.env loader)
    │   ├── security.py                  ← JWT + bcrypt + OTP
    │   ├── email.py                     ← SMTP OTP sender
    │   └── exceptions.py                ← Custom HTTP exceptions
    ├── db/
    │   ├── database.py                  ← SQLAlchemy engine + Base
    │   ├── session.py                   ← DB session dependency
    │   └── redis.py                     ← Redis client
    ├── models/                          ← ORM table models
    │   ├── user.py
    │   ├── resume.py
    │   ├── interview.py
    │   ├── question.py
    │   ├── answer.py
    │   ├── coding_submission.py
    │   └── report.py
    ├── schemas/                         ← Pydantic request/response
    │   ├── auth.py
    │   ├── profile.py
    │   ├── interview.py
    │   ├── coding.py
    │   └── report.py
    ├── services/                        ← Business logic
    │   ├── auth_service.py
    │   ├── resume_service.py            ← PyMuPDF + Ollama parsing
    │   ├── interview_service.py         ← Question gen + evaluation
    │   ├── coding_service.py            ← Docker sandbox execution
    │   ├── ai_service.py                ← Ollama + Whisper + Piper
    │   ├── proctor_service.py           ← YOLO face detection
    │   └── report_service.py            ← Score aggregation + PDF
    ├── repositories/                    ← DB query layer
    │   ├── user_repo.py
    │   ├── interview_repo.py
    │   └── report_repo.py
    └── websocket/
        ├── manager.py                   ← WS connection registry
        └── voice.py                     ← Audio stream handler

2.4 Sandbox Structure
sandbox/
├── python/
│   └── Dockerfile                       ← python:3.11-slim, no pip packages
└── java/
    └── Dockerfile                       ← openjdk:21-slim

  SECTION 3  
ALL PAGES — DETAILED SPECIFICATION
3. Page-by-Page Specification
3.1 Landing Page  (pages/Landing.tsx)
Route: /   |   Public   |   No auth required

3.2 Login Page  (pages/Auth/Login.tsx)
Route: /login   |   Public

3.3 Register Page  (pages/Auth/Signup.tsx)
Route: /register   |   Public

3.4 Dashboard  (pages/Dashboard.tsx)
Route: /dashboard   |   Protected (requires login)

3.5 Resume & Profile Page  (pages/Profile/ResumeProfile.tsx)
Route: /profile   |   Protected

3.6 Results & Performance  (pages/Results/MetricsList.tsx)
Route: /results   |   Protected

3.7 Report Detail  (pages/Results/ReportDetail.tsx)
Route: /results/:id   |   Protected

3.8 Interview Setup  (pages/Interview/Setup.tsx)
Route: /interview/setup   |   Protected

3.9 System Check  (pages/Interview/SystemCheck.tsx)
Route: /interview/system-check   |   Protected

3.10 Active Interview Session  (pages/Interview/ActiveSession.tsx)
Route: /interview/active   |   Protected   |   FULLSCREEN REQUIRED

3.11 Feedback Waiting  (pages/Interview/FeedbackWaiting.tsx)
Route: /interview/feedback   |   Protected

3.12 Admin Panel  (pages/Admin/AdminPanel.tsx)
Route: /admin   |   Protected + Admin Role Only

  SECTION 4  
BACKEND API REFERENCE
4. Backend API Reference
Base URL: http://localhost:8000/api/v1   All protected routes require: Authorization: Bearer <token>

4.1 Auth APIs

4.2 Profile & Resume APIs

4.3 Interview APIs

4.4 Coding APIs

4.5 Report APIs

4.6 Admin APIs

4.7 WebSocket Protocol
Connection: ws://localhost:8000/ws/interview/{session_id}?token={jwt}
 
CLIENT → SERVER messages:
  { type: 'audio_chunk',  data: '<base64 audio bytes>' }
  { type: 'audio_end' }        ← signals candidate finished speaking
  { type: 'ping' }             ← keep-alive every 30s
 
SERVER → CLIENT messages:
  { type: 'question',     text: '...', audio: '<base64 wav>', index: 3, total: 10 }
  { type: 'transcript',   text: 'Candidate said...' }
  { type: 'evaluation',   scores: { technical: 7, communication: 8, depth: 6 } }
  { type: 'coding_task',  question: '...', language: ['python','java'] }
  { type: 'follow_up',    text: '...', audio: '<base64 wav>' }
  { type: 'interview_end' }    ← all questions done / time limit reached
  { type: 'error',        message: '...' }

  SECTION 5  
DATABASE SCHEMA
5. MySQL Database Schema

5.1 users
CREATE TABLE users (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('candidate','admin') NOT NULL DEFAULT 'candidate',
  is_active    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

5.2 candidate_profiles
CREATE TABLE candidate_profiles (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            BIGINT UNSIGNED NOT NULL UNIQUE,
  mobile             VARCHAR(20),
  about              TEXT,
  skills             JSON,          -- ['Python','React','SQL']
  years_experience   TINYINT UNSIGNED DEFAULT 0,
  target_role        VARCHAR(100),
  linkedin_url       VARCHAR(500),
  github_url         VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

5.3 resumes
CREATE TABLE resumes (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(255) NOT NULL,   -- 'Backend Resume v2'
  file_path    VARCHAR(500) NOT NULL,
  parsed_data  JSON,                   -- extracted skills/exp
  parse_status ENUM('pending','done','failed') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

5.4 interview_sessions
CREATE TABLE interview_sessions (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT UNSIGNED NOT NULL,
  resume_id      BIGINT UNSIGNED NOT NULL,
  role           VARCHAR(100) NOT NULL,
  experience     VARCHAR(50) NOT NULL,
  status         ENUM('active','completed','expired') DEFAULT 'active',
  started_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at   TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id)
);

5.5 reports
CREATE TABLE reports (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id          BIGINT UNSIGNED NOT NULL UNIQUE,
  technical_pct       DECIMAL(5,2),   -- 0.00 to 100.00
  programming_pct     DECIMAL(5,2),
  role_gap_pct        DECIMAL(5,2),
  communication_pct   DECIMAL(5,2),
  overall_pct         DECIMAL(5,2),
  strengths           JSON,           -- ['string','string']
  weaknesses          JSON,
  tips                JSON,
  transcript          JSON,           -- [{q,a},{q,a}...]
  pdf_path            VARCHAR(500),
  generated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id)
);

  SECTION 6  
DOCKER SETUP — LOCAL DEPLOYMENT
6. Docker Configuration
6.1 docker-compose.local.yml
version: '3.9'
 
services:
 
  frontend:
    build: ./frontend
    ports: ['5173:5173']
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
      VITE_WS_URL:  ws://localhost:8000/ws
    depends_on: [backend]
 
  backend:
    build: ./backend
    ports: ['8000:8000']
    volumes:
      - ./backend:/app
      - /var/run/docker.sock:/var/run/docker.sock  # for sandbox control
    environment:
      DATABASE_URL: mysql+aiomysql://root:daruka@mysql_db:3306/daruka
      REDIS_URL:    redis://redis:6379/0
      OLLAMA_URL:   http://ollama:11434
      SECRET_KEY:   changeme_use_32_random_chars_here
      SMTP_HOST:    smtp.gmail.com
      SMTP_PORT:    587
      SMTP_USER:    your@gmail.com
      SMTP_PASS:    your_app_password
    depends_on: [mysql_db, redis, ollama]
 
  mysql_db:
    image: mysql:8.0
    ports: ['3306:3306']
    environment:
      MYSQL_ROOT_PASSWORD: daruka
      MYSQL_DATABASE: daruka
    volumes:
      - mysql_data:/var/lib/mysql
 
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
 
  ollama:
    image: ollama/ollama
    ports: ['11434:11434']
    volumes:
      - ollama_data:/root/.ollama
    # After first start: docker exec ollama ollama pull llama3.1:8b
 
volumes:
  mysql_data:
  ollama_data:

6.2 Frontend Dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ['npm', 'run', 'dev', '--', '--host', '0.0.0.0']

6.3 Backend Dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    docker.io gcc libmysqlclient-dev ffmpeg && \
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload']

6.4 Backend requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy[asyncio]==2.0.31
aiomysql==0.2.0
alembic==1.13.2
pydantic==2.8.0
pydantic-settings==2.3.4
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
redis==5.0.7
httpx==0.27.0
pymupdf==1.24.7
openai-whisper==20231117
piper-tts==1.2.0
ultralytics==8.2.60
reportlab==4.2.2
aiosmtplib==3.0.1
websockets==12.0
python-dotenv==1.0.1

6.5 Sandbox Docker Images
# sandbox/python/Dockerfile
FROM python:3.11-slim
RUN useradd -m -u 1001 sandbox
USER sandbox
WORKDIR /code
# NO pip packages — stdlib only for security

# sandbox/java/Dockerfile
FROM openjdk:21-jdk-slim
RUN useradd -m -u 1001 sandbox
USER sandbox
WORKDIR /code

6.6 Code Execution Security Flags
docker run \
  --rm \                         # auto-delete container after run
  --network none \               # no internet access
  --memory 256m \                # RAM limit
  --cpus 0.5 \                   # CPU limit
  --ulimit nproc=50 \            # max processes (prevents fork bomb)
  --ulimit fsize=10485760 \      # max file size: 10MB
  --read-only \                  # no filesystem writes
  --tmpfs /tmp:size=50m \        # writable /tmp only
  --user 1001 \                  # non-root
  -v /tmp/{uuid}:/code:ro \      # mount code file read-only
  daruka-python-sandbox \
  python3 /code/solution.py
# Timeout enforced: subprocess timeout=10 seconds

  SECTION 7  
AI & VOICE INTERVIEW FLOW
7. AI & Voice Interview Flow
7.1 Full Interview Flow
1. Session created (POST /interview/session/start)
   - Resume fetched from MySQL
   - Role requirements fetched
   - Skill gap computed: required_skills - candidate_skills
 
2. Question Generation (Ollama)
   - Prompt: Resume JSON + Role + Skill Gaps + Experience
   - Output: 8-10 questions as JSON array
   - 1-2 questions will be coding tasks
   - Questions stored in MySQL
 
3. First question → Piper TTS → audio bytes → WebSocket → React plays audio
 
4. Candidate clicks 'Start Recording'
   - MediaRecorder captures audio (WebM/Opus)
   - Audio chunks streamed via WebSocket
 
5. Candidate clicks 'Stop'
   - Backend buffers chunks → Whisper STT → transcript
   - transcript sent to Ollama for evaluation
   - Scores: technical (0-10), communication (0-10), depth (0-10)
   - If shallow → generate follow-up question
   - Else → next question
 
6. If coding question:
   - Right panel (Monaco) becomes active
   - Candidate writes code, clicks Run or Submit
   - Docker sandbox executes, returns output
 
7. After all questions OR timer ends:
   - WS sends { type: 'interview_end' }
   - Backend triggers report generation (background)
   - Frontend redirects to /interview/feedback
 
8. Report Generation (background):
   - Score aggregation
   - Ollama generates: strengths[], weaknesses[], tips[]
   - ReportLab generates PDF
   - Stored in MySQL

7.2 Proctoring (YOLO)
Every 5 seconds during active interview:
  - Frontend captures webcam frame (canvas.toBlob())
  - Sends base64 image to POST /proctor/check
  - Backend runs YOLO v8 detection:
      - No face detected → warning: 'Face not visible'
      - Multiple faces → warning: 'Multiple people detected'
      - Gaze away too long → warning: 'Looking away detected'
  - Violations stored in MySQL (proctor_events table)
  - 3+ violations → warning toast on screen
  - 10+ violations → interview flagged in report

  SECTION 8  
NAVIGATION MAP & ROUTES
8. Navigation Map
8.1 Route Table

8.2 User Journey Flow
Landing (/)  →  [Register]  →  Signup  →  OTP  →  Dashboard
Landing (/)  →  [Login]    →  Login   →  OTP  →  Dashboard
 
Dashboard  →  [Card 1: Take Interview]
             →  Interview/Setup
             →  Interview/SystemCheck
             →  Interview/ActiveSession  (voice + code)
             →  Interview/FeedbackWaiting
             →  Dashboard
 
Dashboard  →  [Card 2: Resume & Profile]
             →  Profile/ResumeProfile
 
Dashboard  →  [Card 3: Results]
             →  Results/MetricsList
             →  Results/ReportDetail (click any row)

  SECTION 9  
QUICK START GUIDE
9. Quick Start — How to Run Daruka Locally
# 1. Clone the repo
git clone https://github.com/yourname/daruka-interview-bot.git
cd daruka-interview-bot
 
# 2. Copy environment file
cp .env.example .env
# → Edit .env: add Gmail SMTP credentials, set SECRET_KEY
 
# 3. Start all services
docker compose -f docker-compose.local.yml up -d
 
# 4. Pull the AI models (one-time, ~5GB total)
docker exec ollama ollama pull llama3.1:8b
 
# 5. Run database migrations
docker exec backend alembic upgrade head
 
# 6. Create admin user
docker exec backend python scripts/create_admin.py
 
# 7. Build sandbox images
docker build -t daruka-python-sandbox ./sandbox/python
docker build -t daruka-java-sandbox   ./sandbox/java
 
# 8. Open in browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
# Admin:    http://localhost:5173/admin  (use admin credentials)


— END OF DARUKA MASTER PLAN —
Daruka Interview Bot  |  Architecture Master Plan  |  v1.0  |  2025
