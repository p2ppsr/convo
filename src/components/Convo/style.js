export default theme => ({
  content_wrap: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  convo_header_wrap: {
    position: 'sticky',
    top: '0px',
    margin: '0px',
    zIndex: 1600
  },
  convo_header: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridColumnGap: theme.spacing(3),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'auto auto 1fr'
    }
  },
  photo: {
    width: '3em',
    height: '3em'
  },
  grow_wrap: {
    flexGrow: 1,
    boxSizing: 'border-box'
  },
  messages_container: {
    boxSizing: 'border-box',
    padding: theme.spacing(3),
    overflowY: 'scroll',
    height: '100%'
  },
  messages: {
    display: 'grid',
    gridTemplateColumns: '1fr'
  },
  no_messages: {
    margin: 'auto',
    textAlign: 'center',
    height: '100%',
    display: 'grid',
    placeItems: 'center'
  },
  center_photo: {
    width: '40%',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  foreign_message: {
    backgroundColor: '#bbb',
    color: '#000',
    borderRadius: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    boxSizing: 'border-box',
    margin: theme.spacing(1),
    display: 'block',
    width: 'fit-content',
    maxWidth: '85%'
  },
  local_message: {
    backgroundColor: '#66f',
    color: '#fff',
    borderRadius: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    boxSizing: 'border-box',
    margin: theme.spacing(1),
    display: 'block',
    width: 'fit-content',
    maxWidth: '85%',
    justifySelf: 'right'
  },
  message_box_wrap: {
    position: 'sticky',
    bottom: '0px'
  }
})
