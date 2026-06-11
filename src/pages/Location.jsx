import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import toast from 'react-hot-toast'
import { getAvailablePlates, getOperatingHours, sendOtp, verifyOtp, getPromotions } from '../shared/config/api.js'
import menuImage from '../assets/menu_chilaquiles_top.png'

const VERIFIED_PHONE_KEY = 'chilaquiles_verified_phone'
const VERIFIED_PHONE_LOCAL_KEY = 'chilaquiles_verified_phone_local'

const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 8) return `+502${digits}`
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`
  return `+502${digits.slice(0, 8)}`
}


const formatHour = (value = '') => {
  const [rawHour, rawMinute] = String(value || '').split(':').map(Number)
  if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return value
  const suffix = rawHour >= 12 ? 'PM' : 'AM'
  const hour = rawHour % 12 || 12
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`
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

const LocationPage = ({ onConfirm, onApplyPromo }) => {
  const [error, setError] = useState(false)
  const [availableCount, setAvailableCount] = useState(null)
  const [step, setStep] = useState('welcome')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hours, setHours] = useState({ isOpen: true, isCurrentlyOpen: true, openTime: '08:00', closeTime: '17:00' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [promotions, setPromotions] = useState([])

  const cleanDigits = useMemo(() => toGtLocalDigits(phone), [phone])

  const nextOpenText = useMemo(() => {
    if (!hours) return ''
    const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    // Get current date/time in Guatemala (UTC-6)
    const now = new Date()
    const gtTime = new Date(now.getTime() - 6 * 60 * 60 * 1000)
    
    const currentMinutes = gtTime.getUTCHours() * 60 + gtTime.getUTCMinutes()

    const toMinutes = (timeStr) => {
      if (!timeStr) return null
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }

    const getScheduleForOffset = (offset) => {
      const checkDate = new Date(gtTime.getTime() + offset * 24 * 60 * 60 * 1000)
      const checkDateStr = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, '0')}-${String(checkDate.getUTCDate()).padStart(2, '0')}`
      const checkDayOfWeek = checkDate.getUTCDay()
      const dayKey = DAY_KEYS[checkDayOfWeek]

      let schedule = null

      // 1. Check special dates (exceptions)
      if (hours.specialDates && hours.specialDates[checkDateStr]) {
        schedule = hours.specialDates[checkDateStr]
      }

      // 2. Check date ranges
      if (!schedule && hours.dateRanges && Array.isArray(hours.dateRanges)) {
        const activeRange = hours.dateRanges.find(r => checkDateStr >= r.start && checkDateStr <= r.end)
        if (activeRange) {
          schedule = activeRange
        }
      }

      // 3. Check weekly schedule
      if (!schedule && hours.weekly) {
        schedule = hours.weekly[dayKey] || hours.weekly[String(checkDayOfWeek)] || hours.weekly[checkDayOfWeek]
      }

      // 4. Fallback to top-level/default
      if (!schedule) {
        schedule = { isOpen: hours.isOpen !== false, openTime: hours.openTime || '08:00', closeTime: hours.closeTime || '17:00' }
      }

      return {
        isOpen: schedule.isOpen !== false,
        openTime: schedule.openTime || '08:00',
        closeTime: schedule.closeTime || '17:00',
        dayOfWeek: checkDayOfWeek
      }
    }

    for (let i = 0; i < 14; i++) {
      const sched = getScheduleForOffset(i)
      if (sched.isOpen) {
        const openMin = toMinutes(sched.openTime)
        if (i === 0) {
          if (currentMinutes < openMin) {
            return `Abierto hoy de ${formatHour(sched.openTime)} a ${formatHour(sched.closeTime)}`
          }
        } else {
          const prefix = i === 1 ? 'mañana' : `el día ${DAY_NAMES_ES[sched.dayOfWeek]}`
          return `Abierto desde ${prefix} de ${formatHour(sched.openTime)} a ${formatHour(sched.closeTime)}`
        }
      }
    }

    return ''
  }, [hours])

  useEffect(() => {
    let mounted = true
    const loadAvailable = async () => {
      try {
        const [platesResponse, hoursResponse, promosResponse] = await Promise.all([
          getAvailablePlates(),
          getOperatingHours(),
          getPromotions()
        ])
        if (mounted) {
          setAvailableCount(Number(platesResponse.data?.count || 0))
          setHours(hoursResponse.data || { isOpen: true, isCurrentlyOpen: true, openTime: '08:00', closeTime: '17:00' })
          
          const now = new Date()
          const gtTime = new Date(now.getTime() - 6 * 60 * 60 * 1000)
          const currentDateStr = `${gtTime.getUTCFullYear()}-${String(gtTime.getUTCMonth() + 1).padStart(2, '0')}-${String(gtTime.getUTCDate()).padStart(2, '0')}`

          const activePromos = (promosResponse.data || []).filter(p => {
            if (!p.isActive) return false
            if (p.startDate && currentDateStr < p.startDate) return false
            if (p.endDate && currentDateStr > p.endDate) return false
            return true
          })
          setPromotions(activePromos)
        }
      } catch {
        if (mounted) setAvailableCount(0)
      }
    }
    loadAvailable()
    const interval = setInterval(loadAvailable, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const handleSendCode = async () => {
    if (!hours.isCurrentlyOpen) {
      toast.error('Estamos cerrados por el momento. Vuelve más tarde.')
      return
    }

    if (availableCount === 0) {
      toast.error('No hay platos disponibles por el momento. Vuelve en otro momento.')
      return
    }

    if (cleanDigits.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    setIsLoading(true)
    const normalizedPhone = normalizeGtPhone(cleanDigits)

    try {
      await sendOtp(normalizedPhone)
      setStep('otp')
      toast.success('Código enviado por WhatsApp.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length < 4) {
      toast.error('Ingresa un código válido.')
      return
    }

    setIsLoading(true)
    const normalizedPhone = normalizeGtPhone(cleanDigits)

    try {
      const response = await verifyOtp(normalizedPhone, code)
      const savedCustomer = response.data?.customer || null

      sessionStorage.setItem(VERIFIED_PHONE_KEY, normalizedPhone)
      sessionStorage.setItem(VERIFIED_PHONE_LOCAL_KEY, cleanDigits)

      toast.success(savedCustomer?.name || savedCustomer?.address
        ? 'Número verificado. Se llenarán tus datos guardados.'
        : 'Número verificado correctamente.'
      )

      if (typeof onConfirm === 'function') {
        onConfirm({
          phone: normalizedPhone,
          phoneLocal: cleanDigits,
          phoneVerified: true,
          customer: savedCustomer
            ? {
                name: savedCustomer.name || '',
                address: savedCustomer.address || '',
                accessCode: savedCustomer.accessCode || '',
              }
            : null,
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Código incorrecto')
    } finally {
      setIsLoading(false)
    }
  }

  const applyPromotion = (promo) => {
    if (typeof onApplyPromo === 'function') {
      onApplyPromo(promo)
      toast.success(`Promoción aplicada: ${promo.name}`)
    }
    setIsMenuOpen(false)
    setStep('auth')
  }

  return (
    <>
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
            {!error && (
              hours.isCurrentlyOpen ? (
                <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Abierto hoy</p>
                  {hours.openTime && hours.closeTime && (
                    <p className="text-sm font-black text-green-700">Horario: {formatHour(hours.openTime)} - {formatHour(hours.closeTime)}</p>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Cerrado</p>
                  {nextOpenText ? (
                    <p className="text-sm font-black text-red-700">{nextOpenText}</p>
                  ) : hours.openTime && hours.closeTime ? (
                    <p className="text-sm font-black text-red-700">Horario: {formatHour(hours.openTime)} - {formatHour(hours.closeTime)}</p>
                  ) : (
                    <p className="text-sm font-black text-red-700">Vuelve más tarde.</p>
                  )}
                </div>
              )
            )}
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
            {availableCount === 0 && hours.isCurrentlyOpen && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">
                No hay platos disponibles por el momento. Vuelve en otro momento.
              </div>
            )}
          </>
        )}
      </div>

      {step === 'welcome' && !error && (
        <div className="space-y-4">
          <Button fullWidth type="button" onClick={() => { setIsMenuOpen(true); }} variant="secondary" className="text-lg !border-brand-blue/30 !text-brand-blue !bg-brand-blue/5">
            Ver menú
          </Button>

          <Button fullWidth onClick={() => { setStep('auth'); }} variant="primary" className="text-lg" disabled={!hours.isCurrentlyOpen}>
            {hours.isCurrentlyOpen ? 'Sí, estoy aquí' : 'Cerrado'}
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
              Te llegará un código por WhatsApp para validar tu número.
            </p>
          </div>

          <Button
            fullWidth
            onClick={handleSendCode}
            disabled={cleanDigits.length !== 8 || isLoading || availableCount === 0 || !hours.isCurrentlyOpen}
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

    {isMenuOpen && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-ui-card p-4 sm:p-6 shadow-2xl border border-ui-border flex flex-col items-center gap-6"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg text-2xl font-black text-ui-text shadow-lg transition hover:scale-105"
            aria-label="Cerrar menú"
          >
            ×
          </button>

          <h3 className="text-xl font-extrabold text-ui-text border-b border-ui-border pb-2 w-full text-center mt-2">
            📖 Menú y Promociones
          </h3>

          <div className="w-full space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-ui-muted tracking-widest block text-center">Menú Principal</span>
              <img
                src={menuImage}
                alt="Menú Chilaquiles TOP"
                className="w-full h-auto rounded-2xl object-contain shadow-sm border border-ui-border"
              />
            </div>

            {promotions.filter(p => p.imageUrl).map((promo) => (
              <button
                key={promo.id}
                type="button"
                onClick={() => applyPromotion(promo)}
                className="block w-full border-t border-ui-border pt-6 text-left transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-ui-card rounded-2xl group pb-2"
                aria-label={`Pedir promoción ${promo.name || ''}`.trim()}
              >
                <div className="relative">
                  <img
                    src={promo.imageUrl}
                    alt={promo.name || 'Promoción Chilaquiles TOP'}
                    className="w-full h-auto rounded-2xl object-contain shadow-md border border-brand-orange/30"
                  />
                  {promo.marketing && (
                    <div className="mt-3 bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 p-4 rounded-xl border border-brand-orange/20 shadow-sm">
                      <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">{promo.marketing}</p>
                      <p className="text-brand-orange font-black text-xs uppercase mt-3 tracking-widest text-center">👉 ¡Ordenar Promo Ahora!</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default LocationPage
