import { getPrimarySigningPub, getPrivilegedSigningPub, sendDataTransaction } from 'rubeus-js'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import getUserID from 'utils/getUserID'

/*
Uses sendDataTransaction to put the new profile on the blockchain.
The photo blob is ignored for now.
*/
export default async ({ name, photo }) => {
  const userID = await getUserID()
  const primarySigningPub = await getPrimarySigningPub({
    path: 'm/2000/1'
  })
  const privilegedSigningPub = await getPrivilegedSigningPub({
    path: 'm/2000/1'
  })
  // TODO: Once UHRP is done, upload the photo on Hashbrown and put the URL here
  // For now, everyone will be a corndog :)
  const photoURL = 'http://corndog.io/corndog-tile-1.png'
  await sendDataTransaction({
    data: [
      PROFILES_PROTOCOL_ADDRESS,
      userID,
      primarySigningPub,
      privilegedSigningPub,
      '' + parseInt(Date.now() / 1000),
      name,
      photoURL
    ],
    keyName: 'primarySigning',
    keyPath: 'm/2000/1',
    reason: 'Upload your new profile'
  })
  // Update cache and dispatch updates to state
  const newProfile = {
    userID,
    name,
    photoURL
  }
  localStorage.localProfile = JSON.stringify(newProfile)
  localStorage.localProfileTime = Date.now()
  store.dispatch({
    type: UPDATE_LOCAL_PROFILE,
    payload: {
      loaded: true,
      ...newProfile
    }
  })
}
