import store from 'redux/store'
import { UPDATE_CONVOS } from 'redux/types'
import { MESSAGES_BUS_ID } from 'parameters'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import parapet from 'parapet-js'
import processMessageTransaction from 'utils/processMessageTransaction'
import getUserID from 'utils/getUserID'

/*
This action loads all conversations and populates them into state.
It starts by pulling in cached convos from localStorage.
Then, if necessary, it will update the state and the cache from the blockchain.
*/
export default async () => {
  // Restore from cache immediately
  if (localStorage.convoCache) {
    store.dispatch({
      type: UPDATE_CONVOS,
      payload: {
        ...store.getState().convos,
        ...Object.fromEntries(
          Object.entries(JSON.parse(localStorage.convoCache))
            .map(([user, msgs]) => ([
              user,
              {
                // This ensures that any messages already in state don't get
                // overwritten by old data in cache.
                ...store.getState().convos[user],
                ...msgs
              }
            ]))
        )
      }
    })
    // All foreign profiles should be loaded
    Object.keys(JSON.parse(localStorage.convoCache)).forEach(profile => {
      loadForeignProfile(profile)
    })
    // If the cache is not outdated, we are done
    if (localStorage.convoCacheTime > Date.now() - 300 * 1000) {
      return
    }
  }

  // First update cache time to prevent multiple callers from triggering the same action
  localStorage.convoCacheTime = Date.now()
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
              .filter(message => message !== null && message.foreignID === user)
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
  // Cache the structure and dispatch the update
  localStorage.convoCache = JSON.stringify(completeStructure)
  localStorage.convoCacheTime = Date.now()
  store.dispatch({
    type: UPDATE_CONVOS,
    payload: completeStructure
  })
}
