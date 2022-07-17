import React, { useState, useEffect } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import findNewUsers from 'utils/findNewUsers'
import { connect } from 'react-redux'
import { Img } from 'uhrp-react'
import bridgeportResolvers from 'utils/bridgeportResolvers'

const useStyles = makeStyles(style, {
  name: 'NewUsersList'
})

/*

This component shows a list of new users

*/
const NewUsersList = ({ convos, localProfile }) => {
  const classes = useStyles()
  const [users, setUsers] = useState([])

  useEffect(() => {
    (async () => {
      setUsers(await findNewUsers())
    })()
  }, [])

  const filteredUsers = users
    .filter(user => (
      !Object.keys(convos).some(x => x === user.userID) &&
      localProfile.loaded ? localProfile.userID !== user.userID : true
    ))

  if (filteredUsers.length > 0) {
    return (
      <List>
        {filteredUsers.map((user, i) => (
          <Link
            key={i}
            to={`/convos/${user.userID}`}
          >
            <ListItem button>
              <ListItemIcon>
                <Img
                  src={user.photoURL}
                  className={classes.photo}
                  alt=''
                  bridgeportResolvers={bridgeportResolvers()}
                />
              </ListItemIcon>
              <ListItemText inset primary={user.name} />
            </ListItem>
          </Link>
        ))}
      </List>
    )
  } else {
    return (
      <div className={classes.min_height}>
        <Typography color='textSecondary' align='center'>
          No new users...
        </Typography>
      </div>
    )
  }
}

const stateToProps = state => ({
  convos: state.convos,
  localProfile: state.localProfile
})

export default connect(stateToProps)(NewUsersList)
