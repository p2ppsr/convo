import parapet from 'parapet-js'
import { PROFILES_BUS_ID } from 'parameters'
import bridgeportResolvers from 'utils/bridgeportResolvers'

/*
We leverage chainquery to get a list of recent profile publication transactions.
*/
export default async () => {
  const result = await parapet({
    resolvers: bridgeportResolvers(),
    bridge: PROFILES_BUS_ID,
    request: {
      type: 'json-query',
      query: {
        v: 3,
        q: {
          collection: 'profiles',
          find: {},
          limit: 10,
          sort: {
            timestamp: -1
          }
        }
      }
    }
  })
  const dedupeUserIDs = {}
  return result.filter(x => {
    if (dedupeUserIDs[x.userID]) {
      return false
    } else {
      dedupeUserIDs[x.userID] = true
      return true
    }
  })
}
