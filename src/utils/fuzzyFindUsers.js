import parapet from 'parapet-js'
import { PROFILES_BUS_ID } from 'parameters'

/*
As with the getConvos function, a more advanced query here could filter out old versions of user profiles by eliminating all but the latest revision of a profile published by a given userID address from the scope of the search.

However, this is beyond the scope of the authentication demo. Services wishing to use the blockchain as a backend database should host and index their own subsets of blockchain data rather than relying on Bitbus or Bitsocket, which are simply synchronization tools.

In the future, CWI's chainquery function will switch away from Bitbus and Bitsocket and these limitations will be removed.
*/
export default async query => {
  const result = await parapet({
    bridge: PROFILES_BUS_ID,
    request: {
      type: 'json-query',
      query: {
        v: 3,
        q: {
          collection: 'profiles',
          find: {
            // TODO: Text search query
            name: query
          },
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
