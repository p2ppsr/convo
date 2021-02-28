import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import store from 'redux/store'
import { SEND_MESSAGE } from 'redux/types'
import { sendDataTransaction, encrypt, createHmac } from 'rubeus-js'
import { MESSAGES_PROTOCOL_ADDRESS } from 'parameters'
import getUserID from 'utils/getUserID'

export default async ({ to, message }) => {
  /*
    We'll need the public key for the foreign uer in order to encrypt it with
    an ECDH shared secret
  */
  const foreignProfile = await loadForeignProfile(to)
  const localUserID = await getUserID()

  // Encrypt the message type with the shared secret
  const messageTypeEncrypted = await encrypt({
    key: 'primarySigning',
    path: 'm/2000/1',
    data: message.messageType,
    pub: foreignProfile.primarySigningPub
  })

  // TODO: This needs to change
  const messageTypeHash = await createHmac({
    key: 'primarySigning',
    path: 'm/2000/1',
    pub: foreignProfile.primarySigningPub,
    data: message.messageType
  })

  const messageTime = Date.now()

  if (message.messageType === 'text' || message.messageType === 'photo') {
    /*
      The message content is encrypted with the shared secret and the
      transaction is broadcasted with sendDataTransaction.
    */
    const encryptedContent = await encrypt({
      key: 'primarySigning',
      path: 'm/2000/1',
      data: message.content,
      pub: foreignProfile.primarySigningPub
    })
    const resultTXID = await sendDataTransaction({
      reason: `Send a message to ${foreignProfile.name}`,
      keyName: 'primarySigning',
      keyPath: 'm/2000/1',
      data: [
        MESSAGES_PROTOCOL_ADDRESS,
        localUserID,
        to,
        '' + messageTime,
        messageTypeHash,
        messageTypeEncrypted,
        encryptedContent
      ]
    })

    /*
      Text can be updated with SEND_MESSAGE immediately, but we'll let the
      socket handle pictures as they are more complex (see listenForMessages).
    */
    if (message.messageType === 'text') {
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
  } else if (
    message.messageType === 'secret-text' ||
    message.messageType === 'secret-photo'
  ) {
    // For secret messages, we need the privileged keyset shared secret.
    const encryptedContent = await encrypt({
      key: 'privilegedSigning',
      path: 'm/2000/1',
      data: message.content,
      pub: foreignProfile.privilegedSigningPub,
      reason: `Send a secret message to ${foreignProfile.name}`
    })
    const resultTXID = await sendDataTransaction({
      reason: `Send a secret message to ${foreignProfile.name}`,
      keyName: 'primarySigning',
      keyPath: 'm/2000/1',
      data: [
        MESSAGES_PROTOCOL_ADDRESS,
        localUserID,
        to,
        '' + messageTime,
        messageTypeHash,
        messageTypeEncrypted,
        encryptedContent
      ]
    })
    // Text can be sent immediately, but we let the socket handle pictures
    if (message.messageType === 'text') {
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
  } else {
    throw new Error(`Invalid message type: ${message.messageType}`)
  }
  return true
}
