import './App.css'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Landing from './components/Landing'
import TeacherPage from './components/teacher/TeacherPage'
import StudentPage from './components/student/StudentPage'
import PollHistory from './components/teacher/PollHistory'
import KickedOut from './components/student/KickedOut'
import { useEffect } from 'react'
import { getSocket } from './services/socket'
import { useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function CloseButton({ closeToast }) {
  return (
    <button
      onClick={closeToast}
      aria-label="Close notification"
      className="ml-2 text-gray-700 hover:text-gray-900 rounded-md p-1 hover:bg-gray-200 focus:outline-none"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    const socket = getSocket()
    const onKicked = () => {
      dispatch({ type: 'user/setJoined', payload: false })
      dispatch({ type: 'user/setRole', payload: 'kicked' })
      navigate('/kicked', { replace: true })
    }
    socket.on('student:kicked', onKicked)
    return () => socket.off('student:kicked', onKicked)
  }, [dispatch])
  return (
    <div className="app-scale-viewport">
      <div className="app-scale">
        <div className="app-canvas">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/teacher" element={<TeacherPage />} />
            <Route path="/teacher/history" element={<PollHistory />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/kicked" element={<KickedOut />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            newestOnTop
            closeOnClick
            pauseOnHover
            hideProgressBar
            closeButton={<CloseButton />}
            theme="light"
            toastClassName={() =>
              'bg-white shadow-md border border-gray-200 inline-flex items-center gap-2 min-h-0 py-1.5 px-3 text-xs text-gray-900 whitespace-nowrap rounded-md'
            }
            bodyClassName={() => 'm-0 p-0 whitespace-nowrap'}
            style={{ zIndex: 9999 }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
