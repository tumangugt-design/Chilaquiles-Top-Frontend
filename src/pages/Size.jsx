import { useState, useEffect } from 'react'
import { OPTIONS_COUNT, OPTIONS_SAUCE, OPTIONS_PROTEIN } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'
import { getPromotions } from '../shared/config/api.js'

const SizePage = ({ order, updateOrder, onNext, onBack }) => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (order.requestedCount === 'PROMO') {
      setLoading(true)
      getPromotions()
        .then((res) => {
          const activePromos = (res.data || []).filter((p) => p.isActive)
          setPromotions(activePromos)
        })
        .catch(() => {
          setPromotions([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [order.requestedCount])

  const handleSelectPromo = (promo) => {
    const plates = promo.plates || []
    if (plates.length > 0) {
      const formattedPlates = plates.map((p) => ({
        id: Math.random().toString(36).slice(2, 11),
        sauce: p.sauce,
        protein: p.protein,
        complement: p.complement,
        baseRecipe: {
          cream: p.baseRecipe?.cream !== false,
          onion: p.baseRecipe?.onion !== false,
          cilantro: p.baseRecipe?.cilantro !== false,
        },
      }))

      const cart = formattedPlates.slice(0, -1)
      const currentPlate = formattedPlates[formattedPlates.length - 1]

      updateOrder({
        requestedCount: 'PROMO',
        appliedPromo: promo,
        isPromo: true,
        cart,
        currentPlate,
      })
    } else {
      // Legacy fallback
      const count = Number(promo.requestedCount || promo.platesCount || 2)
      const singleRecipe = {
        id: Math.random().toString(36).slice(2, 11),
        sauce: promo.recipe?.sauce || 'ROJA',
        protein: promo.recipe?.protein || 'POLLO',
        complement: promo.recipe?.complement || 'CEBOLLA_CARAMELIZADA',
        baseRecipe: {
          cream: promo.recipe?.baseRecipe?.cream !== false,
          onion: promo.recipe?.baseRecipe?.onion !== false,
          cilantro: promo.recipe?.baseRecipe?.cilantro !== false,
        },
      }
      const formattedPlates = Array(count)
        .fill(null)
        .map(() => ({
          ...singleRecipe,
          id: Math.random().toString(36).slice(2, 11),
        }))
      const cart = formattedPlates.slice(0, -1)
      const currentPlate = formattedPlates[formattedPlates.length - 1]

      updateOrder({
        requestedCount: 'PROMO',
        appliedPromo: promo,
        isPromo: true,
        cart,
        currentPlate,
      })
    }
  }

  const handleSelectSize = (sizeVal) => {
    if (sizeVal === 'PROMO') {
      updateOrder({
        requestedCount: 'PROMO',
        appliedPromo: null,
        isPromo: true,
        cart: [],
      })
    } else {
      updateOrder({
        requestedCount: sizeVal,
        appliedPromo: null,
        isPromo: false,
        cart: [],
      })
    }
  }

  const isNextDisabled =
    !order.requestedCount ||
    (order.requestedCount === 'PROMO' && !order.appliedPromo)

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">
          ¿Cuánta hambre tienes?
        </h2>
        <p className="text-base sm:text-lg text-gray-500">
          Selecciona la cantidad de platos o elige una de nuestras promociones.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {OPTIONS_COUNT.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            price={opt.price ? `Q${opt.price}` : 'Especial'}
            selected={order.requestedCount === opt.value}
            illustration={opt.illustration}
            badge={opt.badge}
            onClick={() => handleSelectSize(opt.value)}
          />
        ))}
      </div>

      {order.requestedCount === 'PROMO' && (
        <div className="space-y-4 animate-fade-in mt-6 border-t border-ui-border pt-6">
          <h3 className="text-lg font-black uppercase text-brand-blue tracking-widest">
            Promociones Disponibles
          </h3>
          {loading ? (
            <div className="p-8 text-center text-ui-muted font-bold">
              Cargando promociones...
            </div>
          ) : promotions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-ui-border text-ui-muted font-bold bg-white">
              No hay promociones activas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promotions.map((promo) => {
                const isSelected = order.appliedPromo?.id === promo.id

                return (
                  <div
                    key={promo.id}
                    onClick={() => handleSelectPromo(promo)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 bg-white transition-all duration-300 relative ${
                      isSelected
                        ? 'border-brand-blue ring-4 ring-brand-blue/10 transform scale-[1.02] shadow-lg'
                        : 'border-ui-border shadow-sm hover:shadow-md hover:border-ui-border/80'
                    }`}
                  >
                    {/* Checked Indicator */}
                    <div
                      className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand-blue text-white scale-100'
                          : 'bg-ui-bg text-transparent border border-ui-border'
                      }`}
                    >
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
                    </div>

                    <div>
                      <span className="bg-brand-orange text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {promo.requestedCount || promo.plates?.length || 2}{' '}
                        Platos
                      </span>
                      <h4 className="font-black text-lg text-ui-text mt-2 leading-tight">
                        {promo.name}
                      </h4>
                      {promo.description && (
                        <p className="text-xs text-ui-muted font-medium mt-1 leading-normal">
                          {promo.description}
                        </p>
                      )}
                    </div>

                    {/* Display Plates Visual Summary */}
                    {promo.plates && promo.plates.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {promo.plates.map((plate, pIdx) => {
                          const sauceOpt = OPTIONS_SAUCE.find(
                            (o) => o.value === plate.sauce
                          )
                          const proteinOpt = OPTIONS_PROTEIN.find(
                            (o) => o.value === plate.protein
                          )
                          return (
                            <div
                              key={pIdx}
                              className="flex items-center gap-1.5 bg-ui-bg/60 border border-ui-border/80 rounded-xl px-2 py-1"
                            >
                              {sauceOpt?.illustration && (
                                <div className="w-5 h-5 scale-90 shrink-0">
                                  {sauceOpt.illustration}
                                </div>
                              )}
                              {proteinOpt?.illustration && (
                                <div className="w-5 h-5 scale-90 shrink-0">
                                  {proteinOpt.illustration}
                                </div>
                              )}
                              <span className="text-[10px] font-black text-ui-text uppercase tracking-wider">
                                Plato {pIdx + 1}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-ui-border flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-ui-muted tracking-widest">
                        Precio especial
                      </span>
                      <span className="text-xl font-black text-brand-blue">
                        Q{Number(promo.promoPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="pt-8 flex justify-between items-center border-t border-ui-border mt-4">
        <button
          onClick={onBack}
          className="text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center px-4 py-2"
        >
          <span className="mr-2">←</span>{' '}
          <span className="hidden sm:inline">Volver</span>
          <span className="sm:hidden text-xs">Atrás</span>
        </button>
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
  )
}

export default SizePage
