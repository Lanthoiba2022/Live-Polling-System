## Live Polling System — Backend

Node.js backend powering real‑time classroom polling and lightweight chat via Socket.IO. Uses in‑memory state (no database) and a single process.

### Features
- Real‑time poll lifecycle with countdown: start, per‑second tick, live results, auto/early end
- Student join with duplicate‑name prevention
- One‑vote‑per‑student enforcement for active poll
- In‑memory poll history retrieval (latest first)
- Lightweight room‑based chat with presence list
- Teacher ability to kick a participant from chat and poll
- CORS enabled for browser clients

### Tech stack (actual)
- Node.js with **Express.js** (HTTP endpoints)
- **Socket.IO** (real‑time transport)
- **cors** middleware
- **http** core module (server)
- Development: **nodemon** (via `npm run dev`)

### Project structure (backend)
```
backend/
  src/
    index.js   # Express app, Socket.IO server, in‑memory state and events
  package.json
```

### Environment variables
- `PORT` (optional): HTTP server port (default: `4000`).

### HTTP endpoints
- `GET /` → `{ ok: true }` health check
- `GET /history` → `{ items: PollSnapshot[] }` latest‑first in‑memory history

PollSnapshot shape (example):
```
{
  id: number,
  question: string,
  options: string[],
  optionCounts: number[],
  startedAt: number,   // epoch ms
  endedAt: number,     // epoch ms
  duration: number,    // seconds
  reason: 'time' | 'all-answered'
}
```

### Socket.IO events

Client → Server
- `student:join` { name }
- `poll:start` { question, duration, options: string[] }
- `poll:vote` { optionIndex }
- `poll:prepare`
- `chat:join` { room?, name?, role? }
- `chat:leave` { room? }
- `chat:list` { room? }
- `chat:message` { room?, text, name?, role? }
- `chat:kick` { room?, name }

Server → Client
- `poll:waiting`
- `poll:started` { question, duration, options }
- `poll:tick` number // remaining seconds
- `poll:update` { optionCounts }
- `poll:ended` { optionCounts }
- `name-taken`
- `student:joined` { name }
- `chat:joined` { name, role }
- `chat:left` { name }
- `chat:participants` Array<{ name: string }>
- `student:kicked`

### State model (in‑memory)
Maintained in `src/index.js`:
- `studentsBySocketId: Map<socketId, name>`
- `activeNames: Set<name>` (enforce unique join names)
- `poll`: running, question, optionsText, duration, endsAt, timer, optionCounts[], answersByName
- `history: PollSnapshot[]`
- `chat`: `participantsByRoom: Map<room, Set<name>>`, `sockets: Map<socketId, { name, rooms: Set<room> }>`

### Local setup
1) Install dependencies
```
npm install
```

2) Development (with auto‑reload)
```
npm run dev
```

3) Production run
```
npm start
```

Server listens on `http://localhost:4000` by default (or `PORT`). CORS is open (`*`) for GET/POST.

### Notes
- Single process, ephemeral memory: history resets on restart; not clustered.
- Poll ends automatically when time runs out or all currently joined students have voted.


