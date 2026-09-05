import { useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import { createOrder } from '../shared/config/api.js'
import toast from 'react-hot-toast'
import { calculateTotal } from '../shared/constants/index.jsx'

const VERIFIED_PHONE_KEY = 'chilaquiles_verified_phone'
const VERIFIED_PHONE_LOCAL_KEY = 'chilaquiles_verified_phone_local'

const GT_LOCATION_PRESETS = {
  'zona 1': { lat: 14.6416, lng: -90.5133 },
  'zona 2': { lat: 14.6575, lng: -90.5150 },
  'zona 3': { lat: 14.6398, lng: -90.5308 },
  'zona 4': { lat: 14.6208, lng: -90.5154 },
  'zona 5': { lat: 14.6247, lng: -90.4934 },
  'zona 6': { lat: 14.6652, lng: -90.4990 },
  'zona 7': { lat: 14.6361, lng: -90.5585 },
  'zona 8': { lat: 14.6098, lng: -90.5268 },
  'zona 9': { lat: 14.6046, lng: -90.5162 },
  'zona 10': { lat: 14.5929, lng: -90.5070 },
  'zona 11': { lat: 14.5996, lng: -90.5523 },
  'zona 12': { lat: 14.5808, lng: -90.5488 },
  'zona 13': { lat: 14.5844, lng: -90.5274 },
  'zona 14': { lat: 14.5843, lng: -90.5047 },
  'zona 15': { lat: 14.6026, lng: -90.4858 },
  'zona 16': { lat: 14.6191, lng: -90.4627 },
  'zona 17': { lat: 14.6399, lng: -90.4704 },
  'zona 18': { lat: 14.6810, lng: -90.4717 },
  'zona 19': { lat: 14.6470, lng: -90.5747 },
  'zona 21': { lat: 14.5590, lng: -90.5593 },
  'villa nueva': { lat: 14.5251, lng: -90.5875 },
  'san miguel petapa': { lat: 14.5018, lng: -90.5610 },
  'mixco': { lat: 14.6333, lng: -90.6064 },
}

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('502')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

const normalizeGtPhone = (raw = '') => {
  const digits = toGtLocalDigits(raw)
  return digits ? `+502${digits}` : ''
}

const parseCoordinates = (raw = '') => {
  const match = String(raw).trim().match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

const normalizeSearchKey = (raw = '') => String(raw).trim().toLowerCase().replace(/\s+/g, ' ')

const ZONA_6_VILLA_NUEVA_BOUNDS = {
  // Cobertura real de Zona 6 de Villa Nueva con margen para errores normales de GPS móvil.
  // La validación anterior era demasiado cerrada y rechazaba puntos válidos cercanos a 6a/8a/11 avenida.
  minLat: 14.50000,
  maxLat: 14.56500,
  minLng: -90.62000,
  maxLng: -90.53500,
}

const ZONA_6_VILLA_NUEVA_CENTER = { lat: 14.53280, lng: -90.58420 }
const ZONA_6_VILLA_NUEVA_RADIUS_KM = 5.2

const getDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371
  const toRad = (value) => (value * Math.PI) / 180
  const dLat = toRad(pointB.lat - pointA.lat)
  const dLng = toRad(pointB.lng - pointA.lng)
  const lat1 = toRad(pointA.lat)
  const lat2 = toRad(pointB.lat)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const isInsideZona6VillaNueva = (location) => {
  const lat = Number(location?.lat)
  const lng = Number(location?.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return false

  const insideBounds =
    lat >= ZONA_6_VILLA_NUEVA_BOUNDS.minLat &&
    lat <= ZONA_6_VILLA_NUEVA_BOUNDS.maxLat &&
    lng >= ZONA_6_VILLA_NUEVA_BOUNDS.minLng &&
    lng <= ZONA_6_VILLA_NUEVA_BOUNDS.maxLng

  const insideRadius =
    getDistanceKm({ lat, lng }, ZONA_6_VILLA_NUEVA_CENTER) <= ZONA_6_VILLA_NUEVA_RADIUS_KM

  return insideBounds && insideRadius
}

const CUSTOMER_COVERAGE_QUERY = 'Zona 6 de Villa Nueva, Villa Nueva, Guatemala'

const getGoogleMapsEmbedUrl = (query = 'Guatemala') =>
  `https://www.google.com/maps?q=${encodeURIComponent(query || 'Guatemala')}&output=embed`

const LocationPreview = ({ location, query }) => {
  const mapQuery = location?.lat && location?.lng ? `${location.lat},${location.lng}` : query || 'Guatemala'
  return (
    <div className="rounded-2xl overflow-hidden border border-ui-border bg-ui-bg shadow-sm">
      <iframe
        title="Google Maps"
        src={getGoogleMapsEmbedUrl(mapQuery)}
        className="w-full h-56 sm:h-64 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

const CustomerPage = ({ order, updateOrder, setLastOrder, onNext, onBack, isInternal = false }) => {
  const storedPhone = isInternal ? (order.customer?.phone || '') : (sessionStorage.getItem(VERIFIED_PHONE_KEY) || order.customer?.phone || '')
  const storedPhoneLocal = isInternal
    ? toGtLocalDigits(order.customer?.phone || '')
    : (sessionStorage.getItem(VERIFIED_PHONE_LOCAL_KEY) || toGtLocalDigits(order.customer?.phone || ''))

  const [localData, setLocalData] = useState({
    name: order.customer?.name || '',
    phone: storedPhoneLocal,
    address: order.customer?.address || '',
    location: order.customer?.location || null,
    accessCode: order.customer?.accessCode || '',
  })
  const promoRequestedCount = (order.appliedPromos || []).reduce((sum, p) => sum + Number(p.requestedCount || p.plates?.length || 2), 0)
  const promoPrice = (order.appliedPromos || []).reduce((sum, p) => sum + Number(p.promoPrice ?? p.price ?? 0), 0)
  const promoIsApplied = Boolean(order.isPromo && order.appliedPromos && order.appliedPromos.length > 0 && promoRequestedCount > 0 && promoPrice > 0)
  const totalItems = !order.requestedCount
    ? 0
    : order.isPromo
      ? (promoIsApplied ? (order.cart.length + 1) : 0)
      : (order.cart.length + 1)
  const grandTotal = !order.requestedCount
    ? 0
    : order.requestedCount === 'PROMO'
      ? (promoIsApplied ? promoPrice : 0)
      : calculateTotal(Math.max(Number(order.requestedCount) || 0, totalItems))
  
  const discountPercent = Number(order.couponDiscountPercent || 0)
  const discountAmount = Math.round((grandTotal * (discountPercent / 100)) * 100) / 100
  const finalTotal = Math.max(0, grandTotal - discountAmount)

  const [paymentMethod, setPaymentMethod] = useState(order.customer?.paymentMethod || 'efectivo')
  const [cashAmountInput, setCashAmountInput] = useState('')
  const [touched, setTouched] = useState({ name: false, address: false })
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [coverageError, setCoverageError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminMapSearch, setAdminMapSearch] = useState('Villa Nueva, Guatemala')
  const [adminCoords, setAdminCoords] = useState(
    localData.location?.lat && localData.location?.lng ? `${localData.location.lat}, ${localData.location.lng}` : ''
  )
  const [mapQuery, setMapQuery] = useState(
    localData.location?.lat && localData.location?.lng ? `${localData.location.lat},${localData.location.lng}` : 'Villa Nueva, Guatemala'
  )

  const hasLocation = useMemo(() => !!localData.location?.lat && !!localData.location?.lng, [localData.location])
  const hasVerifiedPhone = localData.phone.trim().length === 8

  const updateCustomer = (newData) => {
    setLocalData(newData)
    updateOrder({
      customer: {
        ...order.customer,
        ...newData,
        phone: normalizeGtPhone(newData.phone),
      },
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'phone' ? toGtLocalDigits(value) : value
    updateCustomer({ ...localData, [name]: nextValue })
  }

  const setLocation = (location, successMessage = 'Ubicación lista') => {
    setCoverageError('')
    const nextData = { ...localData, location }
    updateCustomer(nextData)
    setAdminCoords(`${location.lat}, ${location.lng}`)
    setMapQuery(`${location.lat},${location.lng}`)
    toast.success(successMessage)
  }

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no permite ubicación.')
      return
    }

    const handleSuccess = (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      if (!isInternal && !isInsideZona6VillaNueva(location)) {
        const nextData = { ...localData, location: null }
        updateCustomer(nextData)
        setCoverageError('Rango fuera de cobertura. Solo atendemos algunas zonas de Villa Nueva y alrededores.')
        toast.error('Cobertura fuera de rango. Solo atendemos algunas zonas de Villa Nueva y alrededores.', { id: 'gps-location' })
        setMapQuery(CUSTOMER_COVERAGE_QUERY)
        setLoadingLoc(false)
        return
      }

      setLocation(location)
      toast.dismiss('gps-location')
      setLoadingLoc(false)
    }

    const handleError = (error, didRetry = false) => {
      if (!didRetry && error?.code !== error?.PERMISSION_DENIED) {
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (retryError) => handleError(retryError, true),
          { enableHighAccuracy: false, timeout: 25000, maximumAge: 10 * 60 * 1000 }
        )
        return
      }

      const message =
        error?.code === error?.PERMISSION_DENIED
          ? 'Activa el permiso de ubicación del navegador para confirmar tu pedido.'
          : 'No pudimos obtener tu ubicación. Verifica GPS/señal e intenta otra vez.'

      toast.error(message, { id: 'gps-location' })
      setLoadingLoc(false)
    }

    setLoadingLoc(true)
    setCoverageError('')
    toast.loading('Obteniendo ubicación...', { id: 'gps-location' })

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (error) => handleError(error, false),
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 2 * 60 * 1000 }
    )
  }

  const handleAdminSearch = () => {
    const coords = parseCoordinates(adminMapSearch)
    if (coords) {
      setLocation(coords, 'Coordenadas ubicadas en el mapa')
      return
    }

    const key = normalizeSearchKey(adminMapSearch)
    const presetKey = Object.keys(GT_LOCATION_PRESETS).find((candidate) => key === candidate || key.includes(candidate))
    const preset = presetKey ? GT_LOCATION_PRESETS[presetKey] : null
    const query = `${adminMapSearch}, Guatemala`
    setMapQuery(query)

    if (preset) {
      setLocation(preset, 'Ubicación aproximada lista')
      return
    }

    toast('Mapa actualizado. Para guardar navegación exacta pega coordenadas completas.', { icon: '📍' })
  }

  const handleAdminCoords = () => {
    const coords = parseCoordinates(adminCoords)
    if (!coords) {
      toast.error('Pega coordenadas válidas, ejemplo: 14.5251, -90.5875')
      return
    }
    setLocation(coords, 'Coordenadas guardadas')
  }

  const isCashAmountValid = paymentMethod !== 'efectivo' || (
    cashAmountInput.trim().length > 0 &&
    !Number.isNaN(Number(cashAmountInput)) &&
    Number(cashAmountInput) >= finalTotal
  )

  const isValid =
    localData.name.trim().length > 2 &&
    hasVerifiedPhone &&
    hasLocation &&
    localData.address.trim().length > 5 &&
    isCashAmountValid

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)

    try {
      const payloadCustomer = {
        ...order.customer,
        name: localData.name.trim(),
        phone: normalizeGtPhone(localData.phone),
        address: localData.address.trim(),
        location: localData.location,
        accessCode: localData.accessCode.trim(),
      }

      const sanitizePlate = (item) => ({
        sauce: item.sauce,
        protein: item.protein,
        complement: item.complement,
        baseRecipe: item.baseRecipe,
      })

      const targetPromoCount = (order.appliedPromos || []).reduce((sum, p) => sum + Number(p.requestedCount || p.plates?.length || 2), 0)
      const allItems = [...order.cart, order.currentPlate].map(sanitizePlate)
      const itemsToSend = [...allItems]

      // Respaldo de seguridad: si una promo llega con menos platos por un flujo viejo,
      // se duplica el último plato para que backend cobre la promo y descuente inventario completo.
      if (order.isPromo && targetPromoCount > itemsToSend.length && itemsToSend.length > 0) {
        const lastPlate = itemsToSend[itemsToSend.length - 1]
        while (itemsToSend.length < targetPromoCount) {
          itemsToSend.push({
            ...lastPlate,
            baseRecipe: { ...(lastPlate.baseRecipe || {}) },
          })
        }
      }

      const response = await createOrder({
        customer: payloadCustomer,
        sauceTemperature: order.sauceTemperature,
        items: itemsToSend,
        appliedPromo: order.appliedPromos?.[0] ? { id: order.appliedPromos[0].id } : null,
        appliedPromos: (order.appliedPromos || []).map(p => ({ id: p.id })),
        couponCode: order.couponCode || null,
        paymentMethod,
        cashAmount: paymentMethod === 'efectivo' ? Number(cashAmountInput) : null,
        ...(isInternal ? { isInternal: true } : {}),
      })

      const createdOrder = response.data.order

      // Con tarjeta, el pedido queda pendiente de pago en el backend: en vez de
      // mostrar la confirmacion aqui, se redirige directo al link de pago de
      // Recurrente. Al terminar de pagar, Recurrente regresa al cliente a la
      // pantalla de confirmacion (ver OrderConfirmation.jsx / success_url).
      if (paymentMethod === 'tarjeta' && createdOrder.paymentLink) {
        window.location.href = createdOrder.paymentLink
        return
      }

      setLastOrder(createdOrder)
      toast.success('Pedido enviado')
      onNext()
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message || 'No se pudo enviar el pedido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative pb-40 lg:pb-0">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2">Finalizar pedido</h2>
        <p className="text-ui-muted">Completa tus datos.</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Nombre</label>
          <input
            type="text"
            name="name"
            value={localData.name}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, name: true })}
            placeholder="Juan Pérez"
            className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm ${touched.name && localData.name.trim().length <= 2 ? 'border-red-500' : 'border-ui-border'}`}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-ui-text">Teléfono</label>
          <div className="flex items-center justify-between rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-4">
            <span className="text-green-500 font-black tracking-wide">
              {hasVerifiedPhone ? `+502 ${localData.phone}` : 'Número verificado'}
            </span>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Código de acceso</label>
          <input type="text" name="accessCode" value={localData.accessCode} onChange={handleChange} placeholder="1234" className="w-full p-3 sm:p-4 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm" />
        </div>

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Dirección</label>
          <textarea
            name="address"
            rows={3}
            value={localData.address}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, address: true })}
            placeholder="Casa, calle, número, referencia"
            className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none resize-none transition-all shadow-sm ${touched.address && localData.address.trim().length <= 5 ? 'border-red-500' : 'border-ui-border'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Método de pago</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('efectivo')}
              className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'efectivo' ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-ui-bg border-ui-border text-ui-text hover:border-brand-blue/50'}`}
            >
              <span className="font-bold">Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('tarjeta')}
              className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'tarjeta' ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-ui-bg border-ui-border text-ui-text hover:border-brand-blue/50'}`}
            >
              <span className="font-bold">Tarjeta (Link de Pago)</span>
            </button>
          </div>
          {paymentMethod === 'efectivo' && (
            <div className="mt-3 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-4 animate-fade-in text-left">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-blue mb-1.5 ml-1">
                💵 ¿Con cuánto vas a pagar?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-brand-blue text-lg">Q</span>
                <input
                  type="number"
                  min={finalTotal}
                  step="any"
                  value={cashAmountInput}
                  onChange={(e) => setCashAmountInput(e.target.value)}
                  placeholder={`${finalTotal}`}
                  className="w-full pl-9 pr-4 py-3 border border-brand-blue/20 rounded-xl bg-ui-bg text-ui-text font-black placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-lg"
                />
              </div>
              <p className="text-[11px] font-bold text-ui-muted mt-2 ml-1">
                Total de la orden: <span className="text-ui-text font-extrabold">Q{finalTotal}</span>. 
                {cashAmountInput.trim().length > 0 && !Number.isNaN(Number(cashAmountInput)) && (
                  Number(cashAmountInput) >= finalTotal ? (
                    <> Vuelto a llevar: <span className="text-green-600 font-extrabold font-brand">Q{(Number(cashAmountInput) - finalTotal).toFixed(2)}</span></>
                  ) : (
                    <span className="text-red-500 font-bold ml-1">El monto no puede ser menor a Q{finalTotal}</span>
                  )
                )}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Ubicación exacta</label>

          {isInternal ? (
            <div className="space-y-3 rounded-2xl border border-ui-border bg-ui-bg/50 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={adminMapSearch}
                  onChange={(e) => setAdminMapSearch(e.target.value)}
                  placeholder="Buscar zona, colonia o dirección"
                  className="w-full p-3 rounded-xl border border-ui-border bg-ui-card font-bold outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Button type="button" variant="secondary" onClick={handleAdminSearch}>Buscar</Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  value={adminCoords}
                  onChange={(e) => setAdminCoords(e.target.value)}
                  placeholder="14.5251, -90.5875"
                  className="w-full p-3 rounded-xl border border-ui-border bg-ui-card font-bold outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Button type="button" variant="secondary" onClick={handleAdminCoords}>Usar coords</Button>
                <Button type="button" variant="secondary" onClick={handleLocationClick} disabled={loadingLoc}>{loadingLoc ? 'Obteniendo...' : 'GPS actual'}</Button>
              </div>

              <LocationPreview location={localData.location} query={mapQuery} />

              {hasLocation && (
                <p className="text-xs font-black text-green-600">Ubicación guardada: {Number(localData.location.lat).toFixed(6)}, {Number(localData.location.lng).toFixed(6)}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLocationClick}
                disabled={loadingLoc}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${hasLocation ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-ui-bg border-ui-border text-ui-text hover:border-brand-blue/40'}`}
              >
                <span className="font-black text-sm">{loadingLoc ? 'Obteniendo ubicación...' : hasLocation ? 'Ubicación lista' : 'Obtener ubicación actual'}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${hasLocation ? 'bg-green-500 text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
                  {hasLocation ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm8-1c0 6.627-8 11-8 11S4 16.627 4 10a8 8 0 1116 0z" /></svg>
                  )}
                </div>
              </button>
              <LocationPreview location={hasLocation ? localData.location : null} query={hasLocation ? undefined : CUSTOMER_COVERAGE_QUERY} />
              {coverageError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-600">
                  {coverageError}
                </div>
              )}
              <p className="text-xs font-bold text-ui-muted">La ubicación se toma únicamente desde el GPS actual del cliente. Cobertura válida: algunas zonas de Villa Nueva y alrededores.</p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-ui-bg via-ui-bg/95 to-transparent pointer-events-none" />
        <div className="bg-ui-card border-t border-ui-border shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-5 sm:p-6 pb-8 sm:pb-6 relative flex gap-3">
          <Button variant="secondary" onClick={onBack} className="w-1/3 py-4 text-lg font-black rounded-2xl">Atrás</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
            className="flex-1 py-4 text-lg font-black shadow-xl shadow-brand-blue/30 rounded-2xl"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar'}
          </Button>
        </div>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden lg:flex justify-between pt-6 border-t border-ui-border mt-8 gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>{isSubmitting ? 'Enviando...' : 'Confirmar pedido'}</Button>
      </div>
    </div>
  )
}

export default CustomerPage
