import { useState, useEffect, useRef } from 'react'
import { OPTIONS_COUNT, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT, formatBaseRecipe } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'
import { getPromotions } from '../shared/config/api.js'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const SizePage = ({ order, updateOrder, onNext, onBack }) => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(() => {
    if (order.requestedCount === 'PROMO') return 'PROMO'
    if (order.requestedCount) return 'NORMAL'
    return null
  })
  const orderRef = useRef(order)

  useEffect(() => {
    orderRef.current = order
  }, [order])

  useEffect(() => {
    const fetchPromos = () => {
      getPromotions()
        .then((res) => {
          const activePromos = (res.data || []).filter((p) => p.isActive)
          setPromotions(activePromos)
          
          const currentOrder = orderRef.current
          const freshPlate = {
            id: Math.random().toString(36).slice(2, 11),
            sauce: null,
            protein: null,
            complement: null,
            baseRecipe: { onion: true, cilantro: true, cream: true }
          }
          if (activePromos.length === 0 && currentOrder.requestedCount === 'PROMO') {
            updateOrder({
              requestedCount: null,
              appliedPromo: null,
              appliedPromos: [],
              isPromo: false,
              cart: [],
              currentPlate: freshPlate,
            })
            toast.error('No hay promociones activas disponibles en este momento.')
          } else if (currentOrder.requestedCount === 'PROMO' && (currentOrder.appliedPromo || (currentOrder.appliedPromos && currentOrder.appliedPromos.length > 0))) {
            const stillActivePromos = (currentOrder.appliedPromos || []).filter(ap => activePromos.some(p => p.id === ap.id))
            if (stillActivePromos.length !== (currentOrder.appliedPromos || []).length) {
              updateOrder({
                appliedPromo: stillActivePromos[0] || null,
                appliedPromos: stillActivePromos,
                cart: [],
                currentPlate: freshPlate,
              })
              toast.error('Alguna de las promociones seleccionadas ya no está disponible.')
            }
          }
        })
        .catch(() => {
          setPromotions([])
        })
    }

    setLoading(true)
    getPromotions()
      .then((res) => {
        const activePromos = (res.data || []).filter((p) => p.isActive)
        setPromotions(activePromos)
        
        const currentOrder = orderRef.current
        const freshPlate = {
          id: Math.random().toString(36).slice(2, 11),
          sauce: null,
          protein: null,
          complement: null,
          baseRecipe: { onion: true, cilantro: true, cream: true }
        }
        if (activePromos.length === 0 && currentOrder.requestedCount === 'PROMO') {
          updateOrder({
            requestedCount: null,
            appliedPromo: null,
            appliedPromos: [],
            isPromo: false,
            cart: [],
            currentPlate: freshPlate,
          })
        } else if (currentOrder.requestedCount === 'PROMO' && (currentOrder.appliedPromo || (currentOrder.appliedPromos && currentOrder.appliedPromos.length > 0))) {
          const stillActivePromos = (currentOrder.appliedPromos || []).filter(ap => activePromos.some(p => p.id === ap.id))
          if (stillActivePromos.length !== (currentOrder.appliedPromos || []).length) {
            updateOrder({
              appliedPromo: stillActivePromos[0] || null,
              appliedPromos: stillActivePromos,
              cart: [],
              currentPlate: freshPlate,
            })
          }
        }
      })
      .catch(() => {
        setPromotions([])
      })
      .finally(() => {
        setLoading(false)
      })

    const interval = setInterval(fetchPromos, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleAddPromo = (promo) => {
    const currentPromos = order.appliedPromos || []
    const updatedPromos = [...currentPromos, promo]
    updateOrder({
      requestedCount: 'PROMO',
      appliedPromos: updatedPromos,
      appliedPromo: updatedPromos[0] || null,
      isPromo: true
    })
  }

  const handleRemovePromo = (promo) => {
    const currentPromos = order.appliedPromos || []
    const idx = currentPromos.findIndex(p => p.id === promo.id)
    if (idx > -1) {
      const updatedPromos = [...currentPromos]
      updatedPromos.splice(idx, 1)
      const hasPromos = updatedPromos.length > 0
      updateOrder({
        requestedCount: hasPromos ? 'PROMO' : null,
        appliedPromos: updatedPromos,
        appliedPromo: updatedPromos[0] || null,
        isPromo: hasPromos
      })
    }
  }

  const handleSelectPromo = (promo) => {
    handleAddPromo(promo)
  }

  const handleSelectSize = (sizeVal) => {
    const freshPlate = {
      id: Math.random().toString(36).slice(2, 11),
      sauce: null,
      protein: null,
      complement: null,
      baseRecipe: { onion: true, cilantro: true, cream: true }
    }
    if (sizeVal === 'PROMO') {
      updateOrder({
        requestedCount: 'PROMO',
        appliedPromo: null,
        isPromo: true,
        cart: [],
        currentPlate: freshPlate,
      })
    } else {
      updateOrder({
        requestedCount: sizeVal,
        appliedPromo: null,
        isPromo: false,
        cart: [],
        currentPlate: freshPlate,
      })
    }
  }

  const [activeTab, setActiveTab] = useState(() => {
    if (order.requestedCount === 'PROMO') return 'PROMO'
    return 'NORMAL'
  })

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 75) {
      if (activeTab === 'NORMAL') {
        setActiveTab('PROMO')
        toast.dismiss()
        toast('Deslizado a Promociones 🎁', { icon: '✨', duration: 1500 })
      }
    } else if (diff < -75) {
      if (activeTab === 'PROMO') {
        setActiveTab('NORMAL')
        toast.dismiss()
        toast('Deslizado a Menú Normal 🍽️', { icon: '✨', duration: 1500 })
      }
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleShowMoreThanThreePeopleAlert = () => {
    Swal.fire({
      title: '¿Ordenar para más de 3 personas?',
      text: 'Si quieres ordenar comida para más personas, deberás realizar dos pedidos y nuestro sistema lo unificará.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0c2461'
    })
  }

  const isNextDisabled =
    activeTab === 'NORMAL'
      ? !order.requestedCount || order.requestedCount === 'PROMO'
      : !order.appliedPromos || order.appliedPromos.length === 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in select-none">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Escoge tu menú
        </h2>
        <p className="text-sm sm:text-base text-gray-500">
          Desliza o toca para cambiar entre nuestro menú clásico y promociones.
        </p>
      </div>

      {/* Ribbon Segments Control */}
      <div className="flex bg-ui-bg p-1.5 rounded-2xl border border-ui-border max-w-md mx-auto relative select-none">
        <button
          type="button"
          onClick={() => handleTabChange('NORMAL')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === 'NORMAL'
              ? 'bg-[#0c2461] text-white shadow-md'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Menú Normal
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('PROMO')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'PROMO'
              ? 'bg-[#0c2461] text-white shadow-md'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Promociones
          {promotions.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'PROMO' ? 'bg-white text-[#0c2461]' : 'bg-brand-orange text-white'}`}>
              {promotions.length}
            </span>
          )}
        </button>
      </div>

      {/* Swipeable View Container */}
      <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        className="min-h-[320px] transition-all duration-300"
      >
        {activeTab === 'NORMAL' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-black uppercase text-brand-blue tracking-widest mb-1">
                ¿Cuántos platos deseas?
              </h3>
              <p className="text-xs text-ui-muted font-bold">Selecciona el tamaño de tu orden:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {OPTIONS_COUNT.filter(opt => opt.value !== 'PROMO').map((opt) => (
                <OptionCard
                  key={opt.id}
                  title={opt.label}
                  price={opt.price ? `Q${opt.price}` : 'Especial'}
                  description={opt.description}
                  selected={order.requestedCount === opt.value}
                  illustration={opt.illustration}
                  badge={opt.badge}
                  onClick={() => handleSelectSize(opt.value)}
                />
              ))}
            </div>
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleShowMoreThanThreePeopleAlert}
                className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-orange hover:text-[#ff6b35] hover:underline cursor-pointer transition-all duration-300 py-2 px-4 rounded-xl hover:bg-brand-orange/5"
              >
                Quiero ordenar para más de 3 personas
              </button>
            </div>
          </div>
        ) : (

          <div className="space-y-4 animate-fade-in">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-black uppercase text-brand-blue tracking-widest mb-1">
                Promociones Especiales
              </h3>
              <p className="text-xs text-ui-muted font-bold">Ahorra más eligiendo una de nuestras promociones:</p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-ui-muted font-bold animate-pulse">
                Cargando promociones disponibles...
              </div>
            ) : promotions.length === 0 ? (
              <div className="p-12 text-center rounded-[2rem] border-2 border-dashed border-ui-border text-ui-muted font-bold bg-white">
                No hay promociones activas en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promotions.map((promo) => {
                  const selectedQty = (order.appliedPromos || []).filter((p) => p.id === promo.id).length
                  const isSelected = selectedQty > 0

                  return (
                    <div
                      key={promo.id}
                      onClick={() => {
                        if (selectedQty === 0) handleSelectPromo(promo)
                      }}
                      className={`group rounded-3xl border-2 p-5 bg-white transition-all duration-300 relative flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'border-brand-blue ring-4 ring-brand-blue/10 transform scale-[1.02] shadow-xl'
                          : 'cursor-pointer border-ui-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-orange/30'
                      }`}
                    >
                      <div
                        className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all z-20 ${
                          isSelected
                            ? 'bg-brand-blue text-white scale-100 shadow-md font-black text-xs'
                            : 'bg-ui-bg text-transparent border border-ui-border'
                        }`}
                      >
                        {isSelected ? (
                          selectedQty
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="space-y-3 z-10">
                        <span className="bg-gradient-to-r from-brand-orange to-[#ff6b35] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm inline-block">
                          {promo.requestedCount || promo.plates?.length || 2}{' '}
                          Platos
                        </span>
                        <h4 className="font-black text-xl text-brand-blue leading-tight pt-1">
                          {promo.name}
                        </h4>
                        
                        {promo.imageUrl && (
                          <div className="w-full h-32 sm:h-40 relative rounded-2xl overflow-hidden bg-brand-blue/5 flex items-center justify-center mt-2 border border-brand-orange/20 shadow-inner group-hover:border-brand-orange/40 transition-colors">
                            <img
                              src={promo.imageUrl}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 transition-transform duration-700 group-hover:scale-150"
                              aria-hidden="true"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 z-0"></div>
                            <img src={promo.imageUrl} alt={promo.name} className="relative z-10 w-full h-full object-contain p-2 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        )}
                        
                        {(promo.contentDescription || promo.description) && (
                          <p className="text-xs text-[#2d3748] font-bold leading-relaxed bg-[#0c2461]/5 border border-[#0c2461]/10 p-3 rounded-xl whitespace-pre-line">
                            {promo.contentDescription || promo.description}
                          </p>
                        )}

                        {promo.marketing && (
                          <div className="mt-3 bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 p-3 rounded-xl border border-brand-orange/20 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">{promo.marketing}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-ui-border flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-ui-muted tracking-widest">
                          Precio especial
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-brand-blue">
                            Q{Number(promo.promoPrice || 0).toFixed(2)}
                          </span>
                          {selectedQty > 0 && (
                            <div className="flex items-center bg-[#0c2461]/10 border border-[#0c2461]/25 rounded-xl p-1 z-30" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleRemovePromo(promo)}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-blue font-black hover:bg-brand-blue hover:text-white transition-all active:scale-95 shadow-sm"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-black text-brand-blue">{selectedQty}</span>
                              <button
                                type="button"
                                onClick={() => handleAddPromo(promo)}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-blue font-black hover:bg-brand-blue hover:text-white transition-all active:scale-95 shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-8 flex justify-between items-center border-t border-ui-border mt-4">
        <button
          onClick={onBack}
          className="text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center px-4 py-2"
        >
          <span className="mr-2">←</span>{' '}
          <span className="hidden sm:inline">Volver</span>
          <span className="sm:hidden text-xs">Atrás</span>
        </button>
        <div className="hidden lg:block">
          <Button
            className="w-auto min-w-[120px] sm:min-w-[200px]"
            disabled={isNextDisabled}
            onClick={onNext}
          >
            <span className="hidden sm:inline">Siguiente Paso</span>
            <span className="sm:hidden">Siguiente</span>
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SizePage
