// Adapted from https://github.com/johnnolan/react-jest-webcrypto/blob/2695b6122c9350a2f36764237bcd2ec3a31dfd4b/src/setupTests.js

// WebCrypto functionality requires the ability to encode and decode text and access it from the window.
import encoding from 'text-encoding'
import { Crypto } from '@peculiar/webcrypto'

window.TextEncoder = encoding.TextEncoder
window.TextDecoder = encoding.TextDecoder

// Gives us access to a implementation of WebCrypto in Node which is available in the broswer but missing on the command line.
window.crypto = new Crypto()
