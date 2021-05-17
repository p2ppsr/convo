import React from 'react'
import { Typography, Hidden, Card, CardContent } from '@material-ui/core'
import LocalProfile from 'components/LocalProfile'
import ConvoList from 'components/ConvoList'
import NewUsersList from 'components/NewUsersList'
import UserSearch from 'components/UserSearch'
import style from './style'
import { makeStyles, withTheme } from '@material-ui/core/styles'
import { Switch, Route, Redirect } from 'react-router-dom'
import Convo from 'components/Convo'

const useStyles = makeStyles(style, {
  name: 'Convos'
})

const Convos = ({ theme }) => {
  const classes = useStyles()
  return (
    <div className={classes.content_wrap}>
      <div
        className={
          window.location.pathname !== '/convos'
            ? classes.left_pane
            : undefined
        }
      >
        <Card square className={classes.sticky_card}>
          <CardContent className={classes.sticky_card_content}>
            <LocalProfile />
            <div className={classes.overflow_scroll}>
              <UserSearch />
              <Typography variant='h4'>Your Convos</Typography>
              <ConvoList
                key={window.location.pathname}
              />
              <Typography variant='h4'>New Users</Typography>
              <Typography color='textSecondary'>Say Hi!</Typography>
              <NewUsersList />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className={classes.full_height}>
        <Switch>
          <Route
            path='/convos/:userID'
            component={() => (
              <div className={classes.content_frame}>
                <Convo />
              </div>
            )}
          />
          <Route
            path='/convos' component={() => (
              <Hidden smDown>
                <div className={classes.center_grid}>
                  <center>
                    <img
                      alt='Convo'
                      title='Convo'
                      className={classes.convo_logo}
                      src='/icon.png'
                    />
                    <Typography
                      variant='h1'
                      className={classes.app_title}
                    >
                      Convo Messenger
                    </Typography>
                    <Typography color='textSecondary'>
                      No convo selected
                    </Typography>
                  </center>
                </div>
              </Hidden>
            )}
          />
          <Redirect from='/' to='/convos' />
        </Switch>
      </div>
    </div>
  )
}

export default withTheme(Convos)
