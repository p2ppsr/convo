import { getPublicKey } from '@babbage/sdk'
import { toast } from 'react-toastify'

export default async () => {
  try {
    const pubkey = await getPublicKey({
      identityKey: true,
      privileged: false,
      returnType: 'string'
    })
    return pubkey
  } catch (e) {
    toast.error(
      'Could not identify your account! Make sure Convo has permision.'
    )
    throw e
  }
}
