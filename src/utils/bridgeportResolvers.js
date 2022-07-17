// exports a function returning bridgeport resolvers for current ENV.
// Resolvers are undefined in prod.

export default () => window.location.host.startsWith('localhost')
  ? ['http://localhost:3103']
  : undefined
