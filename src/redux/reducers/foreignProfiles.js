import {
  LOAD_FOREIGN_PROFILE,
  UNLOAD_FOREIGN_PROFILE,
  UNLOAD_ALL_FOREIGN_PROFILES
} from 'redux/types'

/*
The structure is that the root object contains keys denoting the CWI user ID
addresses of foreign users, and its values are user objects containing name,
profilePhotoURL, and the foreign user's two public keys.
*/

// The initial state is that there are no foreign profiles.
export const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FOREIGN_PROFILE:
      return {
        ...state,
        [action.payload.userID]: {
          ...state[action.payload.userID],
          ...action.payload
        }
      }
    case UNLOAD_FOREIGN_PROFILE:
      return {
        ...state,
        [action.userID]: undefined
      }
    case UNLOAD_ALL_FOREIGN_PROFILES:
      return initialState
    default:
      return state
  }
}
