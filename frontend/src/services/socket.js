import { io } from 'socket.io-client'
import store from '../store'
import { toast } from 'react-toastify'

let socket

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
      transports: ['websocket'],
    })

    socket.on('connect_error', () => toast.error('Connection error'))
    socket.on('name-taken', () => toast.error('Name already taken in this room. Pick a different one.'))

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


