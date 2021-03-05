import bsv from 'bsv'

export default hex => {
  const pub = bsv.PublicKey.fromString(hex)
  const xBuf = pub.point.x.toBuffer()
  const yBuf = pub.point.y.toBuffer()
  const fullBuf = Buffer.concat([
    Buffer.from('04', 'hex'),
    xBuf,
    yBuf
  ])
  return Uint8Array.from(fullBuf)
}
