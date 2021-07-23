import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import store from 'redux/store'
import { SEND_MESSAGE } from 'redux/types'
import { createAction, encrypt, createHmac } from '@babbage/sdk'
import { invoice, upload } from 'nanostore-publisher'
import { MESSAGES_PROTOCOL_ADDRESS } from 'parameters'
import getUserID from 'utils/getUserID'
import decompressPubkey from 'utils/decompressPubkey'
import { getURLForFile } from 'uhrp-url'

export default async ({ to, message }) => {
  /*
    We'll need the public key for the foreign uer in order to encrypt it with
    an ECDH shared secret
  */
  const foreignProfile = await loadForeignProfile(to)
  const localUserID = await getUserID()
  const foreignPrimarySigningPub = decompressPubkey(
    foreignProfile.primarySigningPub
  )

  // Encrypt the message type with the shared secret
  const messageTypeEncrypted = await encrypt({
    key: 'primarySigning',
    path: 'm/2000/1',
    data: window.btoa(message.messageType),
    pub: foreignPrimarySigningPub
  })

  // Create the message type hash with the shared secret so that both users can locate all messages of a given type.
  const messageTypeHash = await createHmac({
    key: 'primarySigning',
    path: 'm/2000/1',
    pub: foreignPrimarySigningPub,
    data: new TextEncoder().encode(message.messageType)
  })

  const messageTime = Date.now()

  /*
    The message content is encrypted with the shared secret unless it is a URL,
    in which case the content AT the URL is encrypted.
  */
  let encryptedContent
  if (message.messageType === 'text' || message.messageType === 'photo') {
    encryptedContent = await encrypt({
      key: 'primarySigning',
      path: 'm/2000/1',
      data: message.messageType === 'text'
        ? new TextEncoder().encode(message.content)
        : message.content,
      pub: foreignPrimarySigningPub
    })
  } else if (
    message.messageType === 'secret-text' ||
    message.messageType === 'secret-photo'
  ) {
    // For secret messages, we need the privileged keyset shared secret.
    const foreignPrivilegedSigningPub = decompressPubkey(
      foreignProfile.privilegedSigningPub
    )
    encryptedContent = await encrypt({
      key: 'privilegedSigning',
      path: 'm/2000/1',
      data: message.messageType === 'secret-text'
        ? new TextEncoder().encode(message.content)
        : message.content,
      pub: foreignPrivilegedSigningPub,
      reason: `Send a secret message to ${foreignProfile.name}`
    })
  }

  let resultTXID

  // For photos and secret-photos they are uploaded to NanoStore
  if (
    message.messageType === 'photo' || message.messageType === 'secret-photo'
  ) {
    const fileBuffer = Buffer.from(encryptedContent, 'base64')
    const { referenceNumber, outputs } = await invoice({
      fileSize: fileBuffer.length,
      retentionPeriod: 525600 * 5 // 5 years
    })
    const fileUrl = await getURLForFile(fileBuffer)
    encryptedContent = new TextEncoder().encode(fileUrl)
    const result = await createAction({
      description: `Send a picture to ${foreignProfile.name}`,
      keyName: 'primarySigning',
      keyPath: 'm/2000/1',
      data: [ // TextEncoder is used on strings to convert them to Uint8Arrays
        new TextEncoder().encode(MESSAGES_PROTOCOL_ADDRESS),
        new TextEncoder().encode(localUserID),
        new TextEncoder().encode(to),
        new TextEncoder().encode('' + messageTime),
        messageTypeHash,
        messageTypeEncrypted,
        encryptedContent
      ],
      outputs: outputs.map(x => ({
        satoshis: x.amount,
        script: x.outputScript
      }))
    })
    console.log(result)
    resultTXID = result.txid
    await upload({
      referenceNumber,
      transactionHex: result.rawTx,
      inputs: result.inputs,
      mapiResponses: result.mapiResponses,
      file: new File([fileBuffer], 'image.png')
    })

    // Otherwise, text is simply sent in an Action
  } else {
    const result = await createAction({
      description: `Send a message to ${foreignProfile.name}`,
      keyName: 'primarySigning',
      keyPath: 'm/2000/1',
      data: [ // TextEncoder is used on strings to convert them to Uint8Arrays
        new TextEncoder().encode(MESSAGES_PROTOCOL_ADDRESS),
        new TextEncoder().encode(localUserID),
        new TextEncoder().encode(to),
        new TextEncoder().encode('' + messageTime),
        messageTypeHash,
        messageTypeEncrypted,
        encryptedContent
      ]
    })
    console.log(result)
    resultTXID = result.txid
  }

  /*
    Text can be updated with SEND_MESSAGE immediately, but we'll let the
    socket handle pictures as they are more complex (see listenForMessages).
  */
  if (message.messageType === 'text' || message.messageType === 'secret-text') {
    store.dispatch({
      type: SEND_MESSAGE,
      payload: {
        messageID: resultTXID,
        foreignID: to,
        senderID: localUserID,
        time: messageTime,
        messageType: message.messageType,
        content: message.messageType === 'text'
          ? message.content
          : encryptedContent
      }
    })
  }

  return true
}
