import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import OTPModal from '../components/ui/OTPModal.jsx'
import {
  signUpClient,
  confirmClientSignUp,
  loginClient,
  resendClientConfirmationCode,
  sendExistingClientOtp,
  confirmExistingClientOtp,
  normalizeGtPhone,
  toGtLocalDigits,
} from '../shared/config/cognito.js'
import { authClientSync, clearClientToken, setClientToken } from '../shared/config/api.js'
import toast from 'react-hot-toast'

const getFriendlyError = (error) => {
  const message = error?.message || ''
  if (message.includes('UsernameExistsException')) return 'Este número ya existe. Te enviaremos un código SMS para continuar.'
  if (message.includes('UserNotFoundException')) return 'No encontramos una cuenta con ese número.'
  if (message.includes('CodeMismatchException')) return 'El código ingresado no es correcto.'
  if (message.includes('ExpiredCodeException')) return 'El código expiró. Solicita uno nuevo.'
  if (message.includes('NotAuthorizedException')) return 'No se pudo validar el acceso con este número.'
  if (message.includes('UserNotConfirmedException')) return 'Tu número aún no ha sido confirmado. Te reenviamos el código SMS.'
  if (message.includes('InvalidPasswordException')) return 'No se pudo preparar la autenticación automática del cliente.'
  if (message.includes('USER_PASSWORD_AUTH')) return 'Debes habilitar USER_PASSWORD_AUTH en el App Client de Cognito.'
  if (message.includes('LimitExceededException')) return 'Has intentado demasiadas veces. Espera un momento e intenta de nuevo.'
  if (message.includes('InvalidParameterException')) return 'No pudimos enviar el SMS a este número. Verifica la configuración del User Pool y del App Client.'
  return message || 'No se pudo completar la autenticación.'
}

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)
  const [step, setStep] = useState('welcome')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpFlow, setOtpFlow] = useState('signup')

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

    clearClientToken()
    setClientToken(accessToken)
    await syncClientProfile(normalizedPhone)
    toast.success('¡Número validado correctamente!')
    onConfirm(normalizedPhone)
  }

  const openOtpModal = (flow, successMessage) => {
    setOtpFlow(flow)
    setShowOTPModal(true)
    toast.success(successMessage)
  }

  const handleSendCode = async () => {
    if (cleanDigits.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    setIsLoading(true)
    try {
      const normalizedPhone = normalizeGtPhone(phone)

      try {
        await signUpClient({ phone: normalizedPhone })
        openOtpModal('signup', 'Te enviamos un código SMS para validar tu número.')
        return
      } catch (signUpError) {
        const signUpMessage = signUpError?.message || ''

        if (signUpMessage.includes('UsernameExistsException')) {
          try {
            await sendExistingClientOtp({ phone: normalizedPhone })
            openOtpModal('existing-user', 'Te enviamos un código SMS para continuar.')
            return
          } catch (existingUserError) {
            const existingMessage = existingUserError?.message || ''
            if (existingMessage.includes('UserNotConfirmedException')) {
              await resendClientConfirmationCode({ phone: normalizedPhone })
              openOtpModal('signup', 'Reenviamos el código SMS para validar tu número.')
              return
            }
            throw existingUserError
          }
        }

        throw signUpError
      }
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

      if (otpFlow === 'signup') {
        await confirmClientSignUp({ phone: normalizedPhone, code })
      } else {
        await confirmExistingClientOtp({ phone: normalizedPhone, code })
      }

      const result = await loginClient({ phone: normalizedPhone })
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
      const normalizedPhone = normalizeGtPhone(phone)
      if (otpFlow === 'signup') {
        await resendClientConfirmationCode({ phone: normalizedPhone })
      } else {
        await sendExistingClientOtp({ phone: normalizedPhone })
      }
      toast.success('Te reenviamos el código SMS.')
    } catch (authError) {
      toast.error(getFriendlyError(authError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-ui-card rounded-3xl p-6 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up border border-ui-border transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-4 sm:mb-8">
        <div className="w-32 h-24 sm:w-48 sm:h-32 mx-auto mb-2 relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-blue/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <Logo className="w-full h-full drop-shadow-md" />
        </div>

        {step === 'welcome' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-3 tracking-tight">
              {error ? 'Ubicación no disponible' : '¿Estás en Villa Nueva?'}
            </h2>
            <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
              {error
                ? 'Por el momento nuestro servicio es exclusivo para residentes y visitantes dentro de Villa Nueva.'
                : 'Validaremos tu número de teléfono por SMS antes de iniciar tu pedido.'}
            </p>
          </>
        )}

        {step === 'auth' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3 tracking-tight">
              Verifica tu número
            </h2>
            <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
              Ingresa tu número y te enviaremos un código SMS para continuar con tu pedido.
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
            className="block w-full py-3 text-ui-muted text-sm font-semibold hover:text-ui-text transition-colors"
          >
            No, cambiar ubicación
          </button>
        </div>
      )}

      {step === 'welcome' && error && (
        <div className="space-y-4">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-medium mb-4 border border-red-500/20">
            Lo sentimos, no podemos procesar tu pedido fuera del área de cobertura.
          </div>
          <Button variant="secondary" fullWidth onClick={() => setError(false)}>
            Volver a intentar
          </Button>
        </div>
      )}

      {step === 'auth' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="text-left">
            <label className="block text-sm font-bold text-ui-text mb-2 ml-1">Número de teléfono</label>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-ui-bg px-2.5 py-3 sm:px-3 sm:py-3.5 rounded-xl border border-ui-border">
                <span className="text-xs sm:text-sm font-bold text-ui-muted">🇬🇹 +502</span>
              </div>
              <input
                type="tel"
                value={cleanDigits}
                onChange={(e) => setPhone(toGtLocalDigits(e.target.value))}
                placeholder="33662977"
                maxLength={8}
                inputMode="numeric"
                autoFocus
                className="flex-1 p-3 sm:p-3.5 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-base sm:text-lg font-bold tracking-wider"
              />
            </div>
            <p className="mt-2 text-[10px] sm:text-xs font-semibold text-ui-muted">Te llegará un código por SMS para validar el número.</p>
          </div>

          <Button
            fullWidth
            onClick={handleSendCode}
            disabled={cleanDigits.length !== 8 || isLoading}
            className="text-base sm:text-lg"
          >
            {isLoading ? 'Enviando código...' : 'Enviar código SMS →'}
          </Button>

          <button
            onClick={() => {
              setStep('welcome')
              setPhone('')
            }}
            className="block w-full py-2 text-ui-muted text-sm font-semibold hover:text-ui-text transition-colors"
          >
            ← Volver
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-ui-border/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
          <span className="text-[10px] sm:text-xs font-semibold text-ui-muted">Servicio activo en zona</span>
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
