import sendMessage from '../sendMessage'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import authMock from '@cwi/jest-mock'
import {
  getPrimarySigning, getUserID, sendDataTransaction
} from '@babbage/sdk'
import { MESSAGES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { SEND_MESSAGE } from 'redux/types'

const VALID_PARAMS = {
  to: '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
  message: {
    messageType: 'text',
    content: 'Hello'
  }
}
const FOREIGN_PROFILE = {
  userID: '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
  name: 'Ty Everett',
  photoURL: 'https://x.bitfs.network/184e9fbb452c71d5291af167a79a3162ccd840136fbdd31488abfb7518d4332b.out.0.6',
  primarySigningPub: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDfhFC1W7aShgPQYbtQ4Q4os6ZjbVvRFju0siXZtjdNNj/nWc7IkNTstT53N9MJoHf5cnjkGTXwedyUaULMHd/Q==',
  privilegedSigningPub: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn9CoTTZcAjcvnRE4bM3qLoRm5RJSJzDFQh/qBRa9fkAKySDLMRpdXhbt69GKEXdPgUpDt7Q5czhKd/srbX6ivQ=='
}

jest.mock('redux/actions/foreignProfiles/loadForeignProfile')
loadForeignProfile.mockReturnValue(FOREIGN_PROFILE)
jest.mock('redux/store')

describe('sendMessage', () => {
  beforeAll(async () => {
    await authMock.configure({
      auth: require('@babbage/sdk')
    })
  })
  it('Obtains the foreign profile', async () => {
    await sendMessage(VALID_PARAMS)
    expect(loadForeignProfile).toHaveBeenCalledWith(VALID_PARAMS.to)
  })
  it('Gets the local primary signing key', async () => {
    await sendMessage(VALID_PARAMS)
    expect(getPrimarySigning).toHaveBeenCalled()
  })
  it('Throws an error if message type is unknown', async () => {
    await expect(sendMessage({
      ...VALID_PARAMS,
      message: {
        ...VALID_PARAMS.message,
        messageType: 'potato'
      }
    })).rejects.toThrow(new Error(
      'Invalid message type: potato'
    ))
  })
  it('Returns true', async () => {
    expect(await sendMessage(VALID_PARAMS)).toEqual(true)
  })
  describe('When messageType is text', () => {
    it('Calls sendDataTransaction with good data', async () => {
      await sendMessage(VALID_PARAMS)
      expect(sendDataTransaction).toHaveBeenCalledWith({
        reason: 'Send a message to Ty Everett',
        data: [
          MESSAGES_PROTOCOL_ADDRESS,
          '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
          getUserID(),
          expect.any(String),
          expect.any(Uint8Array),
          expect.any(Uint8Array),
          expect.any(Uint8Array)
        ]
      })
    })
    it('Dispatches new message', async () => {
      sendDataTransaction.mockReturnValue('MOCK_TXID')
      await sendMessage(VALID_PARAMS)
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SEND_MESSAGE,
        payload: {
          messageID: 'MOCK_TXID',
          foreignID: '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
          senderID: getUserID(),
          time: expect.any(Number),
          messageType: 'text',
          content: 'Hello'
        }
      })
    })
  })
})
