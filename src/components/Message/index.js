import React, { useState, useEffect } from 'react'
import { decrypt } from '@babbage/sdk'
import { Typography, CircularProgress } from '@material-ui/core'
import { connect } from 'react-redux'
import decompressPubkey from 'utils/decompressPubkey'

/*

This component leverages getPrivilegedKey to unlock a message that was
encrypted with the privileged signing keyset.

*/
const Message = ({ message, className, foreignProfiles }) => {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        // The message content is encrypted with the shared secret.
        if (message.messageType === 'text') {
          // Text is already decrypted
          setContent(message.content)

          /*
            For picture messages, we need to parse the decrypted file so that it can bee rendered in an < img /> tag.
          */
        } else if (message.messageType === 'photo') {
          // Get the URL
          const result = await window.fetch(message.content)
          const messageData = new Uint8Array(await result.arrayBuffer())
          const blob = new Blob([
            Buffer.from(await decrypt({
              ciphertext: messageData,
              key: 'primarySigning',
              path: 'm/2000/1',
              pub: await decompressPubkey(
                foreignProfiles[message.foreignID].primarySigningPub
              )
            }), 'base64')
          ])
          const reader = new window.FileReader()
          reader.onload = () => {
            setContent(reader.result)
          }
          reader.readAsDataURL(blob)
        }

        setLoading(false)
      } catch (e) {
        setLoading(false)
      }
    })()
  }, [foreignProfiles, message.foreignID, message.content, message.messageType])

  if (loading) {
    return (
      <div className={className}>
        <CircularProgress />
      </div>
    )
  }

  if (message.messageType === 'text') {
    return (
      <Typography
        className={className}
      >
        {content}
      </Typography>
    )
  } else {
    return (
      <img
        src={content}
        alt='message'
        className={className}
      />
    )
  }
}

const stateToProps = state => ({
  foreignProfiles: state.foreignProfiles
})

export default connect(stateToProps)(Message)
