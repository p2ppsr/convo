import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import BabbagePrompt from '@babbage/react-prompt'
import * as serviceWorker from './serviceWorker'
import Theme from './components/Theme'

ReactDOM.render(
  <Theme>
    <BabbagePrompt
      customPrompt
      appName='Convo Messenger'
      author='Ty Everett'
      authorUrl='https://tyeverett.com'
      description={'Do you value your privacy? We value ours, so we\'ve got your back. Try Convo Messenger, the world\'s first fully encrypted, decentralized messaging app that\'s powered by blockchain technology using Babbage.\nRather than feeding data silos information used to sell you garbage, why not own the messages you share with the people you trust? Own your identity. What a concept  ¯\\_(ツ)_/¯ '}
      appIcon='/icon.png'
      appImages={[
        '/previewSlide.jpeg'
      ]}
    >
      <App />
    </BabbagePrompt>
  </Theme>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
