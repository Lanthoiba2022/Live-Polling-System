import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './components/Landing'
import TeacherPage from './components/teacher/TeacherPage'
import StudentPage from './components/student/StudentPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-center" />
    </>
  )
}

export default App
