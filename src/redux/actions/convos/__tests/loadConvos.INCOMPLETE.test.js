import loadConvos from '../loadConvos'
import waitForAuthentication from 'utils/waitForAuthentication'
import store from 'redux/store'
import { UPDATE_CONVOS } from 'redux/types'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import { getUserID } from '@babbage/sdk'
import chainquery from '@cwi/chainquery'
import { MESSAGES_PROTOCOL_ADDRESS } from 'parameters'
import messageData from './messages.data'

jest.mock('utils/waitForAuthentication')
jest.mock('redux/store')
jest.mock('@babbage/sdk')
jest.mock('redux/actions/foreignProfiles/loadForeignProfile')
jest.mock('@cwi/chainquery')

describe('loadConvos', () => {
  afterEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
  })
  it('Calls waitForAuthentication', async () => {
    localStorage.convoCacheTime = Date.now()
    localStorage.convoCache = '{}'
    await loadConvos()
    expect(waitForAuthentication).toHaveBeenCalled()
  })
  it('Updates from localStorage when cache exists', async () => {
    localStorage.convoCacheTime = Date.now()
    localStorage.convoCache = JSON.stringify({
      a: 'foo',
      b: 'bar'
    })
    await loadConvos()
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_CONVOS,
      payload: {
        a: 'foo',
        b: 'bar'
      }
    })
  })
  it('Loads foreign profiles for cached conversations', async () => {
    localStorage.convoCacheTime = Date.now()
    localStorage.convoCache = JSON.stringify({
      a: 'foo',
      b: 'bar'
    })
    await loadConvos()
    expect(loadForeignProfile.mock.calls).toEqual([
      ['a'], ['b']
    ])
  })
  it('Does not call getUserID when cache is within 5 minutes', async () => {
    localStorage.convoCacheTime = Date.now()
    localStorage.convoCache = JSON.stringify({
      a: 'foo',
      b: 'bar'
    })
    await loadConvos()
    expect(getUserID).not.toHaveBeenCalled()
  })
  describe('When cache is old', () => {
    beforeEach(() => {
      localStorage.convoCacheTime = Date.now() - 305 * 1000
    })
    it('Resets the cache time', async () => {
      chainquery.mockReturnValue([])
      await loadConvos()
      expect(
        parseInt(localStorage.convoCacheTime)
      ).toBeGreaterThan(Date.now() - 3500)
    })
    it('Calls getUserID', async () => {
      chainquery.mockReturnValue([])
      await loadConvos()
      expect(getUserID).toHaveBeenCalled()
    })
    it('Calls chainquery with the correct query', async () => {
      getUserID.mockReturnValue('USER_ID')
      chainquery.mockReturnValue([])
      await loadConvos()
      expect(chainquery).toHaveBeenCalledWith(expect.objectContaining({
        query: {
          v: 3,
          q: {
            find: {
              'out.s2': MESSAGES_PROTOCOL_ADDRESS,
              $or: [
                {
                  'out.s4': 'USER_ID',
                  'in.e.a': 'USER_ID'
                },
                {
                  'out.s3': 'USER_ID'
                }
              ]
            },
            sort: {
              timestamp: -1,
              'blk.t': -1,
              'out.s5': -1
            }
          }
        }
      }))
    })
    /*
      TODO: The remainder of these tests need to be completed. However, this will require the mocking of the data returned from chainquery.
    */
    // it('Updates localStorage with new messages', async () => {
    //   chainquery.mockReturnValue(messageData)
    //   getUserID.mockReturnValue('USER_ID')
    //   await loadConvos()
    // })
  })
})
