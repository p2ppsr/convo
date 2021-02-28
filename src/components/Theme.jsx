import React from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/styles'

/*

This component provides a basic Material-UI theme and a few useful templates.

*/

const baseTheme = createMuiTheme({
  spacing: 8,
  typography: {
    h1: {
      fontWeight: 'bold',
      fontSize: '2.5em'
    },
    h2: {
      fontWeight: 'bold',
      fontSize: '1.7em'
    },
    h3: {
      fontSize: '1.4em'
    },
    h4: {
      fontSize: '1.25em'
    },
    h5: {
      fontSize: '1.1em'
    },
    h6: {
      fontSize: '1em'
    }
  },
  overrides: {},
  maxContentWidth: '1440px'
})

const extendedTheme = theme => ({
  ...theme,
  typography: {
    ...theme.typography,
    h1: {
      ...theme.typography.h1,
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.8em'
      }
    },
    h2: {
      ...theme.typography.h2,
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.6em'
      }
    }
  },
  templates: {
    page_wrap: {
      maxWidth: `min(${theme.maxContentWidth}, 100vw)`,
      margin: 'auto',
      boxSizing: 'border-box',
      padding: theme.spacing(7),
      [theme.breakpoints.down('md')]: {
        padding: theme.spacing(5)
      },
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3)
      }
    },
    subheading: {
      textTransform: 'uppercase',
      letterSpacing: '6px',
      fontWeight: '700'
    }
  }
})

export default withStyles({
  '@global html': {
    padding: '0px',
    margin: '0px'
  },
  '@global body': {
    padding: '0px',
    margin: '0px',
    fontFamily: 'helvetica'
  },
  '@global a': {
    textDecoration: 'none',
    color: 'unset'
  },
  '@global h1': {
    fontWeight: 'bold',
    fontSize: '2.5em'
  },
  '@global h2': {
    fontWeight: 'bold',
    fontSize: '1.7em'
  },
  '@global h3': {
    fontSize: '1.4em'
  },
  '@global h4': {
    fontSize: '1.25em'
  },
  '@global h5': {
    fontSize: '1.1em'
  },
  '@global h6': {
    fontSize: '1em'
  }
})(({ children }) => (
  <ThemeProvider theme={baseTheme}>
    <ThemeProvider theme={extendedTheme}>
      {children}
    </ThemeProvider>
  </ThemeProvider>
))
