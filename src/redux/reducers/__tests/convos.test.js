/* eslint-disable */
import convos, { initialState } from '../convos'
import {
  SEND_MESSAGE
} from 'redux/types'

describe('convos', () => {
  it('Returns initial state', () => {
    expect(convos(undefined, {})).toEqual(initialState)
  })
  it('Sends a message', () => {
    expect(convos({
      '1234': {
        'tx1': {
          time: '45556454988',
          content: 'hi',
          messageType: 'text',
          senderID: '1234'
        }
      },
      '5678': {
        'tx2': {
          time: '5687898849',
          content: 'yo',
          messageType: 'text',
          senderID: '9012'
        }
      }
    }, {
      type: SEND_MESSAGE,
      payload: {
        foreignID: '1234',
        senderID: '9012',
        messageID: 'tx3',
        messageType: 'photo',
        content: 'https://example.com/selfie.png',
        time: '564579888'
      }
    })).toEqual({
      '1234': {
        'tx1': {
        time: '45556454988',
        content: 'hi',
        messageType: 'text',
        senderID: '1234'
      },
      'tx3': {
        senderID: '9012',
        messageID: 'tx3',
        foreignID: '1234',
        messageType: 'photo',
        content: 'https://example.com/selfie.png',
        time: '564579888'
      }
      },
      '5678': {
        'tx2': {
          time: '5687898849',
          content: 'yo',
          messageType: 'text',
          senderID: '9012'
        }
      }
    })
  })
})