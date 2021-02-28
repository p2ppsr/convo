import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Typography, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import EditIcon from '@material-ui/icons/Edit'
import SettingsIcon from '@material-ui/icons/Settings'
import style from './style'
import loadLocalProfile from 'redux/actions/localProfile/loadLocalProfile'

const useStyles = makeStyles(style, {
  name: 'LocalProfile'
})

const LocalProfile = ({ name, photoURL, loaded }) => {
  const classes = useStyles()

  const handleEdit = () => {
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        editorOpen: true
      }
    })
  }

  const handleSettings = () => {
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        settingsOpen: true
      }
    })
  }

  // When the component mounts, we should ensure our local profile is loaded.
  useEffect(() => {
    loadLocalProfile()
  }, [])

  return (
    <div className={classes.content_wrap}>
      <img src={photoURL} className={classes.photo} alt='' />
      <Typography variant='h4'>
        {loaded ? name : '———'}
      </Typography>
      <IconButton
        disabled={!loaded}
        onClick={handleEdit}
        color='primary'
      >
        <EditIcon />
      </IconButton>
      <IconButton
        disabled={!loaded}
        onClick={handleSettings}
        color='primary'
      >
        <SettingsIcon />
      </IconButton>
    </div>
  )
}

const stateToProps = state => ({
  photoURL: state.localProfile.photoURL,
  name: state.localProfile.name,
  loaded: state.localProfile.loaded
})

export default connect(stateToProps)(LocalProfile)
