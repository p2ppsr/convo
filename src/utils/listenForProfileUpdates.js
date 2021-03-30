import { PROFILES_BUS_ID } from 'parameters'
import store from 'redux/store'
import { LOAD_FOREIGN_PROFILE } from 'redux/types'
import parapet from 'parapet-js'

// We rely on Bitsocket to notify us about profile updates
export default async () => {
  const sock = await parapet({
    bridge: PROFILES_BUS_ID,
    request: {
      type: 'socket',
      query: {
        v: 3,
        q: {
          find: {}
        }
      }
    }
  })
  sock.onmessage = e => {
    console.log(e)
    const data = JSON.parse(e.data)
    if (data.type !== 'message') {
      return
    }
    data.data.forEach(async tx => {
      // Do not process profiles that are not loaded
      if (!store.getState().foreignProfiles[tx.userID]) {
        return
      }
      const { userID, name, photoURL } = tx
      // Put the updated profile in state
      store.dispatch({
        type: LOAD_FOREIGN_PROFILE,
        payload: { userID, name, photoURL }
      })
      // Update cache if populated
      if (localStorage[`profile-${userID}`]) {
        localStorage[`profile-${userID}`] = JSON.stringify({
          ...JSON.parse(localStorage[`profile-${userID}`]),
          name,
          photoURL
        })
        localStorage[`profile-${userID}-time`] = Date.now()
      }
    })
  }

  // Wait forever to avoid destroying the objects in this function
  await new Promise(() => {})
}
