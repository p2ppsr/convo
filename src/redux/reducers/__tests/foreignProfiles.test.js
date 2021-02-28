/* eslint-disable */
import foreignProfiles, { initialState } from '../foreignProfiles'
import {
  LOAD_FOREIGN_PROFILE,
  UNLOAD_FOREIGN_PROFILE,
  UNLOAD_ALL_FOREIGN_PROFILES
} from 'redux/types'

describe('foreignProfiles', () => {
  it('Returns initial state', () => {
    expect(foreignProfiles(undefined, {})).toEqual(initialState)
  })
  it('Loads the given profile', () => {
    expect(foreignProfiles(undefined, {
      type: LOAD_FOREIGN_PROFILE,
      payload: {
        userID: '1234',
        name: 'Bob',
        photoURL: 'https://example.com/foobar.png'
      }
    })).toEqual({
      '1234': {
        name: 'Bob',
        photoURL: 'https://example.com/foobar.png',
        userID: '1234'
      }
    })
  })
  it('Unloads the given profile', () => {
    expect(foreignProfiles({
      '1234': {
        name: 'Bob',
        photoURL: 'https://example.com/foobar.png'
      },
      '5678': {
        name: 'Joe',
        photoURL: 'https://example.com/barbaz.png'
      }
    }, {
      type: UNLOAD_FOREIGN_PROFILE,
      userID: '1234'
    })).toEqual({
      '5678': {
        name: 'Joe',
        photoURL: 'https://example.com/barbaz.png'
      }
    })
  })
  it('Unloads all profiles', () => {
    expect(foreignProfiles({
      '1234': {
        name: 'Bob',
        photoURL: 'https://example.com/foobar.png'
      },
      '5678': {
        name: 'Joe',
        photoURL: 'https://example.com/barbaz.png'
      }
    }, {
      type: UNLOAD_ALL_FOREIGN_PROFILES
    })).toEqual(initialState)
  })
})