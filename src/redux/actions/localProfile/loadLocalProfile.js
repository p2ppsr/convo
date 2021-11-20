import parapet from 'parapet-js'
import { PROFILES_BUS_ID } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import getUserID from 'utils/getUserID'

/*
Loads the local user profile from the blockchain.
*/
export default async () => {
  const userID = await getUserID()
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
    /*
      When no profile exists, open the welcome page of the editor
      This is the first time that this CWI user is using is on-chain profile
      protocol.
    */
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        loaded: false,
        editorOpen: true,
        welcomeMessage: true,
        // Also set the default profile photo
        photoURL: 'uhrp:XUUDw85K5U6ccmjGjtirk1wZnsruBXayzuLeqz4woTQK1LfhvuY6'
      }
    })
    return
  }
  const { name, photoURL } = queryResult[0]
  const newProfile = { userID, name, photoURL }
  // Dispatch the new profile
  store.dispatch({
    type: UPDATE_LOCAL_PROFILE,
    payload: {
      ...newProfile,
      loaded: true
    }
  })
}
