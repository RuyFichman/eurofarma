import { createHmac, timingSafeEqual } from 'node:crypto'

export function isValidTwilioSignature(params: {
  url: string
  form: URLSearchParams
  signatureHeader: string | null
  authToken: string
}): boolean {
  const { url, form, signatureHeader, authToken } = params
  if (!signatureHeader || !authToken.trim()) return false

  const keys = [...new Set(form.keys())].sort()
  let signedValue = url
  for (const key of keys) {
    for (const value of form.getAll(key).sort()) signedValue += `${key}${value}`
  }

  const expected = createHmac('sha1', authToken)
    .update(signedValue)
    .digest('base64')
  const receivedBuffer = Buffer.from(signatureHeader)
  const expectedBuffer = Buffer.from(expected)

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

export function signTwilioRequest(params: {
  url: string
  form: URLSearchParams
  authToken: string
}): string {
  const keys = [...new Set(params.form.keys())].sort()
  let signedValue = params.url
  for (const key of keys) {
    for (const value of params.form.getAll(key).sort()) {
      signedValue += `${key}${value}`
    }
  }
  return createHmac('sha1', params.authToken)
    .update(signedValue)
    .digest('base64')
}
