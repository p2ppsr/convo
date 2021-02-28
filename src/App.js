import React from 'react'
import { Provider } from 'react-redux'
import store from 'redux/store'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Convos from './pages/Convos'
import Initializer from './components/Initializer'
import Theme from './components/Theme'
import ProfileEditor from './components/ProfileEditor'
import SettingsModal from './components/SettingsModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <Provider store={store}>
      <Theme>
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
      </Theme>
    </Provider>
  )
}

export default App
