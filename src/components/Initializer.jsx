import { useEffect } from 'react'
import listenForMessages from 'utils/listenForMessages'
import listenForProfileUpdates from 'utils/listenForProfileUpdates'
import getUserID from 'utils/getUserID'

/*

This component waits for the user to authenticate, then starts listening for
their new messages. It also listens for changes to user profiles.

*/

const Initializer = () => {
  useEffect(() => {
    (async () => {
      // If the user has changed, the cache is invalid.
      if (window.localStorage.localProfile) {
        const currentUserID = await getUserID()
        const cachedUserID = JSON.parse(window.localStorage.localProfile).userID
        if (currentUserID !== cachedUserID) {
          window.localStorage.clear()
        }
      }
      listenForMessages()
      listenForProfileUpdates()
    })()
  }, [])

  return null
}

export default Initializer
