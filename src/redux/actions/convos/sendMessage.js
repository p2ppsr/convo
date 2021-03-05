import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import store from 'redux/store'
import { SEND_MESSAGE } from 'redux/types'
import { sendDataTransaction, encrypt, createHmac } from 'rubeus-js'
import { MESSAGES_PROTOCOL_ADDRESS } from 'parameters'
import getUserID from 'utils/getUserID'
import decompressPubkey from 'utils/decompressPubkey'

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
    data: message.messageType,
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
      data: message.content,
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
      data: message.content,
      pub: foreignPrivilegedSigningPub,
      reason: `Send a secret message to ${foreignProfile.name}`
    })
  }

  // TODO: For photos and secret-photos the encryptedContent is actually a blob that needs to be uploaded to an HTTPS or UHRP content host. Once encryptedContent is uploaded, and once a public URL has been made available, the URL needs to be inserted here.
  if (
    message.messageType === 'photo' || message.messageType === 'secret-photo'
  ) {
    // Until this is done, the original thing inside of encryptedContent is lost instad of being uploaded, and it is replaced with the fake URL.
    // TODO: Upload encryptedContent to an HTTPS or UHRP host, and get the URL of the uploaded file before overwriting encryptedContent with that URL instead of this fake one..
    encryptedContent = new TextEncoder().encode(
      'https://bridgeport.babbage.systems/favicon.ico'
    )
  }

  const resultTXID = await sendDataTransaction({
    reason: `Send a message to ${foreignProfile.name}`,
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
        content: message.content
      }
    })
  }

  return true
}
