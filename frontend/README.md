### Desktop first notice
Best viewed on a PC desktop. Mobile responsiveness is partial; some layouts may break, but functionality remains available.

## Live Polling System — Frontend
This is the React (Vite) frontend for a real‑time classroom polling application. It provides dedicated experiences for teachers and students, real‑time sockets, and a minimal UI system.

## Features
- **Teacher & Student flows**: Role‑specific pages under `src/components/teacher` and `src/components/student`.
- **Real-time polling**: Live updates via `socket.io-client`; countdown, responses, and results stream instantly.
- **Poll history**: View previous polls and their outcomes.
- **Toast notifications**: Lightweight feedback using `react-toastify`.
- **State management**: Redux store with user and poll slices.
- **TailwindCSS styling**: Utility-first styles with Vite integration.

## Tech stack
- **React 19** with **Vite**
- **Redux** and **react-redux**
- **React Router**
- **socket.io-client**
- **Tailwind CSS** and **PostCSS/Autoprefixer**
- **ESLint** with React Hooks and Refresh plugins

## Project structure (frontend)
```
frontend/
  index.html
  src/
    main.jsx
    App.jsx
    index.css
    components/
      Landing.jsx
      ui/ (shared UI widgets)
      teacher/ (TeacherPage, PollHistory, TimeSelect)
      student/ (StudentPage, KickedOut)
    services/
      socket.js (socket initialization & event wiring)
    store/
      index.js (Redux store)
      poll/reducer.js
      user/reducer.js
  public/ (static assets)
```

## Environment variables
The frontend expects the backend URL to connect sockets.

- **VITE_BACKEND_URL**: Base URL of the backend Socket.IO server. Example: `http://localhost:4000`

Create a `.env` file in `frontend/`:
```
VITE_BACKEND_URL=http://localhost:4000
```

If omitted, it defaults to `http://localhost:4000` in `src/services/socket.js`.

## Getting started (local development)
Prerequisites: Node.js 18+ and pnpm/npm/yarn.

1) Install dependencies
```
npm install
```

2) Run the development server
```
npm run dev
```
Vite will print a local URL (typically `http://localhost:5173`). Ensure the backend is running and reachable at `VITE_BACKEND_URL`.

3) Optional: Preview a production build
```
npm run build
npm run preview
```

## Available scripts
- **npm run dev**: Start Vite dev server with HMR.
- **npm run build**: Production build to `dist/`.
- **npm run preview**: Preview the production build locally.
- **npm run lint**: Run ESLint checks.

## Development notes
- **State management**: The Redux store lives in `src/store`. The `poll` reducer manages poll lifecycle (waiting, started, tick, update, ended). The `user` reducer tracks join state and identity.
- **Sockets**: `src/services/socket.js` creates a singleton Socket.IO client and dispatches Redux actions on events like `poll:started`, `poll:update`, `poll:ended`, and handles duplicate names (`name-taken`).
- **Routing**: Components for teacher/student flows are organized by role. See `App.jsx` and `components/*`.
- **Styling**: TailwindCSS utilities are available via the Vite plugin; global styles in `src/index.css`.
- **Toasts**: `react-toastify` provides success/error notifications for join and validation events.

## Troubleshooting
- **Cannot connect to sockets**: Verify backend is running and `VITE_BACKEND_URL` is correct and reachable from the browser. Check CORS and Socket.IO transport (`websocket`).
- **Mobile layout issues**: This UI is desktop‑first; some mobile views may overflow or stack incorrectly.
- **Blank screen / errors in console**: Run `npm run lint`, fix reported issues, and ensure compatible Node version.
- **Port conflicts**: If `5173` is in use, Vite will choose another port; read the terminal output.

## License
This frontend is part of the Live Polling System. See the root repository for licensing details.
