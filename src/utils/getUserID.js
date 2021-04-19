import bsv from 'bsv'
import { getPrimarySigningPub } from '@babbage/sdk'

export default async () => {
  const xpubKey = await getPrimarySigningPub({
    path: 'm/2000/1'
  })
  const hdPub = bsv.HDPublicKey.fromString(xpubKey)
  const addr = bsv.Address.fromPublicKey(hdPub.publicKey).toString()
  return addr
}
