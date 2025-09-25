import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../services/socket'
import { toast } from 'react-toastify'
import BrandBadge from '../ui/BrandBadge'
import CircularLoader from '../ui/CircularLoader'
import QuestionAnswerCard from '../ui/QuestionAnswerCard'
import ResultBar from '../ui/ResultBar'
import ChatWidget from '../ui/ChatWidget'

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

      <h1 className="studLets">
        Let’s <span className="titleLanding">Get Started</span>
      </h1>
      <p className="mt-3 text-center text-[18px] text-base text-[var(--muted)] max-w-3xl mx-auto">
        If you’re a student, you’ll be able to <span className="font-semibold text-[var(--heading)]">submit your answers</span>, participate in live<br /> polls, and see how your responses compare with your classmates
      </p>

      <div className="mt-10 max-w-xl mx-auto flex flex-col items-center">
        <div className="w-[85%]">
          <label className="block text-lg font-medium text-[var(--heading)] mb-2">Enter your Name</label>
          <input
            className="w-full h-[48px] px-4 rounded-md border border-gray-200 bg-[#f2f2f2] text-[var(--heading)] placeholder:text-gray-500 focus:outline-none"
            placeholder="Your name"
            value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && submit()}
          />
        </div>

      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-[233px] h-[57px] rounded-[34px] py-[17px] px-[70px] text-white text-[18px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#8F64E1] via-[#537BE5] to-[#1D68BD]"
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
      <div className="flex justify-center mb-12">
        <BrandBadge />
      </div>
      <div className="flex flex-col items-center">
        <CircularLoader className="mb-12" />
        <p className="questionWaitingText">
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
              'w-full h-12 rounded-md border px-4 text-left bg-[#f2f2f2] cursor-pointer '+
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
  const { name, joined, role } = useSelector(s=>s.user)
  const poll = useSelector(s=>s.poll)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [submittedRemaining, setSubmittedRemaining] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0) // starts at 0; first running => 1
  const [prevStatus, setPrevStatus] = useState(null)

  // No auto emit on joined/name; we emit explicitly on submit and
  // rely on server ack events to confirm join
  useEffect(() => {
  }, [joined, name])

  // Reset local submission state when a new poll starts or ends
  useEffect(() => {
    // increment question number on transition into running state
    if (poll.status === 'running' && prevStatus !== 'running') {
      setQuestionNumber(n => n + 1)
    }
    setPrevStatus(poll.status)

    if (poll.status === 'running') {
      setSubmittedRemaining(null)
      setSelectedIndex(null)
    }
    if (poll.status === 'ended') {
      // keep submittedRemaining as is for the ended view
    }
    if (poll.status === 'waiting') {
      setSubmittedRemaining(null)
      setSelectedIndex(null)
    }
  }, [poll.status])

  const handleJoin = (n) => {
    if (!n) return
    const socket = getSocket()
    socket.emit('student:join', { name: n })
  }

  const handleVote = (optionIndex) => {
    const socket = getSocket()
    socket.emit('poll:vote', { optionIndex })
    // Freeze timer locally at the moment of submission
    if (submittedRemaining === null) {
      setSubmittedRemaining(poll.remaining)
    }
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
            <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight">Question {questionNumber || 1}</h2>
            <span className="text-xl flex items-center gap-1">
              <span aria-hidden><img src="/clock.svg" alt="Timer" className="w-7 h-7" /></span>
              <span className="font-semibold" style={{color:'#EF4444'}}>00:{String(submittedRemaining ?? poll.remaining).padStart(2,'0')}</span>
            </span>
          </div>
          {submittedRemaining===null ? (
            <>
              <QuestionAnswerCard
                question={poll.question}
                options={poll.options}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => selectedIndex !== null && handleVote(selectedIndex)}
                  disabled={selectedIndex === null}
                  className="submitBtn cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className='w-[68px] h-[23px] font-semibold text-[18px] text-[#FFFFFF]'>Submit</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden w-full bg-white mt-6" style={{borderColor:'#D1D5DB'}}>
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
              <p className="waitAfterSubmit mt-12">Wait for the teacher to ask a new question..</p>
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-3xl px-6">
          <div className="flex items-center gap-8 mb-4">
            <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight">Question {questionNumber || 1}</h2>
            <span className="text-xl flex items-center gap-1">
              <span aria-hidden><img src="/clock.svg" alt="Timer" className="w-7 h-7" /></span>
              <span className="font-semibold" style={{color:'#EF4444'}}>00:{String(submittedRemaining ?? 0).padStart(2,'0')}</span>
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
          <p className="waitAfterSubmit mt-12">Wait for the teacher to ask a new question..</p>
        </div>
      )}
      {joined && <ChatWidget room="poll-global" />}
    </div>
  )
}


