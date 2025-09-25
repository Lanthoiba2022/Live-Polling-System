import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getSocket } from '../../services/socket'

// Reusable chat widget: floating bubble + modal panel
export default function ChatWidget({ room = 'poll-global', className = '' }) {
  const { name, role, joined } = useSelector((s) => s.user)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'participants'
  const [participants, setParticipants] = useState([])
  const listRef = useRef(null)

  // Stable socket instance
  const socket = useMemo(() => getSocket(), [])

  // Join chat room when user joined
  useEffect(() => {
    if (!joined) return
    socket.emit('chat:join', { room })
    // Ensure self appears immediately
    setParticipants((prev) => {
      const me = name
      if (prev.some((p) => p.name === me)) return prev
      return [...prev, { name: me, role: role || 'student' }]
    })
    // Ask server for current participant list if supported
    socket.emit('chat:list', { room })
    return () => {
      socket.emit('chat:leave', { room })
    }
  }, [joined, room, socket])

  // Handle incoming messages and presence
  useEffect(() => {
    function onMessage(payload) {
      if (!payload || payload.room !== room) return
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id || `${Date.now()}-${Math.random()}`,
          name: payload.name,
          role: payload.role,
          text: payload.text,
          ts: payload.ts || Date.now(),
        },
      ])
    }
    function onParticipants(list) {
      // Expect list of {name, role}
      if (!Array.isArray(list)) return
      setParticipants(list.map((u) => (typeof u === 'string' ? { name: u } : u)))
    }
    function onJoined(u) {
      setParticipants((prev) => {
        const n = typeof u === 'string' ? u : u?.name
        if (!n) return prev
        if (prev.some((p) => p.name === n)) return prev
        return [...prev, { name: n, role: u?.role }]
      })
    }
    function onLeft(u) {
      const n = typeof u === 'string' ? u : u?.name
      setParticipants((prev) => prev.filter((p) => p.name !== n))
    }
    socket.on('chat:message', onMessage)
    socket.on('chat:participants', onParticipants)
    socket.on('chat:joined', onJoined)
    socket.on('chat:left', onLeft)
    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:participants', onParticipants)
      socket.off('chat:joined', onJoined)
      socket.off('chat:left', onLeft)
    }
  }, [room, socket])

  // Auto-scroll on new messages when open
  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isOpen])

  const send = () => {
    const text = input.trim()
    if (!text || !joined) return
    const payload = {
      room,
      text,
      name: name || 'Anonymous',
      role: role || 'student',
    }
    socket.emit('chat:message', payload)
    // Optimistic append
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-local`, name: payload.name, role: payload.role, text, ts: Date.now() },
    ])
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className={"fixed bottom-12 right-12 z-[9998] " + className}>
      {/* Bubble toggle */}
      <button
        aria-label="Open chat"
        onClick={() => setIsOpen((v) => !v)}
        className="w-18 h-18 rounded-full shadow-xl flex items-center justify-center bg-[#5A66D1] hover:bg-[#7765DA] hover:opacity-95 cursor-pointer"
      >
        <img src="/chatBub.svg" alt="Chat" className="w-12 h-12 pt-2" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bg-white shadow-2xl border overflow-hidden"
          style={{
            width: 429,
            height: 477,
            top: '19%',
            right: '2%',
            opacity: 1,
            borderRadius: 5,
            borderWidth: 1,
            backdropFilter: 'blur(6px)'
          }}
          role="dialog"
          aria-label="Live chat"
        >
          <div className="px-4 pt-3 bg-white">
            <div className="flex items-center gap-6 text-[15px] font-medium text-gray-800">
              <button
                className={"pb-2 relative cursor-pointer " + (activeTab === 'chat' ? 'text-[#7C3AED]' : '')}
                onClick={() => setActiveTab('chat')}
              >
                Chat
                {activeTab === 'chat' && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-[#7C3AED] rounded-full" />
                )}
              </button>
              <button
                className={"pb-2 relative cursor-pointer " + (activeTab === 'participants' ? 'text-[#7C3AED]' : '')}
                onClick={() => setActiveTab('participants')}
              >
                Participants
                {activeTab === 'participants' && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-[#7C3AED] rounded-full" />
                )}
              </button>
              <div className="ml-auto">
                <button
                  aria-label="Close chat"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-px w-full bg-gray-200" />
          </div>

          {activeTab === 'chat' ? (
            <div ref={listRef} className="px-4 py-3 overflow-y-auto" style={{ height: 361 }}>
              {messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">No messages yet</p>
              ) : (
                <ul className="space-y-6">
                  {messages.map((m) => {
                    const isSelf = (m.name || '') === (name || '')
                    return (
                      <li key={m.id} className={"flex " + (isSelf ? 'justify-end' : 'justify-start')}>
                        <div className="max-w-[78%]">
                          <div className={"text-[12px] font-semibold mb-1 " + (isSelf ? 'text-[#7C3AED] text-right' : 'text-[#7C3AED]')}>
                            {isSelf ? `${m.name || 'User'} (You)` : (m.name || 'User')}
                          </div>
                          <div
                            className={
                              'rounded-xl px-4 py-2 text-[14px] leading-5 break-words whitespace-pre-wrap ' +
                              (isSelf
                                ? 'bg-[#8F64E1] text-white rounded-tr-md'
                                : 'bg-[#1F2937] text-white rounded-tl-md')
                            }
                          >
                            {m.text}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 overflow-y-auto" style={{ height: 361 }}>
              <div className="text-sm text-gray-500 mb-3">Name</div>
              <ul className="space-y-3">
                {participants.map((p) => {
                  const label = p.name === name ? `${p.name} (You)` : p.name
                  return (
                    <li key={p.name} className="text-[14px] text-gray-900 font-semibold">{label}</li>
                  )
                })}
                {participants.length === 0 && (
                  <li className="text-sm text-gray-500">No participants</li>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={joined ? 'Write a message…' : 'Join to chat'}
                  disabled={!joined}
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-gray-200 bg-[#F3F4F6] px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  style={{ maxHeight: 120 }}
                />
                <button
                  onClick={send}
                  disabled={!joined || !input.trim()}
                  className="shrink-0 h-10 px-4 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-[#8F64E1] cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


