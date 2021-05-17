import bsv from 'bsv'
import { getPrimarySigningPub } from '@babbage/sdk'
import { toast } from 'react-toastify'

export default async () => {
  try {
    const xpubKey = await getPrimarySigningPub({
      path: 'm/2000/1'
    })
    const hdPub = bsv.HDPublicKey.fromString(xpubKey)
    const addr = bsv.Address.fromPublicKey(hdPub.publicKey).toString()
    return addr
  } catch (e) {
    toast.error(
      'Could not identify your account! Make sure Convo has permision.'
    )
    throw e
  }
}
