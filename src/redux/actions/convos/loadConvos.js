import store from 'redux/store'
import { UPDATE_CONVOS } from 'redux/types'
import { MESSAGES_BUS_ID } from 'parameters'
import parapet from 'parapet-js'
import processMessageTransaction from 'utils/processMessageTransaction'
import getUserID from 'utils/getUserID'

/*
This action loads all conversations and populates them into state.
It will update the state from the blockchain.
*/
export default async () => {
  const localUserID = await getUserID()
  const result = await parapet({
    bridge: MESSAGES_BUS_ID,
    request: {
      type: 'json-query',
      query: {
        v: 3,
        q: {
          collection: 'messages',
          find: {
            $or: [
              { sender: localUserID },
              { recipient: localUserID }
            ]
          },
          sort: {
            timestamp: -1
          }
        }
      }
    }
  })
  // Decrypt message types (and messages, when appropriate)
  const decryptedMessages = await Promise.all(
    result.map(processMessageTransaction)
  )
  // Get a deduplicated list of foreign user ID addresses
  const foreignUsers = [
    ...new Set(decryptedMessages
      .filter(x => x !== null)
      .map(x => x.foreignID)
    )
  ]
  const completeStructure = {
    ...store.getState().convos,
    ...Object.fromEntries(foreignUsers.map(user => {
      return [
        user,
        {
          ...store.getState().convos[user],
          ...Object.fromEntries(
            decryptedMessages
              .filter(
                message =>
                  message !== null &&
                  message.foreignID === user
              )
              .sort((a, b) => a.time > b.time ? 1 : -1)
              .map(message => {
                return [
                  message.messageID,
                  message
                ]
              })
          )
        }
      ]
    }))
  }
  store.dispatch({
    type: UPDATE_CONVOS,
    payload: completeStructure
  })
}
