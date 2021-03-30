import getUserID from './getUserID'
import { MESSAGES_BUS_ID } from 'parameters'
import store from 'redux/store'
import { SEND_MESSAGE } from 'redux/types'
import processMessageTransaction from 'utils/processMessageTransaction'
import parapet from 'parapet-js'

// We rely on Bitsocket to notify us about new messages
export default async () => {
  const localUserID = await getUserID()
  const sock = await parapet({
    bridge: MESSAGES_BUS_ID,
    request: {
      type: 'socket',
      query: {
        v: 3,
        q: {
          find: {
            $or: [
              { sender: localUserID },
              { recipient: localUserID }
            ]
          }
        }
      }
    }
  })
  sock.onmessage = async e => {
    console.log(e)
    const data = JSON.parse(e.data)
    if (data.type !== 'message') {
      return
    }
    const message = await processMessageTransaction(data.data)
    if (message !== null) {
      store.dispatch({
        type: SEND_MESSAGE,
        payload: message
      })
    }
  }

  // Wait forever to avoid destroying the objects in this function
  await new Promise(() => {})
}
