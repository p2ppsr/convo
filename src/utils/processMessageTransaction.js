import { decrypt } from 'rubeus-js'
import getUserID from './getUserID'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'

export default async message => {
  /*
    The message type is encrypted with an ECDH common shared secret between the
    sender and the recipient. To use ECDH, we need the public key of the foreign user.
  */
  const localUserID = getUserID()
  const foreignID =
    message.recipient === localUserID
      ? message.sender
      : message.recipient
  const foreignProfile = await loadForeignProfile(foreignID)
  if (foreignProfile === null) {
    return null
  }

  // The message type is encrypted with the shared secret
  const messageType = await decrypt({
    ciphertext: message.type,
    key: 'primarySigning',
    path: 'm/2000/1',
    pub: foreignProfile.primarySigningPub
  })

  /*
    The message content is sometimes more than 512 bytes long. If it is longer than 512 bytes, it needs to be fetched from Bitfs.
  */
  let messageData
  if (message.contentBitFS) {
    const result = await window.fetch(
      `https://x.bitfs.network/${message.contentBitFS}`
    )
    messageData = new Uint8Array(await result.arrayBuffer())
  } else {
    messageData = Uint8Array.from(Buffer.from(
      message.content,
      'hex'
    ))
  }

  /*
    We decrypt the content if the message type allows it to be decrypted with
    the primary keyset.

    Otherwise, it will need to be decrypted later (see the <EncryptedMessage />
    component.)
  */
  let decryptedContent
  if (messageType === 'text') {
    // For text messages, this is fairly straightforward.
    decryptedContent = await decrypt({
      ciphertext: messageData,
      key: 'primarySigning',
      pub: foreignProfile.primarySigningPub
    })
  } else if (messageType === 'photo') {
    // For pictures, we need to parse the image so that it can be rendered
    // inside an <img /> tag.
    decryptedContent = new Blob([
      Uint8Array.from(Buffer.from(await decrypt({
        ciphertext: messageData,
        key: 'primarySigning',
        pub: foreignProfile.primarySigningPub
      }), 'base64'))
    ])
    decryptedContent = await new Promise(resolve => {
      const reader = new window.FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(decryptedContent)
    })
  }

  // The data is returned in a conveniently-shaped format.
  return {
    messageID: message._id,
    messageType,
    time: message.timestamp,
    senderID: message.sender,
    content: decryptedContent || messageData,
    foreignID
  }
}
