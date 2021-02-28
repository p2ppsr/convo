import loadForeignProfile from '../loadForeignProfile'
import chainquery from '@cwi/chainquery'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { LOAD_FOREIGN_PROFILE } from 'redux/types'
import { encodeUint8AsString } from '@cwi/array-encoding'
import { findByUserID } from '@cwi/users'

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
jest.mock('utils/waitForAuthentication')
jest.mock('redux/store')
jest.mock('@cwi/users')
jest.mock('@cwi/array-encoding')

describe('loadForeignProfile', () => {
  afterEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
  })
  it('Dispatches profile from localStorage', async () => {
    localStorage['profile-MOCKID'] = JSON.stringify({
      foo: 'bar'
    })
    localStorage['profile-MOCKID-time'] = Date.now()
    await loadForeignProfile('MOCKID')
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LOAD_FOREIGN_PROFILE,
      payload: {
        userID: 'MOCKID',
        foo: 'bar'
      }
    })
  })
  it('Returns the value from localStorage when cache is within 15 minutes', async () => {
    localStorage['profile-MOCKID'] = JSON.stringify({
      foo: 'bar'
    })
    localStorage['profile-MOCKID-time'] = Date.now() - 890 * 1000
    const result = await loadForeignProfile('MOCKID')
    expect(result).toEqual({
      userID: 'MOCKID',
      foo: 'bar'
    })
  })
  describe('When cache is old', () => {
    beforeEach(() => {
      localStorage['profile-MOCKID-time'] = Date.now() - 905 * 1000
    })
    it('Resets the cache time', async () => {
      chainquery.mockReturnValue([])
      await loadForeignProfile('MOCKID')
      expect(
        parseInt(localStorage['profile-MOCKID-time'])
      ).toBeGreaterThan(Date.now() - 3500)
    })
    it('Calls chainquery with the correct query', async () => {
      chainquery.mockReturnValue([])
      await loadForeignProfile('MOCKID')
      expect(chainquery).toHaveBeenCalledWith(expect.objectContaining({
        query: {
          v: 3,
          q: {
            find: {
              'out.s2': PROFILES_PROTOCOL_ADDRESS,
              'out.s3': 'MOCKID',
              'in.e.a': 'MOCKID',
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
    it('Returns null when query returns no results', async () => {
      chainquery.mockReturnValue([])
      expect(await loadForeignProfile('MOCKID')).toEqual(null)
    })
    it('Calls findByUserID with the userID', async () => {
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      findByUserID.mockReturnValue([])
      await loadForeignProfile('MOCKID')
      expect(findByUserID).toHaveBeenCalledWith(expect.objectContaining({
        userID: 'MOCKID'
      }))
    })
    it('Caches a valid profile object', async () => {
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      findByUserID.mockReturnValue([])
      encodeUint8AsString.mockReturnValueOnce('PRIM')
        .mockReturnValueOnce('PRIV')
      await loadForeignProfile('MOCKID')
      expect({ ...window.localStorage }).toEqual({
        'profile-MOCKID': JSON.stringify({
          userID: 'MOCKID',
          name: 'Bill',
          photoURL: 'https://x.bitfs.network/MOCK_URL',
          primarySigningPub: 'PRIM',
          privilegedSigningPub: 'PRIV'
        }),
        'profile-MOCKID-time': expect.any(String)
      })
    })
    it('Dispatches new profile', async () => {
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      findByUserID.mockReturnValue([])
      encodeUint8AsString.mockReturnValueOnce('PRIM')
        .mockReturnValueOnce('PRIV')
      await loadForeignProfile('MOCKID')
      expect(store.dispatch).toHaveBeenCalledWith({
        type: LOAD_FOREIGN_PROFILE,
        payload: {
          userID: 'MOCKID',
          name: 'Bill',
          photoURL: 'https://x.bitfs.network/MOCK_URL',
          primarySigningPub: 'PRIM',
          privilegedSigningPub: 'PRIV'
        }
      })
    })
    it('Returns a valid profile object', async () => {
      chainquery.mockReturnValue(MOCK_VALID_RESULT)
      findByUserID.mockReturnValue([])
      encodeUint8AsString.mockReturnValueOnce('PRIM')
        .mockReturnValueOnce('PRIV')
      expect(await loadForeignProfile('MOCKID')).toEqual({
        userID: 'MOCKID',
        name: 'Bill',
        photoURL: 'https://x.bitfs.network/MOCK_URL',
        primarySigningPub: 'PRIM',
        privilegedSigningPub: 'PRIV'
      })
    })
  })
})
