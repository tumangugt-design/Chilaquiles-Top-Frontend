import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api'
import Button from '../components/ui/Button.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import { createOrder, getPublicInventoryOptions } from '../shared/config/api.js'
import toast from 'react-hot-toast'
import {
  OPTIONS_COUNT,
  OPTIONS_SAUCE,
  OPTIONS_PROTEIN,
  OPTIONS_COMPLEMENT,
  OPTIONS_BASE_RECIPE,
  calculateTotal,
  formatBaseRecipe,
} from '../shared/constants/index.jsx'
import {
  MapPin,
  User,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Search,
  Target,
  Navigation,
  Smartphone,
  Utensils,
} from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const GUATEMALA_CENTER = { lat: 14.6349, lng: -90.5069 }

const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  scrollwheel: true,
  restriction: {
    latLngBounds: {
      north: 18.0,
      south: 13.5,
      west: -92.5,
      east: -88.0,
    },
    strictBounds: false,
  },
  styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
}

const defaultBaseRecipe = { onion: true, cilantro: true, cream: true }
const emptyPlate = { sauce: '', protein: '', complement: '', baseRecipe: { ...defaultBaseRecipe } }

const normalizeGtPhone = (raw = '') => {
  let digits = String(raw).trim().replace(/\D/g, '')
  if (digits.length > 8 && digits.startsWith('502')) digits = digits.slice(3)
  if (digits.length !== 8) throw new Error('El número de teléfono debe tener 8 dígitos.')
  return `+502${digits}`
}

const buildPlates = (count, current = []) => (
  Array.from({ length: count }, (_, index) => current[index] || { ...emptyPlate, baseRecipe: { ...defaultBaseRecipe } })
)

