const initial = {
  role: null,
  name: '',
  joined: false,
}

export default function userReducer(state = initial, action) {
  switch (action.type) {
    case 'user/setRole':
      return { ...state, role: action.payload }
    case 'user/setName':
      return { ...state, name: action.payload }
    case 'user/setJoined':
      return { ...state, joined: action.payload }
    default:
      return state
  }
}


