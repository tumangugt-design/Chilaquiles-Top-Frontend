import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  GoogleMap, 
  useJsApiLoader, 
  Marker, 
  Autocomplete 
} from '@react-google-maps/api'
import Button from '../components/ui/Button.jsx'
import { createOrder } from '../shared/config/api.js'
import toast from 'react-hot-toast'
import { 
  MapPin, 
  Phone, 
  User, 
  ClipboardList, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Search, 
  Target,
  Navigation,
  Map as MapIcon,
  Smartphone
} from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const GUATEMALA_CENTER = { lat: 14.6349, lng: -90.5069 }

const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  scrollwheel: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

const initialPlate = {
  sauce: 'ROJA',
  protein: 'POLLO',
  complement: 'AGUACATE',
  baseRecipe: { onion: true, cilantro: true, cream: true }
}

const InternalOrder = ({ onSuccess }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accessCode: ''
  })
  
  const [position, setPosition] = useState(GUATEMALA_CENTER)
  const [plates, setPlates] = useState([{ ...initialPlate }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [map, setMap] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [coordInput, setCoordInput] = useState('')

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
  }, [])

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        setPosition(newPos)
        setFormData(prev => ({ ...prev, address: place.formatted_address || prev.address }))
        if (map) map.panTo(newPos)
      }
    }
  }

  const handleMapClick = (e) => {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }
    setPosition(newPos)
  }

  const handleCoordSubmit = (e) => {
    e.preventDefault()
    if (!coordInput.trim()) return

    try {
      // Handle Google Maps URLs (lat,lng pattern)
      const urlMatch = coordInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || 
                      coordInput.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/)
      
      let lat, lng
      
      if (urlMatch) {
        lat = parseFloat(urlMatch[1])
        lng = parseFloat(urlMatch[2])
      } else {
        // Handle "lat, lng" or "lat lng" format
        const parts = coordInput.split(/[\s,]+/).map(s => s.trim())
        if (parts.length >= 2) {
          lat = parseFloat(parts[0])
          lng = parseFloat(parts[1])
        }
      }

      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        const newPos = { lat, lng }
        setPosition(newPos)
        if (map) {
          map.panTo(newPos)
          map.setZoom(17)
        }
        toast.success('Ubicación fijada por coordenadas')
        setCoordInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } else {
        throw new Error('Formato no reconocido')
      }
    } catch (err) {
      toast.error('Formato inválido. Pega coordenadas (lat, lng) o un enlace de Google Maps.')
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setPosition(newPos)
          if (map) {
            map.panTo(newPos)
            map.setZoom(17)
          }
          toast.success('Ubicación actual obtenida')
        },
        () => toast.error('No se pudo obtener la ubicación actual')
      )
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const addPlate = () => {
    setPlates([...plates, { ...initialPlate }])
  }

  const removePlate = (index) => {
    if (plates.length > 1) {
      setPlates(plates.filter((_, i) => i !== index))
    }
  }

  const updatePlate = (index, field, value) => {
    const newPlates = [...plates]
    if (field.startsWith('baseRecipe.')) {
      const subField = field.split('.')[1]
      newPlates[index].baseRecipe = {
        ...newPlates[index].baseRecipe,
        [subField]: value
      }
    } else {
      newPlates[index][field] = value
    }
    setPlates(newPlates)
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Por favor completa todos los campos del cliente')
      return false
    }
    setStep(2)
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      let normalizedPhone = formData.phone.trim().replace(/\D/g, '')
      
      // If it starts with 502, remove it to normalize
      if (normalizedPhone.length > 8 && normalizedPhone.startsWith('502')) {
        normalizedPhone = normalizedPhone.slice(3)
      }
      
      // Ensure it's exactly 8 digits (Guatemala standard)
      if (normalizedPhone.length !== 8) {
        throw new Error('El número de teléfono debe tener 8 dígitos.')
      }

      normalizedPhone = `+502${normalizedPhone}`

      const payloadCustomer = {
        name: formData.name,
        phone: normalizedPhone,
        address: formData.address,
        location: position,
        accessCode: formData.accessCode,
      }

      await createOrder({
        customer: payloadCustomer,
        items: plates.map((plate) => ({
          sauce: plate.sauce,
          protein: plate.protein,
          complement: plate.complement,
          baseRecipe: plate.baseRecipe,
        })),
        isInternal: true
      })

      toast.success('Pedido interno creado exitosamente')
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al crear pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const Stepper = () => (
    <div className="flex items-center justify-between max-w-md mx-auto mb-10">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-2 ${
            step >= s ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/25' : 'bg-white border-ui-border text-ui-muted'
          }`}>
            {step > s ? <CheckCircle2 size={20} /> : s}
          </div>
          {s < 3 && (
            <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > s ? 'bg-brand-blue' : 'bg-ui-border'}`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-ui-text tracking-tight">Nuevo Pedido Interno</h2>
        <p className="text-ui-muted font-bold uppercase tracking-widest text-[10px]">Gestión directa sin verificación OTP</p>
      </div>

      <Stepper />

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-8 animate-slide-up">
          <div className="space-y-6">
            <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="flex items-center gap-3 border-b border-ui-border pb-4 relative">
                <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                  <User size={20} />
                </div>
                <h3 className="font-black text-xl text-ui-text">Datos del Cliente</h3>
              </div>

              <div className="space-y-4 relative">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest flex items-center gap-2 group-focus-within:text-brand-blue transition-colors">
                    <User size={12} /> Nombre Completo
                  </label>
                  <div className="relative">
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Ej. Juan Pérez"
                      className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all placeholder:text-ui-muted/50" 
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-brand-blue transition-colors" size={18} />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest flex items-center gap-2 group-focus-within:text-brand-blue transition-colors">
                    <Smartphone size={12} /> Teléfono (8 dígitos)
                  </label>
                  <div className="relative">
                    <input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Ej. 12345678" 
                      className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all placeholder:text-ui-muted/50" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-ui-muted/40 group-focus-within:text-brand-blue transition-colors">
                      <span className="text-[10px] font-black">+502</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest flex items-center gap-2 group-focus-within:text-brand-blue transition-colors">
                    <ClipboardList size={12} /> Código de acceso / Instrucciones
                  </label>
                  <div className="relative">
                    <input 
                      name="accessCode" 
                      value={formData.accessCode} 
                      onChange={handleInputChange} 
                      placeholder="Ej. Garita #2, tocar timbre" 
                      className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all placeholder:text-ui-muted/50" 
                    />
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-brand-blue transition-colors" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                  <MapPin size={20} />
                </div>
                <h3 className="font-black text-xl text-ui-text">Ubicación de Entrega</h3>
              </div>

              <div className="space-y-4">
                {isLoaded ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-ui-muted ml-1 tracking-widest">Buscador de Lugares</label>
                      <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                        options={{
                          componentRestrictions: { country: 'gt' }
                        }}
                      >
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Buscar dirección (ej. Zona 18, Guatemala)"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full p-4 pr-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue transition-all"
                          />
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted" size={20} />
                        </div>
                      </Autocomplete>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-ui-muted ml-1 tracking-widest flex items-center justify-between">
                        <span>Coordenadas Directas / Link Maps</span>
                        <button 
                          onClick={useCurrentLocation}
                          className="text-[9px] text-brand-blue flex items-center gap-1 hover:underline"
                        >
                          <Navigation size={10} /> Usar GPS
                        </button>
                      </label>
                      <form onSubmit={handleCoordSubmit} className="relative">
                        <input
                          type="text"
                          placeholder="Pega coordenadas o link de Maps"
                          value={coordInput}
                          onChange={(e) => setCoordInput(e.target.value)}
                          className="w-full p-4 pr-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue transition-all"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue hover:scale-110 transition-transform">
                          <Target size={20} />
                        </button>
                      </form>
                    </div>

                    <div className="h-72 rounded-3xl overflow-hidden border border-ui-border shadow-inner relative">
                      <GoogleMap
                        mapContainerStyle={{ height: '100%', width: '100%' }}
                        center={position}
                        zoom={14}
                        onLoad={onMapLoad}
                        onClick={handleMapClick}
                        options={mapOptions}
                      >
                        <Marker position={position} />
                      </GoogleMap>
                    </div>
                  </>
                ) : (
                  <div className="h-72 bg-ui-bg animate-pulse rounded-3xl border border-ui-border flex items-center justify-center">
                    <p className="text-ui-muted font-bold">Cargando Google Maps...</p>
                  </div>
                )}
                <p className="text-[10px] text-ui-muted text-center font-black uppercase tracking-wider">Mueve el marcador para ajustar la entrega</p>
              </div>
            </div>

            <Button 
              className="w-full !py-5 shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 group" 
              onClick={validateStep1}
            >
              <span>Continuar a Selección de Platos</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                <ClipboardList size={20} />
              </div>
              <h3 className="font-black text-2xl text-ui-text">Selección de Platos</h3>
            </div>
            <Button variant="secondary" onClick={addPlate} className="!bg-brand-blue/10 !text-brand-blue !border-brand-blue/20">
              <Plus size={18} className="mr-2" /> Añadir Otro Plato
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plates.map((plate, idx) => (
              <div key={idx} className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm relative group hover:border-brand-blue/30 transition-all">
                {plates.length > 1 && (
                  <button 
                    onClick={() => removePlate(idx)} 
                    className="absolute top-6 right-6 p-2 text-brand-red opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-red/10 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                
                <div className="inline-flex items-center px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  Plato {idx + 1}
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-ui-muted ml-1">Salsa</label>
                      <select 
                        value={plate.sauce} 
                        onChange={(e) => updatePlate(idx, 'sauce', e.target.value)} 
                        className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold text-sm focus:border-brand-blue transition-all outline-none"
                      >
                        <option value="ROJA">Roja</option>
                        <option value="VERDE">Verde</option>
                        <option value="DIVORCIADOS">Divorciados</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-ui-muted ml-1">Proteína</label>
                      <select 
                        value={plate.protein} 
                        onChange={(e) => updatePlate(idx, 'protein', e.target.value)} 
                        className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold text-sm focus:border-brand-blue transition-all outline-none"
                      >
                        <option value="POLLO">Pollo</option>
                        <option value="STEAK">Steak</option>
                        <option value="CHORIZO">Chorizo</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[11px] font-black uppercase text-ui-muted ml-1">Complemento</label>
                      <select 
                        value={plate.complement} 
                        onChange={(e) => updatePlate(idx, 'complement', e.target.value)} 
                        className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold text-sm focus:border-brand-blue transition-all outline-none"
                      >
                        <option value="AGUACATE">Aguacate</option>
                        <option value="CEBOLLA_CARAMELIZADA">Cebolla Caramelizada</option>
                        <option value="QUESO_EXTRA">Queso Extra</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-ui-border">
                    <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest mb-4">Ingredientes Base</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'onion', label: 'Cebolla' },
                        { key: 'cilantro', label: 'Cilantro' },
                        { key: 'cream', label: 'Crema' }
                      ].map((base) => (
                        <button
                          key={base.key}
                          onClick={() => updatePlate(idx, `baseRecipe.${base.key}`, !plate.baseRecipe[base.key])}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                            plate.baseRecipe[base.key] 
                              ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' 
                              : 'bg-white border-ui-border text-ui-muted hover:border-ui-text/20'
                          }`}
                        >
                          {base.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1 !py-5" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2" size={18} /> Anterior
            </Button>
            <Button className="flex-[2] !py-5 shadow-xl shadow-brand-blue/20" onClick={() => setStep(3)}>
              Revisar Resumen <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto animate-slide-up space-y-8">
          <div className="bg-ui-card rounded-[2.5rem] border border-ui-border p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-ui-border pb-4">
              <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-black text-2xl text-ui-text">Resumen del Pedido</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Información del Cliente</p>
                <div className="space-y-2">
                  <p className="font-black text-lg text-ui-text">{formData.name}</p>
                  <p className="font-bold text-brand-blue">{formData.phone}</p>
                  <p className="text-sm font-bold text-ui-muted leading-snug">{formData.address}</p>
                  {formData.accessCode && (
                    <div className="inline-block px-3 py-1 bg-ui-bg border border-ui-border rounded-lg text-xs font-bold text-ui-text">
                      Código: {formData.accessCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Ubicación</p>
                <div className="rounded-2xl border border-ui-border p-3 bg-ui-bg flex items-center gap-3">
                  <MapPin size={18} className="text-brand-orange" />
                  <div className="text-[10px] font-bold text-ui-text">
                    <p>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Detalle de Platos ({plates.length})</p>
              <div className="space-y-3">
                {plates.map((plate, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-ui-bg border border-ui-border flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-brand-blue uppercase mb-1">Plato {idx + 1}</p>
                      <p className="font-bold text-ui-text text-sm capitalize">{plate.sauce} · {plate.protein} · {plate.complement}</p>
                      <p className="text-[10px] font-medium text-ui-muted mt-1 italic">
                        {Object.entries(plate.baseRecipe).filter(([_, v]) => v).map(([k]) => k).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-ui-text">Q{idx === 0 ? 35 : 35}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-ui-border flex justify-between items-center">
              <p className="font-black text-xl text-ui-text">Total estimado</p>
              <p className="font-black text-3xl text-brand-blue">Q{plates.length * 35}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1 !py-5" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-2" size={18} /> Editar Platos
            </Button>
            <Button 
              className="flex-[2] !py-5 !bg-green-600 shadow-xl shadow-green-600/20" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InternalOrder
