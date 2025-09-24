import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BrandBadge from './ui/BrandBadge'

export default function Landing() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [role, setRole] = useState(null)

  const continueNext = () => {
    if (!role) return
    dispatch({ type: 'user/setRole', payload: role })
    navigate(role === 'teacher' ? '/teacher' : '/student')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-center mb-6">
          <BrandBadge />
        </div>

        <h1 className="text-center text-4xl md:text-5xl font-semibold tracking-tight text-[var(--heading)]">
          Welcome to the <span className="font-extrabold">Live Polling System</span>
        </h1>
        <p className="mt-3 text-center text-base text-[var(--muted)] max-w-3xl mx-auto">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <RoleCard
            title="I’m a Student"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
            selected={role === 'student'}
            onClick={() => setRole('student')}
          />
          <RoleCard
            title="I’m a Teacher"
            description="Submit answers and view live poll results in real-time."
            selected={role === 'teacher'}
            onClick={() => setRole('teacher')}
          />
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={continueNext}
            disabled={!role}
            className="min-w-[220px] h-12 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(83,76,255,0.25)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ title, description, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-left w-full rounded-2xl p-6 bg-white border transition shadow-[0_1px_2px_rgba(16,24,40,0.05)] '+
        (selected
          ? 'border-[3px] border-[var(--primary-400)]'
          : 'border border-[var(--card-border)] hover:border-[var(--primary-300)]')
      }
    >
      <div className="text-lg font-semibold text-[var(--heading)] mb-2">{title}</div>
      <div className="text-sm leading-6 text-[var(--muted)]">{description}</div>
    </button>
  )
}


