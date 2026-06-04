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
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] bg-[#00083a] p-3 sm:p-5 shadow-[0_0_50px_rgba(0,0,255,0.15)] border border-brand-blue/30 flex flex-col gap-4 animate-scale-up"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="absolute right-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-black text-brand-blue shadow-lg transition hover:scale-105 hover:bg-slate-100"
            aria-label="Cerrar menú"
          >
            ×
          </button>

          {/* Book Spine Fold Divider (Desktop only) */}
          <div className="absolute inset-y-0 left-1/2 w-1.5 bg-gradient-to-r from-black/20 via-black/45 to-black/20 -ml-[3px] hidden md:block z-20 pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-[2rem] p-5 sm:p-8 relative overflow-hidden select-none border-4 border-brand-blue/10">
            {/* Elegant Background Corner Ornaments or Thin Inner Borders */}
            <div className="absolute inset-3 border border-brand-blue/5 rounded-[1.6rem] pointer-events-none" />
            
            {/* LEFT PAGE: BRANDING & PRICES */}
            <div className="space-y-6 relative z-10 pr-2 md:border-r border-dashed border-slate-200 md:pr-6">
              <div className="text-center space-y-2 mt-4">
                <span className="text-[10px] font-black uppercase text-brand-orange tracking-[0.25em]">Est. 2026</span>
                <div className="inline-block border-y-2 border-brand-blue/15 py-1.5 px-4 w-full">
                  <h3 className="font-extrabold text-2xl sm:text-3xl tracking-[0.12em] text-brand-blue uppercase font-serif">
                    CHILAQUILES TOP
                  </h3>
                </div>
                <p className="text-[10px] font-black tracking-widest text-brand-orange uppercase italic">BEST IN TOWN</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-600 font-sans font-medium italic px-2">
                  “Los chilaquiles son una receta tradicional mexicana preparada a base de crujientes totopos (tortillas fritas en porciones perfectas) bañados en salsas calientes de sabor único, espolvoreados con queso y acompañados de tu proteína favorita.”
                </p>

                {/* Best in town Seal & 100% Auténtico */}
                <div className="flex items-center justify-center gap-4 bg-brand-blue/5 py-4 px-5 rounded-2xl border border-brand-blue/10">
                  <svg className="w-16 h-16 shrink-0 filter drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#0000ff" />
                    <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                    <path id="textPathMenu" d="M 16,50 A 34,34 0 1,1 84,50 A 34,34 0 1,1 16,50" fill="none" />
                    <text fill="#ffffff" fontSize="6.8" fontWeight="900" letterSpacing="0.8">
                      <textPath href="#textPathMenu" startOffset="50%" textAnchor="middle">
                        * BEST IN TOWN * CHILAQUILES
                      </textPath>
                    </text>
                    <text x="50" y="56" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">TOP</text>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-900">Sabor 100% Auténtico</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">Elaborados diariamente con ingredientes frescos seleccionados en cocina.</p>
                  </div>
                </div>

                {/* Pricing layout */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange text-center">Nuestros Precios</h4>
                  <div className="space-y-2">
                    {[
                      { label: '1 Plato Individual', price: 'Q50', desc: 'Porción perfecta para iniciar tu antojo.' },
                      { label: '2 Platos en Pareja', price: 'Q90', desc: 'La mejor opción para compartir un momento.' },
                      { label: '3 Platos Ahorro TOP', price: 'Q120', desc: 'Ideal para grupos grandes o mucha hambre.' }
                    ].map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                        <div className="text-left pr-4">
                          <p className="text-xs font-black text-slate-800 uppercase">{p.label}</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">{p.desc}</p>
                        </div>
                        <span className="text-lg sm:text-xl font-black text-brand-blue tracking-tight">{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PAGE: THE PLATE AND CUSTOMIZATIONS */}
            <div className="space-y-6 relative z-10 pl-2 md:pl-6 pt-4 md:pt-0">
              <div className="text-center space-y-2 mt-2">
                <span className="text-[10px] font-black uppercase text-brand-orange tracking-[0.25em]">Personalización</span>
                <h4 className="font-serif font-black text-lg text-brand-blue uppercase tracking-widest border-b border-slate-200 pb-2">
                  Arma Tu Plato
                </h4>
              </div>

              {/* Stylized SVG Plate of Chilaquiles */}
              <div className="flex justify-center py-1">
                <div className="relative p-2 bg-brand-blue/5 rounded-3xl border border-brand-blue/10 flex items-center justify-center shrink-0 w-36 h-28">
                  <svg className="w-full h-full shrink-0" viewBox="0 0 120 100" fill="none">
                    <ellipse cx="60" cy="65" rx="50" ry="25" fill="#e2e8f0" />
                    <ellipse cx="60" cy="63" rx="46" ry="22" fill="#ffffff" stroke="#0000ff" strokeWidth="2.5" />
                    {/* Totopos */}
                    <polygon points="35,60 55,45 50,65" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1" />
                    <polygon points="50,60 70,40 65,65" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1" />
                    <polygon points="65,60 85,45 80,65" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1" />
                    <polygon points="42,65 62,50 58,70" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1" />
                    <polygon points="58,65 78,50 74,70" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1" />
                    {/* Salsa */}
                    <path d="M 40,55 Q 50,48 60,52 T 80,50 Q 82,58 75,62 T 45,60 Z" fill="#e53e3e" opacity="0.85" />
                    {/* Pollo */}
                    <circle cx="50" cy="58" r="2.5" fill="#f7fafc" />
                    <circle cx="62" cy="56" r="2" fill="#f7fafc" />
                    <circle cx="70" cy="59" r="2.5" fill="#f7fafc" />
                    {/* Queso/Cilantro */}
                    <path d="M 42,54 L 46,56 M 58,52 L 60,55 M 68,51 L 70,54" stroke="#ecc94b" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 45,58 L 47,59 M 55,59 L 56,61 M 65,58 L 67,60" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Crema */}
                    <path d="M 38,62 Q 55,56 78,59" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      num: '1',
                      title: 'Salsa',
                      items: 'Salsa Roja (tomate no picante), Salsa Verde (miltomate no picante) o Divorciados (mitad y mitad).'
                    },
                    {
                      num: '2',
                      title: 'Proteína',
                      items: 'Steak de res asado en tiras, pechuga de pollo deshebrada o chorizo argentino aromático.'
                    },
                    {
                      num: '3',
                      title: 'Complemento',
                      items: 'Aguacate hass, queso mozzarella extra o cebolla caramelizada cocida a fuego lento.'
                    }
                  ].map((col, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-left space-y-1">
                      <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
                        <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-black flex items-center justify-center font-sans">{col.num}</span>
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-800">{col.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">{col.items}</p>
                    </div>
                  ))}
                </div>

                {/* Note about CCC */}
                <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-xl p-3.5 text-center mt-2 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-orange">
                    🥛 CCC Incluido por defecto
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium leading-normal mt-0.5">
                    Todos nuestros platos incluyen Crema, Cebolla blanca cruda y Cilantro fresco. Podrás desmarcar cualquiera de ellos en el paso de "Receta Base".
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active promotions list at the bottom of the booklet */}
          {promotions.filter(p => p.imageUrl).length > 0 && (
            <div className="px-3 sm:px-5 pb-3">
              <span className="text-[10px] font-black uppercase text-white/80 tracking-widest block text-center mb-3">🎁 Promociones Especiales</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {promotions.filter(p => p.imageUrl).map((promo) => (
                  <button
                    key={promo.id}
                    type="button"
                    onClick={() => applyPromotion(promo)}
                    className="block w-full text-left transition hover:scale-[1.02] focus:outline-none rounded-xl overflow-hidden shadow-md border border-brand-blue/20 relative group bg-black"
                    aria-label={`Pedir promoción ${promo.name || ''}`.trim()}
                  >
                    <img
                      src={promo.imageUrl}
                      alt={promo.name || 'Promoción Chilaquiles TOP'}
                      className="w-full h-24 object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                      <p className="text-[9px] font-black text-brand-orange uppercase tracking-widest leading-none">Pedir ahora</p>
                      <h4 className="text-white text-xs font-black uppercase truncate mt-1 leading-tight">{promo.name}</h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
}

export default LocationPage
