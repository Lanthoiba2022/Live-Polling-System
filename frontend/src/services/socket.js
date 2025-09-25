import { io } from 'socket.io-client'
import store from '../store'
import { toast } from 'react-toastify'

let socket

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
      transports: ['websocket'],
    })

    // Removed non-student toast notifications

    // Duplicate name handling
    socket.on('name-taken', () => {
      store.dispatch({ type: 'user/setJoined', payload: false })
      store.dispatch({ type: 'user/setName', payload: '' })
      toast.error('This name is already in use. Please choose another.')
    })

    // Successful join ack
    socket.on('student:joined', ({ name }) => {
      store.dispatch({ type: 'user/setName', payload: name })
      store.dispatch({ type: 'user/setJoined', payload: true })
      toast.success(`Joined as ${name}`)
    })

    socket.on('poll:waiting', () => {
      store.dispatch({ type: 'poll/waiting' })
    })
    socket.on('poll:started', ({ question, duration, options }) => {
      store.dispatch({ type: 'poll/started', payload: { question, duration, options } })
    })
    socket.on('poll:tick', (remaining) => {
      store.dispatch({ type: 'poll/tick', payload: remaining })
    })
    socket.on('poll:update', (payload) => {
      store.dispatch({ type: 'poll/update', payload })
    })
    socket.on('poll:ended', (payload) => {
      store.dispatch({ type: 'poll/ended', payload })
    })
  }
  return socket
}


