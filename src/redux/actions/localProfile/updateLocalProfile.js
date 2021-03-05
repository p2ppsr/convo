import { getPrimarySigningPub, getPrivilegedSigningPub, sendDataTransaction } from 'rubeus-js'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import getUserID from 'utils/getUserID'
import bsv from 'bsv'

/*
  Uses sendDataTransaction to put the new profile on the blockchain.
  The photo blob is ignored for now.
*/
export default async ({ name, photo }) => {
  const userID = await getUserID()
  let primarySigningPub = await getPrimarySigningPub({
    path: 'm/2000/1'
  })
  let privilegedSigningPub = await getPrivilegedSigningPub({
    path: 'm/2000/1'
  })

  // Convert the keys into the specified format
  primarySigningPub = Uint8Array.from(Buffer.from(
    bsv.HDPublicKey.fromString(primarySigningPub)
      .publicKey
      .toString(),
    'hex'
  ))
  privilegedSigningPub = Uint8Array.from(Buffer.from(
    bsv.HDPublicKey.fromString(privilegedSigningPub)
      .publicKey
      .toString(),
    'hex'
  ))

  // TODO: Once UHRP is done, upload the photo on Hashbrown and put the URL here
  const photoURL = 'https://bridgeport.babbage.systems/favicon.ico'
  await sendDataTransaction({
    data: [
      new TextEncoder().encode(PROFILES_PROTOCOL_ADDRESS),
      new TextEncoder().encode(userID),
      primarySigningPub,
      privilegedSigningPub,
      new TextEncoder().encode('' + parseInt(Date.now() / 1000)),
      new TextEncoder().encode(name),
      new TextEncoder().encode(photoURL)
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
