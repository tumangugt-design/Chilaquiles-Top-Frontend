
import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import OTPModal from '../components/ui/OTPModal.jsx'
import {
  signUpClient,
  confirmClientSignUp,
  loginClient,
  resendClientConfirmationCode,
  normalizeGtPhone,
  toGtLocalDigits,
} from '../shared/config/cognito.js'
import { authClientSync, setClientToken } from '../shared/config/api.js'
import toast from 'react-hot-toast'

const DEFAULT_PASSWORD_HINT = 'Usa al menos 8 caracteres.'

const getFriendlyError = (error) => {
  const message = error?.message || ''
  if (message.includes('UsernameExistsException')) return 'Este número ya está registrado. Inicia sesión.'
  if (message.includes('UserNotFoundException')) return 'No encontramos una cuenta con ese número.'
  if (message.includes('CodeMismatchException')) return 'El código ingresado no es correcto.'
  if (message.includes('ExpiredCodeException')) return 'El código expiró. Solicita uno nuevo.'
  if (message.includes('NotAuthorizedException')) return 'Número o contraseña incorrectos.'
  if (message.includes('UserNotConfirmedException')) return 'Debes confirmar el código SMS antes de ingresar.'
  if (message.includes('InvalidPasswordException')) return 'La contraseña no cumple con los requisitos.'
  if (message.includes('USER_PASSWORD_AUTH')) return 'Debes habilitar USER_PASSWORD_AUTH en el App Client de Cognito.'
  return message || 'No se pudo completar la autenticación.'
}

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)
  const [step, setStep] = useState('welcome')
  const [authMode, setAuthMode] = useState('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)

  const cleanDigits = toGtLocalDigits(phone)

  const syncClientProfile = async (normalizedPhone) => {
    const response = await authClientSync({ phone: normalizedPhone })
    return response?.data?.user || null
  }

  const completeClientSession = async (normalizedPhone, authResult) => {
    const accessToken = authResult?.AuthenticationResult?.AccessToken
    if (!accessToken) {
      throw new Error('No se recibió el token de acceso desde Cognito.')
    }

    setClientToken(accessToken)
    await syncClientProfile(normalizedPhone)
    toast.success('¡Número validado correctamente!')
    onConfirm(normalizedPhone)
  }

  const handleLogin = async () => {
    if (cleanDigits.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    if (password.length < 8) {
      toast.error(DEFAULT_PASSWORD_HINT)
      return
    }

    setIsLoading(true)
    try {
      const normalizedPhone = normalizeGtPhone(phone)
      const result = await loginClient({ phone: normalizedPhone, password })
      await completeClientSession(normalizedPhone, result)
    } catch (authError) {
      toast.error(getFriendlyError(authError))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (cleanDigits.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    if (password.length < 8) {
      toast.error(DEFAULT_PASSWORD_HINT)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      await signUpClient({ phone, password })
      setShowOTPModal(true)
      toast.success('Te enviamos un código SMS para confirmar tu cuenta.')
    } catch (authError) {
      toast.error(getFriendlyError(authError))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (code) => {
    setIsLoading(true)
    try {
      const normalizedPhone = normalizeGtPhone(phone)
      await confirmClientSignUp({ phone: normalizedPhone, code })
      const result = await loginClient({ phone: normalizedPhone, password })
      setShowOTPModal(false)
      await completeClientSession(normalizedPhone, result)
    } catch (authError) {
      toast.error(getFriendlyError(authError))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await resendClientConfirmationCode({ phone })
      toast.success('Te reenviamos el código SMS.')
    } catch (authError) {
      toast.error(getFriendlyError(authError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-8">
        <div className="w-48 h-32 mx-auto mb-2 relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <Logo className="w-full h-full" />
        </div>

        {step === 'welcome' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {error ? 'Ubicación no disponible' : '¿Estás en Villa Nueva?'}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {error
                ? 'Por el momento nuestro servicio es exclusivo para residentes y visitantes dentro de Villa Nueva.'
                : 'Validaremos tu cuenta de cliente con AWS Cognito antes de iniciar tu pedido.'}
            </p>
          </>
        )}

        {step === 'auth' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {authMode === 'login' ? 'Ingresa con tu número' : 'Crea tu cuenta de cliente'}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {authMode === 'login'
                ? 'Usa tu número de teléfono y contraseña para continuar.'
                : 'Te enviaremos un código SMS para confirmar tu número en Cognito.'}
            </p>
          </>
        )}
      </div>

      {step === 'welcome' && !error && (
        <div className="space-y-4">
          <Button fullWidth onClick={() => setStep('auth')} variant="primary" className="text-lg">
            Sí, estoy aquí
          </Button>
          <button
            onClick={() => setError(true)}
            className="block w-full py-3 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
          >
            No, cambiar ubicación
          </button>
        </div>
      )}

      {step === 'welcome' && error && (
        <div className="space-y-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-4">
            Lo sentimos, no podemos procesar tu pedido fuera del área de cobertura.
          </div>
          <Button variant="secondary" fullWidth onClick={() => setError(false)}>
            Volver a intentar
          </Button>
        </div>
      )}

      {step === 'auth' && (
        <div className="space-y-5">
          <div className="flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-black transition-all ${authMode === 'login' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500'}`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-black transition-all ${authMode === 'signup' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500'}`}
            >
              Registrarme
            </button>
          </div>

          <div className="text-left">
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Número de teléfono</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 px-3 py-3.5 rounded-xl border border-gray-200">
                <span className="text-sm font-bold text-gray-600">🇬🇹 +502</span>
              </div>
              <input
                type="tel"
                value={cleanDigits}
                onChange={(e) => setPhone(toGtLocalDigits(e.target.value))}
                placeholder="33662977"
                maxLength={8}
                inputMode="numeric"
                autoFocus
                className="flex-1 p-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-lg font-bold tracking-wider"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-base font-bold"
            />
            <p className="mt-2 text-xs font-semibold text-gray-400">{DEFAULT_PASSWORD_HINT}</p>
          </div>

          {authMode === 'signup' && (
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="w-full p-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-base font-bold"
              />
            </div>
          )}

          <Button
            fullWidth
            onClick={authMode === 'login' ? handleLogin : handleRegister}
            disabled={cleanDigits.length !== 8 || password.length < 8 || isLoading}
            className="text-lg"
          >
            {isLoading
              ? authMode === 'login' ? 'Ingresando...' : 'Creando cuenta...'
              : authMode === 'login' ? 'Ingresar →' : 'Crear cuenta →'}
          </Button>

          <button
            onClick={() => {
              setStep('welcome')
              setPhone('')
              setPassword('')
              setConfirmPassword('')
            }}
            className="block w-full py-2 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
          >
            ← Volver
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-400">Servicio activo en zona</span>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyCode}
        onResend={handleResend}
        isSending={isLoading}
        phone={cleanDigits}
      />
    </div>
  )
}

export default LocationPage
