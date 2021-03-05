import store from 'redux/store'
import { LOAD_FOREIGN_PROFILE } from 'redux/types'
import { PROFILES_BUS_ID } from 'parameters'
import parapet from 'parapet-js'

/*
Loads a foreign user profile into state, pulling it from cache immediately if
it is there and updating it from the blockchain if the cache is expired.

Normally, you wouldn't return a return value from a Redux action, but we need
the result in a few places where we can't easily grab it from state. If there
is a better way to do this, contributions are welcome.
*/
export default async userID => {
  // If a cached profile exists, update it into redux immediately
  if (localStorage[`profile-${userID}`]) {
    store.dispatch({
      type: LOAD_FOREIGN_PROFILE,
      payload: {
        userID,
        ...JSON.parse(localStorage[`profile-${userID}`])
      }
    })
    // If the cache is not expired, return the result and we are done
    if (localStorage[`profile-${userID}-time`] > Date.now() - 900 * 1000) {
      return {
        userID,
        ...JSON.parse(localStorage[`profile-${userID}`])
      }
    }
  }

  // Immediately update the cache time to avoid network requests from other callers
  localStorage[`profile-${userID}-time`] = Date.now()

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
  // Cache, dispatch and return the new profile
  localStorage[`profile-${userID}`] = JSON.stringify(newProfile)
  localStorage[`profile-${userID}-time`] = Date.now()
  store.dispatch({
    type: LOAD_FOREIGN_PROFILE,
    payload: newProfile
  })
  return newProfile
}
