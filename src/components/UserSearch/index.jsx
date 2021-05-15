import React, { useState } from 'react'
import fuzzyFindUsers from 'utils/fuzzyFindUsers'
import {
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import { Img } from 'uhrp-react'

const useStyles = makeStyles(style, {
  name: 'UserSearch'
})

/*

This component searches for users by name and shows the results

*/
const UserSearch = () => {
  const classes = useStyles()
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await fuzzyFindUsers(search)
    setSearchResult(res)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          onChange={e => {
            setSearch(e.target.value)
            if (!e.target.value.length) {
              setSearchResult([])
            }
          }}
          placeholder='Search Users...'
          variant='outlined'
          fullWidth
        />
        <IconButton
          type='submit'
          disabled={loading || !search.length}
          color='primary'
        >
          <SearchIcon />
        </IconButton>
      </form>
      {loading && (
        <LinearProgress />
      )}
      {searchResult.length > 0 && (
        <Typography variant='h4'>
          Search Results
        </Typography>
      )}
      <List>
        {searchResult.map((p, i) => (
          <Link to={`/convos/${p.userID}`} key={i}>
            <ListItem button>
              <ListItemIcon>
                <Img
                  src={p.photoURL}
                  alt=''
                  className={classes.photo}
                />
              </ListItemIcon>
              <ListItemText inset>
                {p.name}
              </ListItemText>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  )
}

export default UserSearch
