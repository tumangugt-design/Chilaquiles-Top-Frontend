
const REGION = import.meta.env.VITE_COGNITO_REGION || 'us-east-1'
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '6vh1hbmm6k3dqas213627qbsm6'
const ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`

const request = async (target, payload) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || data?.Message || data?.__type || `Error en ${target}`
    const error = new Error(message)
    error.code = data?.__type || data?.name || null
    throw error
  }

  return data
}

export const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 8) return `+502${digits}`
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`
  if (digits.startsWith('+502') && digits.replace(/\D/g, '').length === 11) return raw
  throw new Error('Ingresa un número de Guatemala de 8 dígitos.')
}

export const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('502')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

export const signUpClient = async ({ phone, password }) => {
  const normalizedPhone = normalizeGtPhone(phone)
  return request('SignUp', {
    ClientId: CLIENT_ID,
    Username: normalizedPhone,
    Password: password,
    UserAttributes: [{ Name: 'phone_number', Value: normalizedPhone }],
  })
}

export const confirmClientSignUp = async ({ phone, code }) => {
  const normalizedPhone = normalizeGtPhone(phone)
  return request('ConfirmSignUp', {
    ClientId: CLIENT_ID,
    Username: normalizedPhone,
    ConfirmationCode: code,
  })
}

export const resendClientConfirmationCode = async ({ phone }) => {
  const normalizedPhone = normalizeGtPhone(phone)
  return request('ResendConfirmationCode', {
    ClientId: CLIENT_ID,
    Username: normalizedPhone,
  })
}

export const loginClient = async ({ phone, password }) => {
  const normalizedPhone = normalizeGtPhone(phone)
  return request('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: normalizedPhone,
      PASSWORD: password,
    },
  })
}
