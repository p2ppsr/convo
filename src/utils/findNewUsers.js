import parapet from 'parapet-js'
import { PROFILES_PROTOCOL_ADDRESS } from 'parameters'

/*
We leverage chainquery to get a list of recent profile publication transactions.
*/
export default async () => {
  const result = await parapet({
    bridge: PROFILES_PROTOCOL_ADDRESS,
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
