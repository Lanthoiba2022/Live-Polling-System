import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ResultBar from '../ui/ResultBar'
import ChatWidget from '../ui/ChatWidget'

export default function PollHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const rawBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        const base = rawBase.replace(/\/+$/,'')
        const res = await fetch(`${base}/history`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch history')
        const data = await res.json()
        const list = Array.isArray(data.items) ? data.items : []
        // Backend returns newest first; display oldest -> newest
        setItems([...list].reverse())
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Error loading history')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[40px]">View <span className="titleLanding">Poll History</span></h1>
          <Link to="/teacher" className="h-10 px-4 rounded-full border text-[var(--primary-700)] border-[var(--primary-300)] grid place-items-center">Back</Link>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="space-y-12">
          {items.map((poll, idx) => (
            <div key={poll.id}>
              <h2 className="text-[20px] font-semibold mb-3">Question {idx + 1}</h2>
              <div className="rounded-lg border overflow-hidden w-full bg-white" style={{borderColor:'#D1D5DB'}}>
                <div className="px-4 py-3 text-white font-medium" style={{background:'linear-gradient(90deg,#3F3F46,#6B7280)'}}>
                  {poll.question}
                </div>
                <div className="p-4 space-y-4">
                  {(poll.options||[]).map((label, i)=>{
                    const total = (poll.optionCounts||[]).reduce((a,b)=>a+(b||0),0)
                    return (
                      <ResultBar key={i} index={i+1} label={label} value={(poll.optionCounts||[])[i]||0} total={total} />
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <div className="text-gray-500">No polls yet. Create one to see history here.</div>
          )}
        </div>
      </div>
      {/* Always show chat on history page for teacher */}
      <ChatWidget room="poll-global" requireJoined={false} identity={{ name: 'Teacher', role: 'teacher' }} />
    </div>
  )
}


