const initial = {
  status: 'idle',
  question: '',
  options: [],
  remaining: 0,
  results: { Yes: 0, No: 0 },
  optionCounts: [],
}

export default function pollReducer(state = initial, action) {
  switch (action.type) {
    case 'poll/reset':
      return { ...initial }
    case 'poll/started':
      return {
        ...state,
        status: 'running',
        question: action.payload.question,
        options: action.payload.options || [],
        remaining: action.payload.duration,
        results: { Yes: 0, No: 0 },
        optionCounts: new Array((action.payload.options||[]).length).fill(0),
      }
    case 'poll/tick':
      return { ...state, remaining: action.payload }
    case 'poll/update':
      return { ...state, optionCounts: action.payload.optionCounts ?? state.optionCounts, results: action.payload.results ?? state.results }
    case 'poll/ended':
      return { ...state, status: 'ended', optionCounts: action.payload.optionCounts ?? state.optionCounts }
    case 'poll/waiting':
      return { ...state, status: 'waiting', question: '', remaining: 0, results: { Yes: 0, No: 0 } }
    default:
      return state
  }
}


