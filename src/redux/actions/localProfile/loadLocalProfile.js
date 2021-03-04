import parapet from 'parapet-js'
import { PROFILES_BUS_ID } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import getUserID from 'utils/getUserID'

/*
Loads the local user profile. If it is cached, immeduately puts the cached
version in state. If cache is expired, updates state and cache with the latest
data from the blockchain.
*/
export default async () => {
  if (localStorage.localProfile) {
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        ...JSON.parse(localStorage.localProfile),
        loaded: true
      }
    })
  }
  // If the cache is not expired then we are done
  if (localStorage.localProfileTime > Date.now() - 300 * 1000) {
    return
  }
  // Set the localStorage cache time now to avoid multiple calls
  localStorage.localProfileTime = Date.now()
  const userID = await getUserID()
  // Find the profile with chainquery
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
            'blk.t': -1
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
        welcomeMessage: true
      }
    })
    return
  }
  const { name, photoURL } = queryResult[0]
  const newProfile = { userID, name, photoURL }
  // Update the cache and dispatch the new profile
  localStorage.localProfile = JSON.stringify(newProfile)
  localStorage.localProfileTime = Date.now()
  store.dispatch({
    type: UPDATE_LOCAL_PROFILE,
    payload: {
      ...newProfile,
      loaded: true
    }
  })
}
