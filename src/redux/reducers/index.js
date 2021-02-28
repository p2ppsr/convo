import { combineReducers } from 'redux'
import localProfile from './localProfile'
import foreignProfiles from './foreignProfiles'
import convos from './convos'
import { RESET_APP } from 'redux/types'

export default (state, action) => {
  if (action.type === RESET_APP) {
    state = undefined
  }

  return combineReducers({
    localProfile,
    foreignProfiles,
    convos
  })(state, action)
}
