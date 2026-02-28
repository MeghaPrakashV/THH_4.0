# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

 Hostel Survival Kit [HSK] 🎯 
 Basic Details Team Name: VirtualX 
 Team Members Member 1: Megha Prakash - College of engineering Chengannur 
 Member 2: Madhavi Dinesh- College of Engineering Chengannur 
 Hosted Project Link:  https://thh-4-0.onrender.com
 The Problem Statement:
Hostel students often miss important academic dates, lack a safe space to vent, and have no structured system for food feedback or complaint tracking. There is no centralized platform built specifically for managing hostel student life efficiently.
The Solution:
Hostel Survival Kit provides an AI-powered, all-in-one platform to manage academic schedules, anonymous vents, mess ratings, and complaints. It centralizes hostel life management into a smart, interactive dashboard designed for students.
Technical Details
🖥 For Software
Languages Used:

JavaScript

Frameworks Used:

React.js

Node.js

Express.js

Libraries Used:

Axios

Mongoose

JWT

bcrypt

Multer

node-cron

TailwindCSS

Framer Motion

Tools Used:

VS Code

Git & GitHub

MongoDB Atlas

Postman

OpenAI API

🔑 Features
1️⃣ Smart Academic Calendar

Upload PDF/Image calendar

AI extracts exams, holidays, semester end

Interactive calendar view

Animated countdown timer

Manual date editing

Custom important day addition

2️⃣ Anonymous Vent Platform

Anonymous posting

Auto-delete after 24 hours (cron job)

Like/React feature

Sort by Most Recent / Most Liked

3️⃣ Mess Food Judgement Area

Daily emoji/star rating

Today's average rating

Weekly average auto-calculated

Fun rating labels:

⭐ 1 – Michelin Disaster

⭐ 3 – Survivable

⭐ 5 – Hostel Heaven

4️⃣ Survival Tips Section

Post study tips & budget hacks

Upvote system

Tag filtering

Leaderboard for top contributors

5️⃣ Complaint Management System

Categories:

WiFi

Food

Cleanliness

Electricity

Noise

Maintenance

Features:

Complaint submission

Rep login panel

Status tracking (Pending / In Progress / Resolved)

Timeline view

🛠 Implementation
For Software
🔧 Installation

Clone the repository:

git clone https://github.com/your-username/hostel-survival-kit.git
cd hostel-survival-kit

Backend setup:

cd server
npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key

Frontend setup:

cd client
npm install
▶️ Run

Backend:

npm run dev

Frontend:

npm run dev
📸 Project Documentation
Screenshots


Dashboard showing countdown timer and calendar view.


Anonymous vent platform sorted by most liked.


Complaint tracking system with status timeline.

🏗 System Architecture
Architecture Overview

Frontend (React + Tailwind)
⬇
Axios API Calls
⬇
Backend (Node.js + Express)
⬇
MongoDB Database

AI Parsing Flow:
Uploaded File → Multer → OpenAI API → Parsed Dates → Database → Calendar Display

🔄 Application Workflow

User logs in/registers

Dashboard loads

User can:

Upload academic calendar

Post vent

Rate mess food

Submit complaint

Backend processes request

MongoDB stores data

Frontend updates UI dynamically

📡 API Documentation

Base URL:

[http://localhost:5174/]
Authentication

POST /auth/register
Registers new user

POST /auth/login
Returns JWT token

Calendar

POST /calendar/upload
Uploads and parses academic calendar

GET /calendar/events
Returns all parsed events

Vent

POST /vent
Create anonymous post

GET /vent
Fetch all active vents

DELETE /vent/:id
Auto delete after 24h

Mess Rating

POST /mess/rate
Submit daily rating

GET /mess/average
Get daily & weekly averages

Complaints

POST /complaints
Submit complaint

PUT /complaints/:id
Update status (rep only)

Project Demo

Video:
[https://drive.google.com/file/d/1Z_arsEI303Q3tfn54KjnCpX0z1M2pPoJ/view?usp=drive_link]

The demo showcases:

AI calendar parsing

Vent auto-deletion

Mess rating analytics

Complaint status tracking

 AI Tools Used

Tool Used: OpenAI API

Purpose:

Extract dates from uploaded academic calendar

Key Prompt Used:
"Extract exam dates, holidays, and semester end dates from this academic calendar text and return structured JSON."

Percentage of AI-generated code: ~20%

Human Contributions:

Architecture design

Business logic

UI/UX design

API integration

Database schema design

👩‍💻 Team Contributions

Madhavi Dinesh:
frontend, UI design, animations, calendar integration

Megha Praksah:
Backend development, database schema design, authentication, AI integration

📜 License

This project is licensed under the MIT License.

Made with ❤️ at Tinkerhub