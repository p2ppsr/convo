export default theme => ({
  content_wrap: {
    ...theme.templates.page_wrap,
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gridColumnGap: '0px',
    padding: '0px',
    height: '100vh',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr 1fr'
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  },
  overflow_scroll: {
    overflowY: 'scroll',
    flexGrow: 1
  },
  left_pane: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  app_title: {
    marginTop: `calc(50vh - ${theme.spacing(3)}px)`
  },
  sticky_card: {
    position: 'sticky',
    top: '0px',
    height: '100vh'
  },
  sticky_card_content: {
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '0px !important'
  },
  content_frame: {
    display: 'grid',
    height: '100%'
  },
  full_height: {
    height: '100%'
  }
})
