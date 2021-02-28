import React, { useState } from 'react'
import { decrypt } from 'rubeus-js'
import { Typography, Fab, CircularProgress } from '@material-ui/core'
import LockIcon from '@material-ui/icons/Lock'
import PhotoIcon from '@material-ui/icons/Photo'
import TextIcon from '@material-ui/icons/Subject'
import { connect } from 'react-redux'

/*

This component leverages getPrivilegedKey to unlock a message that was
encrypted with the privileged signing keyset.

*/
const EncryptedMessage = ({ message, className, foreignProfiles }) => {
  const [decryptedContent, setDecryptedContent] = useState(null)
  const [loading, setLoading] = useState(false)

  const decryptMessage = async () => {
    try {
      setLoading(true)

      const reason = `Unlock a secret message ${message.senderID === message.foreignID ? `from ${foreignProfiles[message.foreignID].name}` : `you sent to ${foreignProfiles[message.foreignID].name}`}`

      // The message content is encrypted with the shared secret.
      if (message.messageType === 'secret-text') {
        setDecryptedContent(await decrypt({
          ciphertext: message.content,
          key: 'privilegedSigning',
          path: 'm/2000/1',
          pub: foreignProfiles[message.foreignID].privilegedSigningPub,
          reason
        }))

      /*
        For picture messages, we need to parse the decrypted file so that it can bee rendered in an < img /> tag.
      */
      } else if (message.messageType === 'secret-photo') {
        const blob = new Blob([
          await decrypt({
            ciphertext: message.content,
            key: 'privilegedSigning',
            pub: foreignProfiles[message.foreignID].privilegedSigningPub,
            reason
          })
        ])
        const reader = new window.FileReader()
        reader.onload = () => {
          setDecryptedContent(reader.result)
        }
        reader.readAsDataURL(blob)
      }

      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <CircularProgress />
      </div>
    )
  }

  if (decryptedContent) {
    if (message.messageType === 'secret-text') {
      return (
        <Typography
          className={className}
        >
          {decryptedContent}
        </Typography>
      )
    } else {
      return (
        <img
          src={decryptedContent}
          alt='secret message'
          className={className}
        />
      )
    }
  } else {
    if (message.messageType === 'secret-text') {
      return (
        <div className={className}>
          <Fab
            disabled={!foreignProfiles[message.foreignID]}
            onClick={decryptMessage}
          >
            <LockIcon
              color='primary'
            />
            <TextIcon
              color='primary'
            />
          </Fab>
        </div>
      )
    } else {
      return (
        <div className={className}>
          <Fab
            disabled={!foreignProfiles[message.foreignID]}
            onClick={decryptMessage}
          >
            <LockIcon
              color='primary'
            />
            <PhotoIcon
              color='primary'
            />
          </Fab>
        </div>
      )
    }
  }
}

const stateToProps = state => ({
  foreignProfiles: state.foreignProfiles
})

export default connect(stateToProps)(EncryptedMessage)
