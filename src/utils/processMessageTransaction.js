import { decrypt } from '@babbage/sdk'
import getUserID from './getUserID'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import decompressPubkey from 'utils/decompressPubkey'
import { isValidURL } from 'uhrp-url'
import { resolve } from 'nanoseek'

export default async message => {
  try {
    /*
      The message type is encrypted with an ECDH common shared secret between the
      sender and the recipient. To use ECDH, we need the public key of the foreign user.
    */
    const localUserID = await getUserID()
    const foreignID =
      message.recipient === localUserID
        ? message.sender
        : message.recipient
    const foreignProfile = await loadForeignProfile(foreignID)
    if (foreignProfile === null) {
      return null
    }
    const foreignPrimarySigningPub = await decompressPubkey(
      foreignProfile.primarySigningPub
    )

    // The message type is encrypted with the shared secret
    const messageType = await decrypt({
      ciphertext: message.type,
      key: 'primarySigning',
      path: 'm/2000/1',
      pub: foreignPrimarySigningPub,
      returnType: 'string'
    })

    let messageData

    // If the message type is photo or secret-photo, message.content is a URL
    if (messageType === 'photo' || messageType === 'secret-photo') {
      let parsedURL = atob(message.content)
      // For UHRP, resolve the URL to a host first
      if (isValidURL(parsedURL)) {
        const resolved = await resolve({ URL: parsedURL })
        parsedURL = resolved[0]
      }
      messageData = parsedURL

      /*
        When messageType is text or secret-text, the message content is sometimes more than 512 bytes long. If it is longer than 512 bytes, it needs to be fetched from Bitfs.
      */
    } else if (
      (messageType === 'text' || messageType === 'secret-text') &&
      message.contentBitfsURL
    ) {
      const result = await window.fetch(
        `https://x.bitfs.network/${message.contentBitfsURL}`
      )
      messageData = new Uint8Array(await result.arrayBuffer())
      // For secret-text, the message data must be turned into base64 so it can be decrypted later
      if (messageType === 'secret-text') {
        messageData = Buffer.from(messageData).toString('base64')
      }

      // When not a photo and not longer than 512 bytes, messageData is just the base64 message.content string
    } else {
      messageData = message.content
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
        path: 'm/2000/1',
        pub: foreignPrimarySigningPub,
        returnType: 'string'
      })
    }

    // The data is returned in a conveniently-shaped format.
    // When content was not decrypted (messageType is secret-text or secret-photo), messageData should be a base64 that was encrypted with privileged signing. This is decrypted later on by the user, if desired.
    return {
      messageID: message._id,
      messageType,
      time: message.timestamp,
      senderID: message.sender,
      content: decryptedContent || messageData,
      foreignID
    }
  } catch (e) {
    console.error(`Failed to process message ${message._id}: ${e.message}`)
    return null
  }
}
