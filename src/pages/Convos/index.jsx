import React from 'react'
import { Typography, Hidden, Card, CardContent, useMediaQuery } from '@material-ui/core'
import LocalProfile from 'components/LocalProfile'
import ConvoList from 'components/ConvoList'
import NewUsersList from 'components/NewUsersList'
import UserSearch from 'components/UserSearch'
import style from './style'
import { makeStyles, withTheme } from '@material-ui/core/styles'
import { Switch, Route } from 'react-router-dom'
import Convo from 'components/Convo'

const useStyles = makeStyles(style, {
  name: 'Convos'
})

const Convos = ({ theme }) => {
  const classes = useStyles()
  const isDesktop = useMediaQuery(
    theme.breakpoints.up('md')
  )
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
        {window.location.pathname === '/convos' && (
          <Hidden smDown>
            <Typography
              variant='h1'
              paragraph
              align='center'
              className={classes.app_title}
            >
              Convo Messenger
            </Typography>
          </Hidden>
        )}
        <Switch>
          <Route
            path='/convos/:userID'
            component={() => (
              <div className={classes.content_frame}>
                <Convo />
              </div>
            )}
          />
          {isDesktop && (
            <Route
              path='/convos' component={() => (
                <Typography color='textSecondary' align='center'>
                    No convo selected
                </Typography>
              )}
            />
          )}
        </Switch>
      </div>
    </div>
  )
}

export default withTheme(Convos)
