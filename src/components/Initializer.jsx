import { useEffect } from 'react'
import listenForMessages from 'utils/listenForMessages'
import listenForProfileUpdates from 'utils/listenForProfileUpdates'

/*

This component waits for the user to authenticate, then starts listening for
their new messages. It also listens for changes to user profiles.

*/

const Initializer = () => {
  useEffect(() => {
    (async () => {
      listenForMessages()
      listenForProfileUpdates()
    })()
  }, [])

  return null
}

export default Initializer
