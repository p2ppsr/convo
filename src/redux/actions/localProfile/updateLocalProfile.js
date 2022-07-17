import { getPrimarySigningPub, getPrivilegedSigningPub, createAction } from '@babbage/sdk'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import getUserID from 'utils/getUserID'
import { getURLForFile, isValidURL } from 'uhrp-url'
import { invoice, upload } from 'nanostore-publisher'

/*
  Uses sendDataTransaction to put the new profile on the blockchain.
  The photo blob is ignored for now.
*/
export default async ({ name, photo }) => {
  const userID = await getUserID()
  let primaryIdentity = await getPrimarySigningPub({
    path: 'm/2000/1'
  })
  let privilegedIdentity = await getPrivilegedSigningPub({
    path: 'm/2000/1',
    reason: 'Update your Convo profile'
  })

  // Convert the keys into the specified format
  primaryIdentity = Uint8Array.from(Buffer.from(
    primaryIdentity,
    'hex'
  ))
  privilegedIdentity = Uint8Array.from(Buffer.from(
    privilegedIdentity,
    'hex'
  ))

  // TODO: Once UHRP is done, upload the photo on Hashbrown and put the URL here
  let photoURL, outputs, referenceNumber
  if (photo.constructor === Uint8Array) {
    // A NanoStore invoice is created
    const result = await invoice({
      fileSize: photo.length,
      retentionPeriod: 525600 * 5 // five years
    })
    outputs = result.outputs.map(x => ({
      script: x.outputScript,
      satoshis: x.amount
    }))
    referenceNumber = result.referenceNumber

    // A new photo URL is calculated
    photoURL = await getURLForFile(Buffer.from(photo))
  } else {
    // If the photo was not given, the existing URL can be used
    photoURL = photo
  }

  // Add UHRP prefix si needed
  if (isValidURL(photoURL) && !photoURL.startsWith('uhrp:')) {
    photoURL = `uhrp:${photoURL}`
  }

  const result = await createAction({
    data: [
      new TextEncoder().encode(PROFILES_PROTOCOL_ADDRESS),
      new TextEncoder().encode(userID),
      primaryIdentity,
      privilegedIdentity,
      new TextEncoder().encode('' + parseInt(Date.now() / 1000)),
      new TextEncoder().encode(name),
      new TextEncoder().encode(photoURL)
    ],
    outputs,
    keyName: 'primarySigning',
    keyPath: 'm/2000/1',
    description: 'Update your Convo profile',
    bridges: ['16ibuBM9KzHav3sCXpxjV3bkvU3EXdmDWG'] // CUPP
  })
  console.log(result)
  const { rawTx, inputs, mapiResponses } = result

  // If there were NanoStore outputs, upload the new photo and pay the invoice
  if (referenceNumber) {
    await upload({
      referenceNumber,
      inputs,
      mapiResponses,
      transactionHex: rawTx,
      file: new File([photo], 'image.png')
    })
  }

  // Update cache and dispatch updates to state
  const newProfile = {
    userID,
    name,
    photoURL
  }
  store.dispatch({
    type: UPDATE_LOCAL_PROFILE,
    payload: {
      loaded: true,
      ...newProfile
    }
  })
}
