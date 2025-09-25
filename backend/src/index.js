const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// In-memory state for a single-room poll
const state = {
  studentsBySocketId: new Map(), // socketId -> name
  activeNames: new Set(), // currently joined names (unique per tab)
  chat: {
    // room -> Set(name)
    participantsByRoom: new Map(),
    // socketId -> { name, rooms: Set(room) }
    sockets: new Map(),
  },
  poll: {
    running: false,
    question: '',
    optionsText: [],
    duration: 0,
    endsAt: 0,
    timer: null,
    results: { Yes: 0, No: 0 }, // legacy
    optionCounts: [], // array of counts per option
    answersByName: new Map(), // name -> optionIndex
  },
  history: [], // array of { id, question, options, optionCounts, startedAt, endedAt, duration }
}

function broadcastWaitingIfIdle() {
  if (!state.poll.running && state.poll.question === '') {
    io.emit('poll:waiting')
  }
}

function endPoll(reason = 'time') {
  if (!state.poll.running) return
  clearInterval(state.poll.timer)
  state.poll.timer = null
  const snapshot = {
    id: Date.now(),
    question: state.poll.question,
    options: [...state.poll.optionsText],
    optionCounts: [...state.poll.optionCounts],
    startedAt: state.poll.endsAt - state.poll.duration * 1000,
    endedAt: Date.now(),
    duration: state.poll.duration,
    reason,
  }
  state.history.push(snapshot)
  state.poll.running = false
  io.emit('poll:ended', { optionCounts: [...state.poll.optionCounts] })
  // reset question to allow next
  state.poll.question = ''
  state.poll.duration = 0
  state.poll.endsAt = 0
  state.poll.answersByName.clear()
  state.poll.results = { Yes: 0, No: 0 }
  state.poll.optionsText = []
  state.poll.optionCounts = []
}

