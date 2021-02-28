import updateLocalProfile from '../updateLocalProfile'
import { getUserID, sendDataTransaction } from 'rubeus-js'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'

const VALID_PARAMS = {
  name: 'Bill',
  photo: crypto.getRandomValues(new Uint8Array(640))
}

jest.mock('rubeus-js')
jest.mock('redux/store')

describe('updateLocalProfile', () => {
  it('Throws an error if photo is less than 512 bytes', async () => {
    getUserID.mockReturnValue('MOCK_ID')
    await expect(updateLocalProfile({
      ...VALID_PARAMS,
      photo: new Uint8Array([1, 2, 4])
    })).rejects.toThrow(new Error(
      'Profile photo must be at least 512 bytes!'
    ))
  })
  it('Calls sendDataTransaction with correct parameters', async () => {
    getUserID.mockReturnValue('MOCK_ID')
    await updateLocalProfile(VALID_PARAMS)
    expect(sendDataTransaction).toHaveBeenCalledWith({
      data: [
        PROFILES_PROTOCOL_ADDRESS,
        'MOCK_ID',
        expect.any(String),
        VALID_PARAMS.name,
        VALID_PARAMS.photo
      ],
      reason: 'Upload your new profile'
    })
  })
  it('Saves updated profile in localStorage', async () => {
    getUserID.mockReturnValue('MOCK_ID')
    sendDataTransaction.mockReturnValue('MOCK_RV')
    await updateLocalProfile(VALID_PARAMS)
    expect({ ...window.localStorage }).toEqual(expect.objectContaining({
      localProfileTime: expect.any(String),
      localProfile: JSON.stringify({
        userID: 'MOCK_ID',
        name: 'Bill',
        photoURL: 'https://x.bitfs.network/MOCK_RV.out.0.6'
      })
    }))
  })
  it('Dispatches updated profile', async () => {
    getUserID.mockReturnValue('MOCK_ID')
    sendDataTransaction.mockReturnValue('MOCK_RV')
    await updateLocalProfile(VALID_PARAMS)
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        userID: 'MOCK_ID',
        name: 'Bill',
        photoURL: 'https://x.bitfs.network/MOCK_RV.out.0.6',
        loaded: true
      }
    })
  })
})
