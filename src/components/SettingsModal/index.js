import React from 'react'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, DialogActions, Typography, Button
} from '@material-ui/core'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE, RESET_APP } from 'redux/types'
import { makeStyles } from '@material-ui/core/styles'
import style from './style'
import { withRouter } from 'react-router-dom'
import { getVersion, logout } from 'rubeus-js'
const useStyles = makeStyles(style, {
  name: 'SettingsModal'
})

const SettingsModal = ({ history, localProfile }) => {
  const classes = useStyles()
  const CWIVersion = getVersion()

  const handleClose = () => {
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        settingsOpen: false
      }
    })
  }

  const handleCWISettings = () => {
    history.push('/cwi-settings')
    handleClose()
  }

  /*
    We clear storage, use CWI logout function, reset state and go back to the
    start page when the user logs out.
  */
  const handleLogout = () => {
    localStorage.clear()
    logout()
    store.dispatch({
      type: RESET_APP
    })
    history.push('/')
  }

  return (
    <Dialog
      open={localProfile.settingsOpen}
      onClose={handleClose}
    >
      <DialogContent>
        <Typography variant='h3' align='center' paragraph>
          Settings
        </Typography>
        <Typography variant='h4'>
          Your Profile
        </Typography>
        <Typography
          color='textSecondary'
          paragraph
          className={classes.profile_link}
        >
          {`https://convo.babbage.systems/convos/${localProfile.userID}`}
        </Typography>
        <Typography variant='h4'>
          App Version
        </Typography>
        <Typography color='textSecondary' paragraph>
          Convo Messenger v0.1.1
        </Typography>
        <Typography variant='h4'>
          CWI Version
        </Typography>
        <Typography color='textSecondary' paragraph>
           Computing with Integrity v{CWIVersion}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCWISettings} color='primary'>
          CWI Settings
        </Button>
        <Button onClick={handleLogout} color='secondary'>
          Log Out
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const stateToProps = state => ({
  localProfile: state.localProfile
})

export default connect(stateToProps)(withRouter(SettingsModal))
