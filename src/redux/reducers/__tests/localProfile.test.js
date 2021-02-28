/* eslint-disable */
import localProfile, { initialState } from '../localProfile'
import {
  LOAD_LOCAL_PROFILE,
  UNLOAD_LOCAL_PROFILE
} from 'redux/types'

describe('localProfile', () => {
  it('Returns initial state', () => {
    expect(localProfile(undefined, {})).toEqual(initialState)
  })
  it('Loads the given profile', () => {
    expect(localProfile(undefined, {
      type: LOAD_LOCAL_PROFILE,
      userID: '1234',
      name: 'Bob',
      photoURL: 'https://example.com/foobar.png'
    })).toEqual({
      ...initialState,
      loaded: true,
      userID: '1234',
      name: 'Bob',
      photoURL: 'https://example.com/foobar.png'
    })
  })
  it('Unloads the current profile', () => {
    expect(localProfile({
      loaded: true,
      userID: '1234',
      name: 'Bob',
      photoURL: 'https://example.com/foobar.png'
    }, {
      type: UNLOAD_LOCAL_PROFILE
    })).toEqual(initialState)
  })
})