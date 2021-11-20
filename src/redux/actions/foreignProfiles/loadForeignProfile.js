import store from 'redux/store'
import { LOAD_FOREIGN_PROFILE } from 'redux/types'
import { PROFILES_BUS_ID } from 'parameters'
import parapet from 'parapet-js'

/*
Loads a foreign user profile into state, pulling it from the blockchain.

Normally, you wouldn't return a return value from a Redux action, but we need
the result in a few places where we can't easily grab it from state. If there
is a better way to do this, contributions are welcome.
*/
export default async userID => {
  // Find the profile with parapet
  const queryResult = await parapet({
    bridge: PROFILES_BUS_ID,
    request: {
      type: 'json-query',
      query: {
        v: 3,
        q: {
          collection: 'profiles',
          find: { userID },
          limit: 1,
          sort: {
            timestamp: -1
          }
        }
      }
    }
  })
  if (queryResult.length === 0) {
    return null
  }
  const {
    name, photoURL, primarySigningPub, privilegedSigningPub
  } = queryResult[0]
  const newProfile = {
    userID,
    name,
    photoURL,
    primarySigningPub,
    privilegedSigningPub
  }
  // Dispatch and return the new profile
  store.dispatch({
    type: LOAD_FOREIGN_PROFILE,
    payload: newProfile
  })
  return newProfile
}
