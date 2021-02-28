import React, { useState, useEffect, useRef } from 'react'
import { waitForInitialization, isAuthenticated } from 'rubeus-js'
import sendMessage from 'redux/actions/convos/sendMessage'
import {
  LinearProgress, IconButton, TextField, FormControlLabel, Checkbox, Fab
} from '@material-ui/core'
import PhotoIcon from '@material-ui/icons/Photo'
import SendIcon from '@material-ui/icons/Send'
import { makeStyles } from '@material-ui/core/styles'
import style from './style'
const useStyles = makeStyles(style, {
  name: 'MessageForm'
})

/*

This component is responsible for composing and sending messages.

*/
const MessageForm = ({ to }) => {
  const classes = useStyles()
  const messageTextRef = useRef()
  const fileInputRef = useRef()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [secret, setSecret] = useState(false)
  const [photoURL, setPhotoURL] = useState(null)
  const [photoData, setPhotoData] = useState(null)

  useEffect(() => {
    (async () => {
      await waitForInitialization()
      if (isAuthenticated()) {
        setAuthenticated(true)
      }
    })()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!authenticated) {
      return
    }
    setLoading(true)
    // We send photos first (they are generally more expensive)
    if (photoData) {
      const success = await sendMessage({
        to,
        message: {
          messageType: secret ? 'secret-photo' : 'photo',
          content: photoData
        }
      })
      // Clear the photo after it is sent
      if (success) {
        setPhotoData(null)
        setPhotoURL(null)
      }
    }
    if (messageText) {
      const success = await sendMessage({
        to,
        message: {
          messageType: secret ? 'secret-text' : 'text',
          content: messageText
        }
      })
      if (success) {
        // Clear the text and re-focus after sending
        setMessageText('')
        messageTextRef.current.focus()
      }
    }
    setLoading(false)
  }

  // Open the file chooser when the "Send Picture" button is clicked
  const handlePhotoClick = () => {
    fileInputRef.current.click()
  }

  // Parse the photo for preview when it is uploaded
  const handleFileChange = e => {
    if (e.target.files.length > 0) {
      const URLReader = new FileReader()
      URLReader.onload = () => {
        setPhotoURL(URLReader.result)
      }
      URLReader.readAsDataURL(e.target.files[0])
      const arrayReader = new FileReader()
      arrayReader.onload = () => {
        setPhotoData(new Uint8Array(arrayReader.result))
      }
      arrayReader.readAsArrayBuffer(e.target.files[0])
    }
  }

  const handleDeletePhoto = () => {
    setPhotoURL(null)
    setPhotoData(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      {loading && (
        <LinearProgress />
      )}
      <input
        type='file'
        className={classes.hidden}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {photoURL && (
        <div className={classes.photo_preview}>
          <img
            src={photoURL}
            className={classes.photo_preview_img}
            alt='preview'
          />
          <Fab
            onClick={handleDeletePhoto}
            color='secondary'
            className={classes.photo_cancel}
          >
            X
          </Fab>
        </div>
      )}
      <div className={classes.grid}>
        <IconButton color='primary' onClick={handlePhotoClick}>
          <PhotoIcon />
        </IconButton>
        <TextField
          fullWidth
          variant='outlined'
          autoFocus={!loading}
          placeholder={authenticated
            ? 'Send a message...'
            : 'Sign up to send message...'}
          onChange={e => setMessageText(e.target.value)}
          value={messageText}
          disabled={loading || !authenticated}
          inputRef={messageTextRef}
        />
        <IconButton color='primary' type='submit'>
          <SendIcon />
        </IconButton>
      </div>
      <FormControlLabel
        className={classes.form_control}
        control={
          <Checkbox
            checked={secret}
            onChange={(e => setSecret(e.target.checked))}
            color='secondary'
          />
        }
        label='Send as Secret Message'
      />
    </form>
  )
}

export default MessageForm