const InternalOrder = ({ onSuccess }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', accessCode: '' })
  const [position, setPosition] = useState(GUATEMALA_CENTER)
  const [plateCount, setPlateCount] = useState(1)
  const [plates, setPlates] = useState(buildPlates(1))
  const [activeNames, setActiveNames] = useState(null)
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [map, setMap] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [coordInput, setCoordInput] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  useEffect(() => {
    let mounted = true
    getPublicInventoryOptions()
      .then((response) => mounted && setActiveNames(response.data?.activeNames || []))
      .catch(() => mounted && setActiveNames(null))
    return () => { mounted = false }
  }, [])

  const availableSauces = useMemo(() => {
    if (!activeNames) return OPTIONS_SAUCE
    const hasRoja = activeNames.includes('salsa roja')
    const hasVerde = activeNames.includes('salsa verde')
    return OPTIONS_SAUCE.filter((option) => {
      if (option.value === 'ROJA') return hasRoja
      if (option.value === 'VERDE') return hasVerde
      if (option.value === 'DIVORCIADOS') return hasRoja && hasVerde
      return true
    })
  }, [activeNames])

  const availableProteins = useMemo(() => {
    if (!activeNames) return OPTIONS_PROTEIN
    return OPTIONS_PROTEIN.filter((option) => activeNames.includes(option.value.toLowerCase()))
  }, [activeNames])

  const availableComplements = useMemo(() => {
    if (!activeNames) return OPTIONS_COMPLEMENT
    const map = { AGUACATE: 'aguacate', CEBOLLA_CARAMELIZADA: 'cebolla caramelizada', QUESO_EXTRA: 'queso extra' }
    return OPTIONS_COMPLEMENT.filter((option) => activeNames.includes(map[option.id]))
  }, [activeNames])

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), [])
  const onAutocompleteLoad = (autocompleteInstance) => setAutocomplete(autocompleteInstance)

  const onPlaceChanged = () => {
    if (!autocomplete) return
    const place = autocomplete.getPlace()
    if (place.geometry?.location) {
      const newPos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
      setPosition(newPos)
      setFormData((prev) => ({ ...prev, address: place.formatted_address || prev.address }))
      map?.panTo(newPos)
      map?.setZoom(16)
    }
  }

  const handleMapClick = (event) => setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() })

  const handleCoordSubmit = (event) => {
    event.preventDefault()
    if (!coordInput.trim()) return
    try {
      const urlMatch = coordInput.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) || coordInput.match(/query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
      let lat
      let lng
      if (urlMatch) {
        lat = parseFloat(urlMatch[1])
        lng = parseFloat(urlMatch[2])
      } else {
        const parts = coordInput.split(/[\s,]+/).filter(Boolean)
        lat = parseFloat(parts[0])
        lng = parseFloat(parts[1])
      }
      if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error('invalid')
      const newPos = { lat, lng }
      setPosition(newPos)
      map?.panTo(newPos)
      map?.setZoom(17)
      setCoordInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      toast.success('Ubicación fijada')
    } catch {
      toast.error('Formato inválido. Pega coordenadas o un enlace de Google Maps.')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no permite obtener la ubicación.')
      return
    }
    setIsGettingLocation(true)
    toast.loading('Obteniendo ubicación...', { id: 'admin-gps' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        map?.panTo(newPos)
        map?.setZoom(17)
        setIsGettingLocation(false)
        toast.success('Ubicación actual obtenida', { id: 'admin-gps' })
      },
      () => {
        setIsGettingLocation(false)
        toast.error('No se pudo obtener la ubicación actual', { id: 'admin-gps' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const selectPlateCount = (count) => {
    setPlateCount(count)
    setPlates((current) => buildPlates(count, current))
  }

  const updatePlate = (index, patch) => {
    setPlates((current) => current.map((plate, plateIndex) => (
      plateIndex === index ? { ...plate, ...patch, baseRecipe: { ...plate.baseRecipe, ...(patch.baseRecipe || {}) } } : plate
    )))
  }

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Completa nombre, teléfono y dirección.')
      return
    }
    try { normalizeGtPhone(formData.phone) } catch (error) { toast.error(error.message); return }
    setStep(2)
  }

  const validateStep2 = () => {
    const incomplete = plates.some((plate) => !plate.sauce || !plate.protein || !plate.complement)
    if (incomplete) {
      toast.error('Completa salsa, proteína y complemento en todos los platos.')
      return
    }
    setStep(3)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payloadCustomer = {
        name: formData.name.trim(),
        phone: normalizeGtPhone(formData.phone),
        address: formData.address.trim(),
        location: position,
        accessCode: formData.accessCode.trim(),
      }

      await createOrder({
        customer: payloadCustomer,
        items: plates.map((plate) => ({
          sauce: plate.sauce,
          protein: plate.protein,
          complement: plate.complement,
          baseRecipe: plate.baseRecipe,
        })),
        isInternal: true,
      })

      toast.success('Pedido interno creado exitosamente')
      onSuccess?.()
      setStep(1)
      setFormData({ name: '', phone: '', address: '', accessCode: '' })
      selectPlateCount(1)
    } catch (err) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length) {
        toast.error(`Inventario insuficiente: ${details.map((item) => item.ingredient).join(', ')}`)
      } else {
        toast.error(err.response?.data?.message || err.message || 'Error al crear pedido')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const Stepper = () => (
    <div className="flex items-center justify-between max-w-xl mx-auto mb-10">
      {['Cliente', 'Pedido', 'Resumen'].map((label, index) => {
        const value = index + 1
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black transition-all border-2 ${step >= value ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/25' : 'bg-white border-ui-border text-ui-muted'}`}>
              {step > value ? <CheckCircle2 size={20} /> : value}
            </div>
            <span className="hidden sm:block ml-2 text-[10px] font-black uppercase tracking-widest text-ui-muted">{label}</span>
            {value < 3 && <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${step > value ? 'bg-brand-blue' : 'bg-ui-border'}`} />}
          </div>
        )
      })}
    </div>
  )

  const currentPlate = plates[currentPlateIndex]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-ui-text tracking-tight">Nuevo Pedido Interno</h2>
        <p className="text-ui-muted font-bold uppercase tracking-widest text-[10px]">Mismo flujo del cliente, sin OTP</p>
      </div>

      <Stepper />

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-8 animate-slide-up">
          <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-ui-border pb-4">
              <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue"><User size={20} /></div>
              <h3 className="font-black text-xl text-ui-text">Datos del Cliente</h3>
            </div>
            <div className="space-y-4">
              <input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre completo" className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue" />
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Teléfono 8 dígitos" className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue" />
              </div>
              <input name="accessCode" value={formData.accessCode} onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })} placeholder="Código de acceso / instrucciones" className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue" />
            </div>

            <div className="pt-6 border-t border-ui-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange"><Utensils size={20} /></div>
                <h3 className="font-black text-xl text-ui-text">Número de platos</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {OPTIONS_COUNT.map((option) => (
                  <button key={option.id} onClick={() => selectPlateCount(option.value)} className={`rounded-3xl border-2 p-4 text-left transition-all ${plateCount === option.value ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-ui-border bg-ui-bg text-ui-text hover:border-brand-blue/40'}`}>
                    <p className="font-black">{option.label}</p>
                    <p className="text-xs font-bold text-ui-muted mt-1">Q{option.price}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-ui-border pb-4">
              <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange"><MapPin size={20} /></div>
              <h3 className="font-black text-xl text-ui-text">Ubicación de entrega</h3>
            </div>

            {isLoaded ? (
              <>
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged} options={{ componentRestrictions: { country: 'gt' } }}>
                  <div className="relative">
                    <input type="text" placeholder="Buscar: Zona 18, Guatemala..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-4 pr-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue" />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted" size={20} />
                  </div>
                </Autocomplete>
                <form onSubmit={handleCoordSubmit} className="relative">
                  <input type="text" placeholder="Pegar coordenadas o link de Google Maps" value={coordInput} onChange={(e) => setCoordInput(e.target.value)} className="w-full p-4 pr-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue" />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue"><Target size={20} /></button>
                </form>
                <button onClick={useCurrentLocation} className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2"><Navigation size={12} /> {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar GPS actual'}</button>
                <div className="h-72 rounded-3xl overflow-hidden border border-ui-border">
                  <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} center={position} zoom={14} onLoad={onMapLoad} onClick={handleMapClick} options={mapOptions}>
                    <Marker position={position} />
                  </GoogleMap>
                </div>
              </>
            ) : (
              <div className="h-72 bg-ui-bg rounded-3xl border border-ui-border flex items-center justify-center text-ui-muted font-bold">Cargando mapa...</div>
            )}
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button className="!py-5 min-w-64" onClick={validateStep1}>Continuar <ChevronRight className="ml-2" size={18} /></Button>
          </div>
        </div>
      )}

      {step === 2 && currentPlate && (
        <div className="space-y-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-brand-blue uppercase tracking-widest">Plato {currentPlateIndex + 1} de {plates.length}</p>
              <h3 className="text-3xl font-black text-ui-text">Arma el plato</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {plates.map((_, index) => (
                <button key={index} onClick={() => setCurrentPlateIndex(index)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase border ${currentPlateIndex === index ? 'bg-brand-blue text-white border-brand-blue' : 'bg-ui-card border-ui-border text-ui-muted'}`}>Plato {index + 1}</button>
              ))}
            </div>
          </div>

          <section className="space-y-4">
            <h4 className="font-black text-xl text-ui-text">Salsa</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {availableSauces.length === 0 ? <div className="md:col-span-3 rounded-3xl border border-dashed border-ui-border p-8 text-center font-bold text-ui-muted">No hay salsas activas con stock.</div> : availableSauces.map((option) => <OptionCard key={option.id} {...option} selected={currentPlate.sauce === option.value} onClick={() => updatePlate(currentPlateIndex, { sauce: option.value })} title={option.label} />)}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-black text-xl text-ui-text">Proteína</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {availableProteins.length === 0 ? <div className="md:col-span-3 rounded-3xl border border-dashed border-ui-border p-8 text-center font-bold text-ui-muted">No hay proteínas activas con stock.</div> : availableProteins.map((option) => <OptionCard key={option.id} {...option} selected={currentPlate.protein === option.value} onClick={() => updatePlate(currentPlateIndex, { protein: option.value })} title={option.label} />)}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-black text-xl text-ui-text">Complemento</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {availableComplements.length === 0 ? <div className="md:col-span-3 rounded-3xl border border-dashed border-ui-border p-8 text-center font-bold text-ui-muted">No hay complementos activos con stock.</div> : availableComplements.map((option) => <OptionCard key={option.id} {...option} selected={currentPlate.complement === option.value} onClick={() => updatePlate(currentPlateIndex, { complement: option.value })} title={option.label} />)}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-black text-xl text-ui-text">Detalles de receta base</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {OPTIONS_BASE_RECIPE.map((option) => <OptionCard key={option.id} {...option} selected={!!currentPlate.baseRecipe[option.id]} onClick={() => updatePlate(currentPlateIndex, { baseRecipe: { [option.id]: !currentPlate.baseRecipe[option.id] } })} title={option.label} />)}
            </div>
          </section>

          <div className="flex gap-4 pt-4 border-t border-ui-border">
            <Button variant="secondary" className="flex-1 !py-5" onClick={() => setStep(1)}><ChevronLeft className="mr-2" size={18} /> Anterior</Button>
            <Button className="flex-[2] !py-5" onClick={validateStep2}>Revisar resumen <ChevronRight className="ml-2" size={18} /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto animate-slide-up space-y-8">
          <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-ui-border pb-4"><div className="p-2 bg-green-500/10 rounded-xl text-green-600"><CheckCircle2 size={20} /></div><h3 className="font-black text-2xl text-ui-text">Resumen del pedido</h3></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-[10px] font-black uppercase text-ui-muted tracking-widest mb-2">Cliente</p><p className="font-black text-lg text-ui-text">{formData.name}</p><p className="font-bold text-brand-blue">{formData.phone}</p><p className="text-sm font-bold text-ui-muted mt-2">{formData.address}</p>{formData.accessCode && <p className="text-xs font-bold mt-2">Código: {formData.accessCode}</p>}</div>
              <div><p className="text-[10px] font-black uppercase text-ui-muted tracking-widest mb-2">Ubicación</p><div className="rounded-2xl border border-ui-border p-3 bg-ui-bg text-xs font-bold text-ui-text">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</div></div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Detalle de platos</p>
              {plates.map((plate, index) => <div key={index} className="p-4 rounded-2xl bg-ui-bg border border-ui-border"><p className="text-xs font-black text-brand-blue uppercase mb-1">Plato {index + 1}</p><p className="font-bold text-ui-text text-sm">{plate.sauce} · {plate.protein} · {plate.complement}</p><p className="text-[10px] font-medium text-ui-muted mt-1 uppercase">{formatBaseRecipe(plate.baseRecipe) || 'Sin base adicional'}</p></div>)}
            </div>
            <div className="pt-6 border-t border-ui-border flex justify-between items-center"><p className="font-black text-xl text-ui-text">Total</p><p className="font-black text-3xl text-brand-blue">Q{calculateTotal(plates.length)}</p></div>
          </div>
          <div className="flex gap-4"><Button variant="secondary" className="flex-1 !py-5" onClick={() => setStep(2)}><ChevronLeft className="mr-2" size={18} /> Editar</Button><Button className="flex-[2] !py-5 !bg-green-600 shadow-xl shadow-green-600/20" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}</Button></div>
        </div>
      )}
    </div>
  )
}

export default InternalOrder
