import { createStore, combineReducers } from 'redux'
import userReducer from './user/reducer'
import pollReducer from './poll/reducer'

const rootReducer = combineReducers({
  user: userReducer,
  poll: pollReducer,
})

const store = createStore(rootReducer)
export default store


