export default theme => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto'
  },
  hidden: {
    display: 'none'
  },
  form_control: {
    marginLeft: '0px',
    marginBottom: theme.spacing(-2)
  },
  photo_preview: {
    position: 'relative'
  },
  photo_preview_img: {
    width: '10em',
    maxHeight: '12em',
    borderRadius: '4px'
  },
  photo_cancel: {
    position: 'absolute',
    left: '0px',
    top: '0px'
  }
})
