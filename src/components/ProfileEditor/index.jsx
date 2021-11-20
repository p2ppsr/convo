import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Fab,
  Typography,
  CircularProgress
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import style from './style'
import UploadIcon from '@material-ui/icons/Backup'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import updateLocalProfile from 'redux/actions/localProfile/updateLocalProfile'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import { toast } from 'react-toastify'
import { Img } from 'uhrp-react'

const useStyles = makeStyles(style, {
  name: 'ProfileEditor'
})

const ProfileEditor = ({ open, welcome, name, photoURL }) => {
  const classes = useStyles()
  const [editableName, setEditableName] = useState(name)
  const [editablePhotoURL, setEditablePhotoURL] = useState(photoURL)
  const fileInputRef = useRef()
  const [imageCropSrc, setImageCropSrc] = useState(null)
  const [imageCrop, setImageCrop] = useState({ aspect: 1 })
  const [cropImageRef, setCropImageRef] = useState(null)
  const [imageBlob, setImageBlob] = useState(null)
  const [loading, setLoading] = useState(false)

  // Update editable state when non-editable props change
  useEffect(() => {
    if (open === true) {
      setEditablePhotoURL(photoURL)
      setEditableName(name)
    }
  }, [open, name, photoURL])

  const handleSubmit = async e => {
    e.preventDefault()
    // Close the modal if no changes were made
    if (name === editableName && photoURL === editablePhotoURL) {
      store.dispatch({
        type: UPDATE_LOCAL_PROFILE,
        payload: {
          editorOpen: false,
          welcomeMessage: false
        }
      })
      return
    }
    if (!editableName) {
      toast.error('Enter a name!')
      return
    }
    setLoading(true)
    let photoUint8Array
    if (photoURL !== editablePhotoURL) {
      photoUint8Array = new Uint8Array(await imageBlob.arrayBuffer())
    }
    try {
      // Either the new photo is passed as a Uint8Array or an existing photo URL is used
      await updateLocalProfile({
        name: editableName,
        photo: photoUint8Array || photoURL
      })
      store.dispatch({
        type: UPDATE_LOCAL_PROFILE,
        payload: {
          editorOpen: false,
          welcomeMessage: false
        }
      })
    } catch (e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const processFile = async e => {
    if (fileInputRef.current.files[0]) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageCropSrc(reader.result)
      }
      reader.readAsDataURL(fileInputRef.current.files[0])
    }
  }

  const handleImageLoad = img => {
    setCropImageRef(img)
  }

  const processCroppedImage = async () => {
    setEditablePhotoURL(await getCroppedImg(
      cropImageRef,
      imageCrop,
      'profile.jpg'
    ))
    setImageCropSrc(null)
  }

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = (crop.width || image.width)
    canvas.height = (crop.height || image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      (crop.width || image.width) * scaleX,
      (crop.height || image.height) * scaleY,
      0,
      0,
      (crop.width || image.width),
      (crop.height || image.height)
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          toast.error('Click and drag to crop your image!')
          return
        }
        resolve(window.URL.createObjectURL(blob))
        setImageBlob(blob)
      }, 'image/jpeg')
    })
  }

  const handleClose = () => {
    if (!welcome && !loading) {
      store.dispatch({
        type: UPDATE_LOCAL_PROFILE,
        payload: {
          editorOpen: false
        }
      })
    }
  }

  return (
    <Dialog open={!!open} onClose={handleClose}>
      <DialogTitle>
        {welcome ? 'Create Your Profile' : 'Edit Profile'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {imageCropSrc ? (
            <div className={classes.cropper_wrap}>
              <ReactCrop
                src={imageCropSrc}
                crop={imageCrop}
                onChange={e => setImageCrop(e)}
                onImageLoaded={handleImageLoad}
              />
              <br />
              <Typography
                align='center'
                color='textSecondary'
                paragraph
              >
                Drag to Crop Image
              </Typography>
              <div className={classes.crop_buttons_wrap}>
                <Button
                  variant='contained'
                  onClick={() => setImageCropSrc(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={processCroppedImage}
                >
                  Accept
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={classes.image_frame}>
                <input
                  type='file'
                  className={classes.hidden}
                  ref={fileInputRef}
                  onChange={processFile}
                />
                <Fab
                  className={classes.upload_button}
                  onClick={() => fileInputRef.current.click()}
                  color='primary'
                >
                  <UploadIcon />
                </Fab>
                {editablePhotoURL && (
                  <Img
                    src={editablePhotoURL}
                    className={classes.photo}
                    alt=''
                  />
                )}
              </div>
              <Typography
                align='center'
                color='textSecondary'
                paragraph
              >
                  Click to Upload Image
              </Typography>
              <TextField
                label='Name'
                onChange={e => {
                  setEditableName(e.target.value)
                }}
                defaultValue={name}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {loading ? <CircularProgress /> : (
            <Button
              type='submit'
              disabled={(!!imageCropSrc) || !editableName}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}

const stateToProps = state => ({
  open: state.localProfile.editorOpen,
  welcome: state.localProfile.welcomeMessage,
  name: state.localProfile.name,
  photoURL: state.localProfile.photoURL
})

export default connect(stateToProps)(ProfileEditor)
