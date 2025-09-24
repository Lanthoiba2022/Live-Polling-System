import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getSocket } from '../../services/socket'
import BrandBadge from '../ui/BrandBadge'
import TimeSelect from './TimeSelect'
import TextAreaWithCounter from '../ui/TextAreaWithCounter'
import YesNoRadio from '../ui/YesNoRadio'
import QuestionAnswerCard from '../ui/QuestionAnswerCard'
import ResultBar from '../ui/ResultBar'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

export default function TeacherPage() {
  const dispatch = useDispatch()
  const [question, setQuestion] = useState('')
  const [duration, setDuration] = useState(60)
  const [options, setOptions] = useState([
    { id: 1, text: '', correct: 'Yes' },
    { id: 2, text: '', correct: 'No' },
  ])
  const poll = useSelector(s=>s.poll)
  const totalVotes = poll.optionCounts && poll.optionCounts.length
    ? poll.optionCounts.reduce((a,b)=>a+b,0)
    : (poll.results.Yes||0)+(poll.results.No||0)

  useEffect(() => {
    getSocket()
  }, [])

  // Ensure students see waiting screen while teacher is preparing the next question
  const preparedRef = useRef(false)
  useEffect(() => {
    const isCreating = poll.status !== 'running' && poll.status !== 'ended'
    if (isCreating && !preparedRef.current) {
      preparedRef.current = true
      const socket = getSocket()
      socket.emit('poll:prepare')
    }
    if (!isCreating) {
      preparedRef.current = false
    }
  }, [poll.status])

  const startPoll = () => {
    if (!question.trim()) { toast.error('Please enter a question'); return }
    const socket = getSocket()
    const optionTexts = options.map(o=>o.text.trim()).filter(Boolean)
    if (optionTexts.length < 2) { toast.error('Enter at least 2 options'); return }
    const payload = { question: question.trim(), duration: Number(duration) || 60, options: optionTexts }
    socket.emit('poll:start', payload)
    // Optimistically update local state so UI shows options immediately
    dispatch({ type: 'poll/started', payload })
  }

  return (
    <div className="min-h-dvh bg-white">
      {poll.status !== 'running' && poll.status !== 'ended' ? (
          <div className="max-w-5xl mx-auto px-6 pt-10 pb-28">
            <div className="mb-6"><BrandBadge /></div>
          <>
            <h1 className="text-4xl font-semibold text-[var(--heading)] mb-2">Let’s <span className="font-extrabold">Get Started</span></h1>
            <p className="text-[15px] text-[var(--muted)] max-w-3xl mb-10">you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>

            <div className="flex items-center justify-between mb-3">
              <label className="text-[16px] font-semibold">Enter your question</label>
              <TimeSelect value={duration} onChange={setDuration} />
            </div>
            <TextAreaWithCounter value={question} onChange={setQuestion} max={100} placeholder="Type your question here" />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <div className="text-[16px] font-semibold mb-3">Edit Options</div>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-6 grid place-items-center rounded-full bg-[var(--primary-600)] text-white text-sm">{idx+1}</span>
                    <input className="flex-1 h-11 px-4 rounded-md border border-gray-200 bg-[#f2f2f2]" value={opt.text} onChange={(e)=>{
                      const list = [...options]; list[idx] = { ...opt, text: e.target.value }; setOptions(list)
                    }} />
                  </div>
                ))}
                <button onClick={()=>setOptions([...options, { id: Date.now(), text:'', correct: 'Yes' }])} className="mt-2 h-10 px-4 rounded-md border text-[var(--primary-700)] border-[var(--primary-300)]">+ Add More option</button>
              </div>

              <div>
                <div className="text-[16px] font-semibold mb-3">Is it Correct?</div>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-4 mb-6">
                    <YesNoRadio name={`opt-${opt.id}`} value={opt.correct} onChange={(v)=>{
                      const list = [...options]; list[idx] = { ...opt, correct: v }; setOptions(list)
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        </div>
      ) : (
        <div className="min-h-dvh flex items-center justify-center">
          {poll.status === 'ended' && (
            <Link to="/teacher/history" className="fixed top-14 right-12 h-12 px-6 rounded-full text-white font-semibold bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] grid place-items-center shadow-[0_8px_24px_rgba(83,76,255,0.25)]">
              View Poll history
            </Link>
          )}
          <div className="w-full max-w-3xl px-6">
            <div className="flex items-center gap-8 mb-4">
              <h2 className="text:[22px] md:text-[24px] font-semibold tracking-tight">Question</h2>
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
            <div className="mt-6 flex items-center justify-between">
              <span />
              <button
                className="min-w-[240px] h-12 rounded-full text-white font-semibold bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] disabled:cursor-not-allowed"
                style={{ cursor: poll.status === 'ended' ? 'pointer' : 'not-allowed' }}
                disabled={poll.status !== 'ended'}
                onClick={()=>{
                  const socket = getSocket()
                  socket.emit('poll:prepare')
                  setQuestion('');
                  setOptions([{id:1,text:'',correct:'Yes'},{id:2,text:'',correct:'No'}]);
                  // Return to question creation screen
                  dispatch({ type: 'poll/reset' })
                }}
              >
                + Ask a new question
              </button>
            </div>
          </div>
        </div>
      )}

      {poll.status !== 'running' && poll.status !== 'ended' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-6px_24px_rgba(16,24,40,0.06)]">
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-center">
            <button className="min-w-[220px] h-12 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(83,76,255,0.25)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]" onClick={startPoll}>
              Ask Question
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


