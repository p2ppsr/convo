import React from 'react'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, Typography
} from '@material-ui/core'
import store from 'redux/store'
import { UPDATE_LOCAL_PROFILE } from 'redux/types'
import { makeStyles } from '@material-ui/core/styles'
import style from './style'
import { withRouter } from 'react-router-dom'
const useStyles = makeStyles(style, {
  name: 'SettingsModal'
})

const SettingsModal = ({ history, localProfile }) => {
  const classes = useStyles()

  const handleClose = () => {
    store.dispatch({
      type: UPDATE_LOCAL_PROFILE,
      payload: {
        settingsOpen: false
      }
    })
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
      </DialogContent>
    </Dialog>
  )
}

const stateToProps = state => ({
  localProfile: state.localProfile
})

export default connect(stateToProps)(withRouter(SettingsModal))
