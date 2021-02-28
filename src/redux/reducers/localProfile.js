import {
  LOAD_LOCAL_PROFILE,
  UPDATE_LOCAL_PROFILE,
  UNLOAD_LOCAL_PROFILE
} from 'redux/types'

export const initialState = {
  loaded: false,
  editorOpen: false,
  settingsOpen: false,
  welcomeMessage: false,
  userID: undefined,
  name: undefined,
  photoURL: undefined
}

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_LOCAL_PROFILE:
      return {
        ...state,
        loaded: true,
        userID: action.userID,
        name: action.name,
        photoURL: action.photoURL
      }
    case UPDATE_LOCAL_PROFILE:
      return {
        ...state,
        ...action.payload
      }
    case UNLOAD_LOCAL_PROFILE:
      return initialState
    default:
      return state
  }
}
