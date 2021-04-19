import loadLocalProfile from '../loadLocalProfile'
import chainquery from '@cwi/chainquery'
import { getUserID } from '@babbage/sdk'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import waitForAuthentication from 'utils/waitForAuthentication'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'

const USER_ID = '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA'
const MOCK_VALID_RESULT = [{
  out: [{
    s3: USER_ID,
    s4: 1595887638,
    s5: 'Bill',
    f6: 'MOCK_URL'
  }]
}]

jest.mock('@cwi/chainquery')
jest.mock('@babbage/sdk')
jest.mock('utils/waitForAuthentication')
jest.mock('redux/store')

describe('loadLocalProfile', () => {
  afterEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
  })
  it('Waits for authentication', async () => {
    chainquery.mockReturnValue([])
    await loadLocalProfile()
    expect(waitForAuthentication).toHaveBeenCalled()
  })
  it('Dispatches profile from localStorage', async () => {
    localStorage.localProfile = JSON.stringify({
      foo: 'bar'
    })
    localStorage.localProfileTime = Date.now()
    await loadLocalProfile()
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        loaded: true,
        foo: 'bar'
      }
    })
  })
  it('Does not call getUserID when cache is within 5 minutes', async () => {
    localStorage.localProfile = JSON.stringify({
      foo: 'bar'
    })
    localStorage.localProfileTime = Date.now() - 290 * 1000
    await loadLocalProfile()
    expect(getUserID).not.toHaveBeenCalled()
  })
  describe('When cache is old', () => {
    beforeEach(() => {
      localStorage.localProfileTime = Date.now() - 305 * 1000
    })
    it('Resets the cache time', async () => {
      chainquery.mockReturnValue([])
      await loadLocalProfile()
      expect(
        parseInt(localStorage.localProfileTime)
      ).toBeGreaterThan(Date.now() - 3500)
    })
    it('Calls getUserID', async () => {
      chainquery.mockReturnValue([])
      await loadLocalProfile()
      expect(getUserID).toHaveBeenCalled()
    })
    it('Calls chainquery with the correct query', async () => {
      getUserID.mockReturnValue(USER_ID)
      chainquery.mockReturnValue([])
      await loadLocalProfile()
      expect(chainquery).toHaveBeenCalledWith(expect.objectContaining({
        query: {
          v: 3,
          q: {
            find: {
              'out.s2': PROFILES_PROTOCOL_ADDRESS,
              'out.s3': USER_ID,
              'in.e.a': USER_ID,
              'out.f6': { $exists: true }
            },
            limit: 1,
            sort: {
              'blk.t': -1,
              timestamp: -1,
              'out.s4': -1
            }
          }
        }
      }))
    })
    it('Dispatches action to open welcome modal when query returns no results', async () => {
      getUserID.mockReturnValue(USER_ID)
      chainquery.mockReturnValue([])
      await loadLocalProfile()
      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_LOCAL_PROFILE,
        payload: {
          editorOpen: true,
          welcomeMessage: true,
          loaded: false
        }
      })
    })
    it('Caches a valid profile object', async () => {
      getUserID.mockReturnValue(USER_ID)
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      await loadLocalProfile()
      expect({ ...window.localStorage }).toEqual({
        localProfile: JSON.stringify({
          userID: '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
          name: 'Bill',
          photoURL: 'https://x.bitfs.network/MOCK_URL'
        }),
        localProfileTime: expect.any(String)
      })
    })
    it('Dispatches new profile', async () => {
      getUserID.mockReturnValue(USER_ID)
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      await loadLocalProfile()
      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_LOCAL_PROFILE,
        payload: {
          loaded: true,
          userID: '1FAXmkNfLpnSB3ctdRKarYjLasJZbZegeA',
          name: 'Bill',
          photoURL: 'https://x.bitfs.network/MOCK_URL'
        }
      })
    })
  })
})
