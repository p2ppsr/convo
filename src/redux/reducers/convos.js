import { SEND_MESSAGE, UPDATE_CONVOS } from 'redux/types'

/*
The structure is that the root object has keys for each user. The value of each
user object is an object whose keys are message TXIDs and whose values are
message objects with messageType, time, content and senderID.
*/

// Initially there are no conversations
export const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case SEND_MESSAGE:
      return {
        ...state,
        [action.payload.foreignID]: {
          ...state[action.payload.foreignID],
          [action.payload.messageID]: action.payload
        }
      }
    case UPDATE_CONVOS:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}
