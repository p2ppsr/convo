import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import loadConvos from 'redux/actions/convos/loadConvos'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import { Img } from 'uhrp-react'
import bridgeportResolvers from 'utils/bridgeportResolvers'

const useStyles = makeStyles(style, {
  name: 'ConvoList'
})

const getSecondaryText = (userID, messages) => {
  const lastMessage = Object.values(messages)
    .sort((a, b) => a.time - b.time > 0 ? -1 : 1)[0]
  let secondaryText = lastMessage.senderID === userID
    ? 'Sent a '
    : 'You sent a '
  switch (lastMessage.messageType) {
    case 'text':
      if (lastMessage.content.length <= 30) {
        secondaryText = lastMessage.content
      } else {
        secondaryText = `${
          lastMessage.content
            .split(' ')
            .slice(0, 4)
            .join(' ')
            .substr(0, 30)
        }...`
      }
      break
    case 'photo':
      secondaryText += 'picture'
      break
    case 'secret-text':
      secondaryText += 'secret text'
      break
    case 'secret-photo':
      secondaryText += 'secret photo'
      break
    default:
      secondaryText += 'message'
  }
  return secondaryText
}

const ConvoList = ({ convos, foreignProfiles }) => {
  const classes = useStyles()

  useEffect(() => {
    loadConvos()
  }, [])

  if (Object.entries(convos).length > 0) {
    return (
      <List>
        {Object.entries(convos).map(([userID, messages], i) => {
          const secondaryText = getSecondaryText(userID, messages)
          return (
            <Link
              key={i}
              to={`/convos/${userID}`}
            >
              <ListItem
                button
                selected={window.location.pathname === `/convos/${userID}`}
              >
                <ListItemIcon>
                  <Img
                    src={foreignProfiles[userID] && foreignProfiles[userID].photoURL}
                    className={classes.photo}
                    alt=''
                    bridgeportResolvers={bridgeportResolvers()}
                  />
                </ListItemIcon>
                <ListItemText
                  inset
                  primary={
                    foreignProfiles[userID] &&
                    foreignProfiles[userID].name
                  }
                  secondary={secondaryText}
                />
              </ListItem>
            </Link>
          )
        })}
      </List>
    )
  } else {
    return (
      <div className={classes.min_height}>
        <Typography color='textSecondary' align='center'>
          No convos yet...
        </Typography>
      </div>
    )
  }
}

const stateToProps = state => ({
  foreignProfiles: state.foreignProfiles,
  convos: state.convos
})

export default connect(stateToProps)(ConvoList)
