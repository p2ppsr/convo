import React, { useEffect } from 'react'
import {
  Typography,
  Hidden,
  IconButton,
  Card,
  CardContent
} from '@material-ui/core'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import style from './style'
import loadConvos from 'redux/actions/convos/loadConvos'
import loadForeignProfile from 'redux/actions/foreignProfiles/loadForeignProfile'
import ArrowBackIos from '@material-ui/icons/ArrowBackIos'
import { Link, withRouter } from 'react-router-dom'
import MessageForm from 'components/MessageForm'
import EncryptedMessage from 'components/EncryptedMessage'
import Message from 'components/Message'
import { Img } from 'uhrp-react'
import bridgeportResolvers from 'utils/bridgeportResolvers'

const useStyles = makeStyles(style, {
  name: 'Convo'
})

const Convo = ({
  match,
  convos,
  foreignProfiles,
  history
}) => {
  const classes = useStyles()
  const currentConvo = convos[match.params.userID]

  /*
    Load our conversations and the foreign profile for the person we are
    talking with
  */
  useEffect(() => {
    loadForeignProfile(match.params.userID)
    loadConvos()
  }, [match.params.userID])

  /*
    Scroll to the bottom of the conversation when a new message is sent or
    received
  */
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [currentConvo])

  return (
    <div className={classes.content_wrap}>
      <Card square className={classes.convo_header_wrap}>
        <CardContent className={classes.convo_header}>
          <Hidden mdUp>
            <Link to='/convos'>
              <IconButton>
                <ArrowBackIos />
              </IconButton>
            </Link>
          </Hidden>
          <Img
            className={classes.photo}
            src={
              foreignProfiles[match.params.userID] &&
              foreignProfiles[match.params.userID].photoURL
            }
            alt={
              foreignProfiles[match.params.userID] &&
              foreignProfiles[match.params.userID].name
            }
            bridgeportResolvers={bridgeportResolvers()}
          />
          <Typography variant='h3'>
            {
              foreignProfiles[match.params.userID] &&
              foreignProfiles[match.params.userID].name
            }
          </Typography>
        </CardContent>
      </Card>
      <div className={classes.grow_wrap}>
        <div className={classes.messages_container}>
          <div className={classes.messages}>
            {
              foreignProfiles[match.params.userID] && (
                convos[match.params.userID] &&
                Object.keys(convos[match.params.userID]).length > 0
                  ? Object.values(convos[match.params.userID])
                    .sort((a, b) => a.time - b.time > 0 ? 1 : -1)
                    .map((message, i) => {
                      switch (message.messageType) {
                        case 'text':
                        case 'photo':
                          return (
                            <Message
                              key={i}
                              className={
                                message.senderID !== message.foreignID
                                  ? classes.local_message
                                  : classes.foreign_message
                              }
                              message={message}
                            />
                          )
                        case 'secret-text':
                        case 'secret-photo':
                          return (
                            <EncryptedMessage
                              key={i}
                              className={
                                message.senderID !== message.foreignID
                                  ? classes.local_message
                                  : classes.foreign_message
                              }
                              message={message}
                            />
                          )
                        default:
                          return (
                            <Typography
                              key={i}
                              style={{
                                fontFamily: 'monospace'
                              }}
                              className={
                                message.senderID === message.foreignID
                                  ? classes.foreign_message
                                  : classes.local_message
                              }
                            >
                            Unknown message type:
                              <b><i>{' '}{message.messageType}</i></b>
                            </Typography>
                          )
                      }
                    })
                  : (
                    <div className={classes.no_messages}>
                      <div>
                        <Img
                          src={foreignProfiles[match.params.userID].photoURL}
                          alt={foreignProfiles[match.params.userID].name}
                          className={classes.center_photo}
                          bridgeportResolvers={bridgeportResolvers()}
                        />
                        <Typography variant='h3' algin='center' paragraph>
                          {`Connect with ${foreignProfiles[match.params.userID].name}`}
                        </Typography>
                      </div>
                    </div>
                  )
              )
            }
          </div>
        </div>
      </div>
      <Card square className={classes.message_box_wrap}>
        <CardContent>
          <MessageForm to={match.params.userID} />
        </CardContent>
      </Card>
    </div>
  )
}

const stateToProps = state => ({
  convos: state.convos,
  foreignProfiles: state.foreignProfiles
})

export default connect(stateToProps)(withRouter(Convo))
