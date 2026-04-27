import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import { createOrder } from '../shared/config/api.js'
import toast from 'react-hot-toast'

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('502')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

const normalizeGtPhone = (raw = '') => {
  const digits = toGtLocalDigits(raw)
  return digits ? `+502${digits}` : ''
}

const CustomerPage = ({ order, updateOrder, setLastOrder, onNext, onBack }) => {
  const [localData, setLocalData] = useState({
    name: order.customer?.name || '',
    phone: toGtLocalDigits(order.customer?.phone || ''),
    address: order.customer?.address || '',
    location: order.customer?.location || null,
    accessCode: order.customer?.accessCode || '',
  })
  const [touched, setTouched] = useState({ name: false, phone: false, address: false })
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'phone' ? toGtLocalDigits(value) : value
    const newData = { ...localData, [name]: nextValue }
    setLocalData(newData)
    updateOrder({
      customer: {
        ...order.customer,
        ...newData,
        phone: normalizeGtPhone(newData.phone),
      },
    })
  }

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no permite ubicación.')
      return
    }

    setLoadingLoc(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        const newData = { ...localData, location }
        setLocalData(newData)
        updateOrder({
          customer: {
            ...order.customer,
            ...newData,
            phone: normalizeGtPhone(newData.phone),
          },
        })
        setLoadingLoc(false)
        toast.success('Ubicación lista')
      },
      () => {
        toast.error('No pudimos obtener tu ubicación.')
        setLoadingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const isValid =
    localData.name.trim().length > 2 &&
    localData.phone.trim().length === 8 &&
    localData.address.trim().length > 5

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

      const allItems = [...order.cart, order.currentPlate]
      const response = await createOrder({
        customer: payloadCustomer,
        items: allItems.map((item) => ({
          sauce: item.sauce,
          protein: item.protein,
          complement: item.complement,
          baseRecipe: item.baseRecipe,
        })),
      })

      setLastOrder(response.data.order)
      toast.success('Pedido enviado')
      onNext()
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message || 'No se pudo enviar el pedido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasLocation = !!localData.location?.lat && !!localData.location?.lng

  return (
    <div className="space-y-6 animate-fade-in relative">
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

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Teléfono</label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center bg-ui-bg px-2.5 py-3 sm:px-3 sm:py-3.5 rounded-xl border border-ui-border">
              <span className="text-xs sm:text-sm font-bold text-ui-muted">GT +502</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={localData.phone}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, phone: true })}
              placeholder="33662977"
              maxLength={8}
              inputMode="numeric"
              className={`flex-1 p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm font-bold tracking-wider ${touched.phone && localData.phone.trim().length !== 8 ? 'border-red-500' : 'border-ui-border'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Código de acceso</label>
          <input
            type="text"
            name="accessCode"
            value={localData.accessCode}
            onChange={handleChange}
            placeholder="1234"
            className="w-full p-3 sm:p-4 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Ubicación exacta</label>
          <button
            type="button"
            onClick={handleLocationClick}
            disabled={loadingLoc}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${hasLocation ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-ui-bg border-ui-border text-ui-text hover:border-brand-blue/40'}`}
          >
            <span className="font-black text-sm">{loadingLoc ? 'Obteniendo ubicación...' : hasLocation ? 'Ubicación lista' : 'Obtener ubicación'}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${hasLocation ? 'bg-green-500 text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {hasLocation ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm8-1c0 6.627-8 11-8 11S4 16.627 4 10a8 8 0 1116 0z" />
                </svg>
              )}
            </div>
          </button>
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
      </div>

      <div className="flex justify-between pt-6 border-t border-ui-border mt-8 gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>{isSubmitting ? 'Enviando...' : 'Confirmar pedido'}</Button>
      </div>
    </div>
  )
}

export default CustomerPage