io.on('connection', (socket) => {
  // On connect, inform client of waiting if no poll is active
  broadcastWaitingIfIdle()

  socket.on('disconnect', () => {
    const name = state.studentsBySocketId.get(socket.id)
    if (name) {
      state.studentsBySocketId.delete(socket.id)
      state.activeNames.delete(name)
    }

    // Chat presence cleanup
    const chatMeta = state.chat.sockets.get(socket.id)
    if (chatMeta) {
      const leavingName = chatMeta.name
      for (const room of chatMeta.rooms) {
        const set = state.chat.participantsByRoom.get(room)
        if (set) {
          set.delete(leavingName)
          io.to(room).emit('chat:left', { name: leavingName })
          io.to(room).emit('chat:participants', Array.from(set).map((n) => ({ name: n })))
        }
      }
      state.chat.sockets.delete(socket.id)
    }
  })

  socket.on('student:join', ({ name }) => {
    const trimmed = String(name || '').trim()
    if (!trimmed) return
    if (state.activeNames.has(trimmed)) {
      socket.emit('name-taken')
      return
    }
    state.activeNames.add(trimmed)
    state.studentsBySocketId.set(socket.id, trimmed)
    // acknowledge successful join
    socket.emit('student:joined', { name: trimmed })
    // If a poll is running, send current snapshot
    if (state.poll.running) {
      const remaining = Math.max(0, Math.ceil((state.poll.endsAt - Date.now()) / 1000))
      socket.emit('poll:started', { question: state.poll.question, duration: remaining, options: state.poll.optionsText })
      socket.emit('poll:update', { optionCounts: [...state.poll.optionCounts] })
    } else if (state.poll.question === '') {
      socket.emit('poll:waiting')
    }
  })

  socket.on('poll:start', ({ question, duration, options }) => {
    const q = String(question || '').trim()
    let d = Number(duration) || 60
    if (!q) return
    if (state.poll.running) return
    // start new poll
    state.poll.running = true
    state.poll.question = q
    state.poll.optionsText = Array.isArray(options)
      ? options.map((t)=>String(t||'').trim()).filter(Boolean)
      : []
    state.poll.duration = d
    state.poll.endsAt = Date.now() + d * 1000
    state.poll.results = { Yes: 0, No: 0 }
    state.poll.optionCounts = new Array(state.poll.optionsText.length).fill(0)
    state.poll.answersByName.clear()

    io.emit('poll:started', { question: q, duration: d, options: state.poll.optionsText })

    // tick every second
    state.poll.timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((state.poll.endsAt - Date.now()) / 1000))
      io.emit('poll:tick', remaining)
      if (remaining <= 0) {
        endPoll('time')
      }
    }, 1000)
  })

  socket.on('poll:vote', ({ optionIndex }) => {
    if (!state.poll.running) return
    const idx = Number(optionIndex)
    if (!Number.isInteger(idx) || idx < 0 || idx >= state.poll.optionsText.length) return
    const name = state.studentsBySocketId.get(socket.id)
    if (!name) return
    if (state.poll.answersByName.has(name)) return // already voted
    state.poll.answersByName.set(name, idx)
    state.poll.optionCounts[idx] = (state.poll.optionCounts[idx] || 0) + 1
    io.emit('poll:update', { optionCounts: [...state.poll.optionCounts] })

    // If all currently joined students have answered, end early
    if (state.poll.answersByName.size >= state.activeNames.size) {
      endPoll('all-answered')
    }
  })

  // When teacher returns to question creation, notify students to wait
  socket.on('poll:prepare', () => {
    if (!state.poll.running) {
      io.emit('poll:waiting')
    }
  })

  // ===== Chat events =====
  socket.on('chat:join', ({ room, name, role }) => {
    const r = String(room || 'poll-global')
    const displayName = String(name || state.studentsBySocketId.get(socket.id) || 'User').trim()
    if (!displayName) return
    socket.join(r)

    // track socket meta
    const meta = state.chat.sockets.get(socket.id) || { name: displayName, rooms: new Set() }
    meta.name = displayName
    meta.rooms.add(r)
    state.chat.sockets.set(socket.id, meta)

    // add to participants set
    const set = state.chat.participantsByRoom.get(r) || new Set()
    set.add(displayName)
    state.chat.participantsByRoom.set(r, set)

    // notify room
    socket.to(r).emit('chat:joined', { name: displayName, role })
    io.to(r).emit('chat:participants', Array.from(set).map((n) => ({ name: n })))
  })

  socket.on('chat:leave', ({ room }) => {
    const r = String(room || 'poll-global')
    const meta = state.chat.sockets.get(socket.id)
    if (!meta) return
    const name = meta.name
    socket.leave(r)
    if (meta.rooms.has(r)) meta.rooms.delete(r)
    const set = state.chat.participantsByRoom.get(r)
    if (set) {
      set.delete(name)
      io.to(r).emit('chat:left', { name })
      io.to(r).emit('chat:participants', Array.from(set).map((n) => ({ name: n })))
    }
  })

  socket.on('chat:list', ({ room }) => {
    const r = String(room || 'poll-global')
    const set = state.chat.participantsByRoom.get(r) || new Set()
    socket.emit('chat:participants', Array.from(set).map((n) => ({ name: n })))
  })

  socket.on('chat:message', ({ room, text, name, role }) => {
    const r = String(room || 'poll-global')
    const messageText = String(text || '').trim()
    if (!messageText) return
    const displayName = String(name || state.studentsBySocketId.get(socket.id) || 'User').trim()
    const payload = {
      id: Date.now(),
      room: r,
      name: displayName,
      role: role || null,
      text: messageText,
      ts: Date.now(),
    }
    // Send to everyone EXCEPT the sender to avoid duplicate (client appends optimistically)
    socket.to(r).emit('chat:message', payload)
  })

  // Teacher kicks a student from room and poll
  socket.on('chat:kick', ({ room, name }) => {
    const r = String(room || 'poll-global')
    const targetName = String(name || '').trim()
    if (!targetName) return
    // find sockets belonging to this name
    for (const [sid, info] of state.chat.sockets.entries()) {
      if (info.name === targetName && info.rooms.has(r)) {
        const s = io.sockets.sockets.get(sid)
        if (s) {
          s.leave(r)
          info.rooms.delete(r)
          s.emit('student:kicked')
        }
      }
    }
    const set = state.chat.participantsByRoom.get(r)
    if (set) {
      set.delete(targetName)
      io.to(r).emit('chat:participants', Array.from(set).map((n) => ({ name: n })))
    }
    // Also remove from poll presence
    state.activeNames.delete(targetName)
    for (const [sid, nm] of state.studentsBySocketId.entries()) {
      if (nm === targetName) {
        state.studentsBySocketId.delete(sid)
      }
    }
  })
})

app.get('/', (req, res) => {
  res.json({ ok: true })
})

// Return in-memory poll history (latest first)
app.get('/history', (req, res) => {
  res.json({ items: [...state.history].reverse() })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})


