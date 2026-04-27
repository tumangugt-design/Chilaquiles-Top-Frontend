import { useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import toast from 'react-hot-toast'

const VERIFIED_PHONE_KEY = 'chilaquiles_verified_phone'
const VERIFIED_PHONE_LOCAL_KEY = 'chilaquiles_verified_phone_local'

const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 8) return `+502${digits}`
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`
  return `+502${digits.slice(0, 8)}`
}

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('502')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

const OTPView = ({ code, setCode, onVerify, onBack, phone, isLoading }) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3 tracking-tight">
          Ingresa tu código
        </h2>
        <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
          Escribe el código enviado al número <span className="font-black text-ui-text">+502 {phone}</span>.
        </p>
      </div>

      <div className="text-left">
        <label className="block text-sm font-bold text-ui-text mb-2 ml-1">Código de verificación</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(String(e.target.value).replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          maxLength={6}
          inputMode="numeric"
          autoFocus
          className="w-full p-3 sm:p-3.5 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-base sm:text-lg font-bold tracking-[0.3em] text-center"
        />
        <p className="mt-2 text-[10px] sm:text-xs font-semibold text-ui-muted">
          Vista visual temporal. Aquí luego conectarás WhatsApp.
        </p>
      </div>

      <Button
        fullWidth
        onClick={onVerify}
        disabled={code.length < 4 || isLoading}
        className="text-base sm:text-lg"
      >
        {isLoading ? 'Verificando...' : 'Verificar código →'}
      </Button>

      <button
        onClick={onBack}
        className="block w-full py-2 text-ui-muted text-sm font-semibold hover:text-ui-text transition-colors"
      >
        ← Volver
      </button>
    </div>
  )
}

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)
  const [step, setStep] = useState('welcome')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const cleanDigits = useMemo(() => toGtLocalDigits(phone), [phone])

  const handleSendCode = () => {
    if (cleanDigits.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    setIsLoading(true)

    window.setTimeout(() => {
      setIsLoading(false)
      setStep('otp')
      toast.success('Código enviado.')
    }, 500)
  }

  const handleVerifyCode = () => {
    if (code.length < 4) {
      toast.error('Ingresa un código válido.')
      return
    }

    setIsLoading(true)

    window.setTimeout(() => {
      const normalizedPhone = normalizeGtPhone(cleanDigits)

      sessionStorage.setItem(VERIFIED_PHONE_KEY, normalizedPhone)
      sessionStorage.setItem(VERIFIED_PHONE_LOCAL_KEY, cleanDigits)

      setIsLoading(false)
      toast.success('Número verificado correctamente.')

      if (typeof onConfirm === 'function') {
        onConfirm({
          phone: normalizedPhone,
          phoneLocal: cleanDigits,
          phoneVerified: true,
        })
      }
    }, 400)
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
                : 'Arma tu orden y completa tus datos al final.'}
            </p>
          </>
        )}

        {step === 'auth' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3 tracking-tight">
              Verifica tu número
            </h2>
            <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
              Ingresa tu número y te enviaremos un código para continuar con tu pedido.
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

            <p className="mt-2 text-[10px] sm:text-xs font-semibold text-ui-muted">
              Te llegará un código para validar el número.
            </p>
          </div>

          <Button
            fullWidth
            onClick={handleSendCode}
            disabled={cleanDigits.length !== 8 || isLoading}
            className="text-base sm:text-lg"
          >
            {isLoading ? 'Enviando código...' : 'Enviar código →'}
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

      {step === 'otp' && (
        <OTPView
          code={code}
          setCode={setCode}
          onVerify={handleVerifyCode}
          onBack={() => setStep('auth')}
          phone={cleanDigits}
          isLoading={isLoading}
        />
      )}

      <div className="mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-ui-border/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
          <span className="text-[10px] sm:text-xs font-semibold text-ui-muted">Servicio activo en zona</span>
        </div>
      </div>
    </div>
  )
}

export default LocationPage
