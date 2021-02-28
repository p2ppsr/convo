export default theme => ({
  content_wrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto',
    gridColumnGap: theme.spacing(1),
    alignItems: 'center',
    paddingBottom: theme.spacing(3)
  },
  photo: {
    marginRight: theme.spacing(0.25),
    width: '3em',
    height: '3em',
    borderRadius: '4px'
  }
})
