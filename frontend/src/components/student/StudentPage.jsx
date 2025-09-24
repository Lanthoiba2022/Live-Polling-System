import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../services/socket'
import { toast } from 'react-toastify'
import BrandBadge from '../ui/BrandBadge'
import CircularLoader from '../ui/CircularLoader'
import QuestionAnswerCard from '../ui/QuestionAnswerCard'
import ResultBar from '../ui/ResultBar'

function NameEntry({ onSubmit }) {
  const [name, setName] = useState('')
  const submit = () => {
    if (!name.trim()) return
    onSubmit(name.trim())
  }
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex justify-center mb-8">
        <BrandBadge />
      </div>

      <h1 className="text-center text-4xl md:text-5xl font-semibold tracking-tight text-[var(--heading)]">
        Let’s <span className="font-extrabold">Get Started</span>
      </h1>
      <p className="mt-3 text-center text-base text-[var(--muted)] max-w-3xl mx-auto">
        If you’re a student, you’ll be able to <span className="font-semibold text-[var(--heading)]">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
      </p>

      <div className="mt-10 max-w-xl mx-auto">
        <label className="block text-sm font-medium text-[var(--heading)] mb-2">Enter your Name</label>
        <input
          className="w-full h-12 px-4 rounded-md border border-gray-200 bg-[#f2f2f2] text-[var(--heading)] placeholder:text-gray-500 focus:outline-none"
          placeholder="Your name"
          value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && submit()}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="min-w-[220px] h-12 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(83,76,255,0.25)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function Waiting() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex justify-center mb-6">
        <BrandBadge />
      </div>
      <div className="flex flex-col items-center">
        <CircularLoader className="mb-6" />
        <p className="text-2xl md:text-[28px] font-extrabold tracking-tight text-[var(--heading)] text-center">
          Wait for the teacher to ask questions..
        </p>
      </div>
    </div>
  )
}

function Running({ question, remaining, options = [], onSubmit }) {
  const [selected, setSelected] = useState(null)
  return (
    <div className="w-full max-w-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold flex-1">{question}</h2>
        <span className="text-sm opacity-80">Time left: {remaining}s</span>
      </div>
      <div className="space-y-3">
        {options.map((label, idx)=> (
          <button
            key={idx}
            onClick={()=>setSelected(idx)}
            className={
              'w-full h-12 rounded-md border px-4 text-left bg-[#f2f2f2] '+
              (selected===idx ? 'ring-2 ring-[var(--primary-500)] bg-white' : '')
            }
          >
            <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border">{idx+1}</span>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          disabled={selected===null}
          onClick={()=>onSubmit(selected)}
          className="min-w-[220px] h-12 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(83,76,255,0.25)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

function Results({ results }) {
  const total = (results.Yes || 0) + (results.No || 0)
  const yesPct = total ? Math.round((results.Yes||0) * 100 / total) : 0
  const noPct = 100 - yesPct
  return (
    <div className="w-full max-w-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Results</h3>
      <div className="mb-2">Yes: {results.Yes||0} ({yesPct}%)</div>
      <div className="mb-2">No: {results.No||0} ({noPct}%)</div>
      <div className="w-full h-3 bg-gray-200 rounded">
        <div className="h-3 bg-green-500 rounded" style={{ width: `${yesPct}%` }} />
      </div>
    </div>
  )
}

export default function StudentPage() {
  const dispatch = useDispatch()
  const { name, joined } = useSelector(s=>s.user)
  const poll = useSelector(s=>s.poll)
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {
    const socket = getSocket()
    if (joined && name) {
      socket.emit('student:join', { name })
    }
  }, [joined, name])

  const handleJoin = (n) => {
    if (!n) return
    dispatch({ type: 'user/setName', payload: n })
    dispatch({ type: 'user/setJoined', payload: true })
    toast.success(`Joined as ${n}`)
  }

  const handleVote = (optionIndex) => {
    const socket = getSocket()
    socket.emit('poll:vote', { optionIndex })
  }

  return (
    <div className="min-h-dvh flex items-center justify-center">
      {!joined ? (
        <NameEntry onSubmit={handleJoin} />
      ) : poll.status === 'waiting' || poll.status === 'idle' ? (
        <Waiting />
      ) : poll.status === 'running' ? (
        <div className="w-full max-w-3xl px-6">
          <div className="flex items-center gap-8 mb-4">
            <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight">Question 1</h2>
            <span className="text-sm flex items-center gap-2">
              <span aria-hidden>⏱</span>
              <span className="font-semibold" style={{color:'#EF4444'}}>00:{String(poll.remaining).padStart(2,'0')}</span>
            </span>
          </div>
          <QuestionAnswerCard
            question={poll.question}
            options={poll.options}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
          <div className="mt-6 flex justify-center">
            <button
              onClick={()=>selectedIndex!==null && handleVote(selectedIndex)}
              disabled={selectedIndex===null}
              className="min-w-[220px] h-12 rounded-full text-white font-semibold shadow-[0_8px_24px_rgba(83,76,255,0.25)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"
            >
              Submit
            </button>
          </div>
          <button aria-label="chat" className="fixed bottom-6 right-6 w-14 h-14 rounded-full grid place-items-center text-white bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] shadow-[0_10px_30px_rgba(83,76,255,0.35)]">
            💬
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl px-6">
          <div className="flex items-center gap-8 mb-4">
            <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight">Question 1</h2>
            <span className="text-sm flex items-center gap-2">
              <span aria-hidden>⏱</span>
              <span className="font-semibold" style={{color:'#EF4444'}}>00:00</span>
            </span>
          </div>
          <div className="rounded-lg border overflow-hidden w-full bg-white" style={{borderColor:'#D1D5DB'}}>
            <div className="px-4 py-3 text-white font-medium" style={{background:'linear-gradient(90deg,#3F3F46,#6B7280)'}}>
              {poll.question}
            </div>
            <div className="p-4 space-y-4">
              {(poll.options||[]).map((label, idx)=>{
                const total = (poll.optionCounts||[]).reduce((a,b)=>a+(b||0), 0)
                return (
                  <ResultBar key={idx} index={idx+1} label={label} value={(poll.optionCounts||[])[idx]||0} total={total} />
                )
              })}
            </div>
          </div>
          <p className="text-center mt-8 text-[18px] font-extrabold tracking-tight text-[var(--heading)]">Wait for the teacher to ask a new question.</p>
        </div>
      )}
      <button aria-label="chat" className="fixed bottom-6 right-6 w-14 h-14 rounded-full grid place-items-center text-white bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] shadow-[0_10px_30px_rgba(83,76,255,0.35)]">
        💬
      </button>
    </div>
  )
}


