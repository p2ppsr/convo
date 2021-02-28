export default theme => ({
  hidden: {
    display: 'none'
  },
  cropper_wrap: {
    margin: 'auto',
    width: '12em'
  },
  image_frame: {
    width: '12em',
    height: '12em',
    display: 'grid',
    placeItems: 'center',
    margin: 'auto',
    marginBottom: theme.spacing(3),
    border: '1px solid #444',
    backgroundColor: '#ccc',
    position: 'relative'
  },
  upload_button: {
    margin: 'auto',
    display: 'boock',
    zIndex: 2
  },
  crop_buttons_wrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridColumnGap: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  photo: {
    width: '100%',
    position: 'absolute'
  }
})
