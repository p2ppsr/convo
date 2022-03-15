import React from 'react'
import { Provider } from 'react-redux'
import store from 'redux/store'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Convos from './pages/Convos'
import Initializer from './components/Initializer'
import ProfileEditor from './components/ProfileEditor'
import SettingsModal from './components/SettingsModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

let ErrorBoundary = x => x.children

if (process.env.REACT_APP_NODE_ENV === 'production') {
  Bugsnag.start({
    apiKey: process.env.REACT_APP_BUGSNAG_KEY,
    plugins: [new BugsnagPluginReact()]
  })
  ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)
  window.Bugsnag = Bugsnag
}

const App = () => {
  return (
    <ErrorBoundary onError={e => console.error(e)}>
      <Provider store={store}>
        <Router>
          {/*
            This is the application-specific initializer component. It waits
            for the user to be authorized, then starts listing for any of their
            new messages.
          */}
          <Initializer />
          <ProfileEditor />
          <SettingsModal />
          <ToastContainer
            position='top-center'
            hideProgressBar
          />
          <Switch>
            <Route path='/' component={Convos} />
          </Switch>
        </Router>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
