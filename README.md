## Live Polling System

Real‑time classroom polling with teacher and student experiences. Desktop PC‑first UI; mobile is partially responsive and fully functional but some layouts may break.

### Quick glance
- **Real‑time polls** with countdown, live results, and auto/early end
- **Unique student join** and single‑vote enforcement
- **Chat** with presence and teacher kick
- **Zero DB**: in‑memory state, simple to run locally

### Tech stack

<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="Redux" src="https://img.shields.io/badge/Redux-5-764ABC?logo=redux&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white" />
  <img alt="Nodemon" src="https://img.shields.io/badge/nodemon-dev-76D04B?logo=nodemon&logoColor=white" />
  <img alt="CORS" src="https://img.shields.io/badge/CORS-enabled-blue" />
</p>

### Folder structure
```
Live-Polling-System/
  backend/
    src/
      index.js
    package.json
    Readme.md
  frontend/
    src/
      components/
        teacher/
        student/
        ui/
      services/socket.js
      store/
    package.json
    README.md
  FigmaUIrefernces/
```

### Local setup (run locally)
Prerequisites: Node.js 18+.

0) Clone the repo (or download ZIP)
```
git clone https://github.com/your-username/Live-Polling-System.git
cd Live-Polling-System
```

1) Start the backend (Terminal A)
```
cd backend
npm install
npm start
```

2) Start the frontend (Terminal B)
```
cd frontend
npm install
npm run dev
```

3) Open the app
- Visit the Vite dev URL printed in Terminal B (e.g., http://localhost:5173)
- Backend should log: `Server listening on http://localhost:4000 || ok: true`

Notes
- If ports are busy, Vite will auto-pick a different port; use the printed URL.
- Ensure `VITE_BACKEND_URL` points to the backend origin you started in step 2.

### Documentation
- Frontend details: `frontend/README.md`
- Backend details: `backend/Readme.md`

### All features implemented checklist: 

Teacher Features
- [x] Create a new poll
- [x] View live polling results
- [x] Ask a new question only if no question is active or all students have answered

Student Features
- [x] Enter name on first visit (unique per tab)
- [x] Submit answers once a question is asked
- [x] View live polling results after submission
- [x] Maximum of 60 seconds to answer (teacher-configurable; defaults to 60s)

Technology Stack
- [x] Frontend: React (Redux used)
- [x] Backend: Express.js with Socket.IO

Must‑Have Requirements
- [x] Functional system with core features working
- [x] Hosting for both frontend and backend (local setup provided; deploy not included)
- [x] Teacher can create polls and students can answer them
- [x] Both teacher and student can view poll results
- [x] UI matches shared Figma design without deviations

Good to Have
- [x] Configurable poll time limit by teacher
- [x] Option for teacher to remove a student
- [x] Well‑designed user interface

Bonus Features
- [x] Chat popup for interaction between students and teachers
- [x] Teacher can view past poll results (kept in memory; exposed via `/history`)


