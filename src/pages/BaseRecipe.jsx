import { useEffect, useMemo, useState } from 'react'
import { OPTIONS_BASE_RECIPE, OPTIONS_SAUCE, OPTIONS_PROTEIN } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import { buildInventoryStatusMap, getProductAvailability } from '../shared/utils/inventoryAvailability.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const baseNameById = {
  cream: 'crema',
  onion: 'cebolla',
  cilantro: 'cilantro',
}

const BaseRecipePage = ({ plate, plateNumber, updatePlate, onNext, onBack, showUnavailable = false, order = null, updateOrder = null }) => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [optionsLoaded, setOptionsLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    getPublicInventoryOptions()
      .then((response) => {
        if (mounted) {
          setInventoryItems(response.data?.items || [])
          setOptionsLoaded(true)
        }
      })
      .catch(() => {
        if (mounted) {
          setInventoryItems([])
          setOptionsLoaded(true)
        }
      })
    return () => { mounted = false }
  }, [])

  const availableOptions = useMemo(() => {
    if (!optionsLoaded) return []
    const statusMap = buildInventoryStatusMap(inventoryItems)
    const isCebolaCaramelizada = plate.complement === 'CEBOLLA_CARAMELIZADA' || plate.complement === 'CEBOLLA CARAMELIZADA'
    return OPTIONS_BASE_RECIPE
      .filter((option) => !(isCebolaCaramelizada && option.id === 'onion'))
      .map((option) => ({ ...option, availability: getProductAvailability(statusMap, baseNameById[option.id]) }))
      .filter((option) => showUnavailable || option.availability.available)
  }, [inventoryItems, optionsLoaded, showUnavailable, plate.complement])

  useEffect(() => {
    if (!optionsLoaded) return
    const unavailableSelected = availableOptions
      .filter((option) => !option.availability.available && plate.baseRecipe?.[option.id])
      .map((option) => option.id)

    const hiddenUnavailable = OPTIONS_BASE_RECIPE
      .filter((option) => !availableOptions.some((available) => available.id === option.id))
      .filter((option) => plate.baseRecipe?.[option.id])
      .map((option) => option.id)

    const keysToDisable = [...new Set([...unavailableSelected, ...hiddenUnavailable])]
    if (keysToDisable.length === 0) return

    updatePlate({
      baseRecipe: {
        ...plate.baseRecipe,
        ...Object.fromEntries(keysToDisable.map((key) => [key, false])),
      },
    })
  }, [optionsLoaded, availableOptions, plate.baseRecipe, updatePlate])

  // Cuando el complemento ya NO es Cebolla Caramelizada, vuelve a activar la cebolla cruda por defecto
  useEffect(() => {
    const isCebolla = plate.complement === 'CEBOLLA_CARAMELIZADA' || plate.complement === 'CEBOLLA CARAMELIZADA'
    if (!isCebolla && plate.baseRecipe?.onion === false) {
      updatePlate({ baseRecipe: { ...plate.baseRecipe, onion: true } })
    }
  }, [plate.complement])

  const toggleBase = (key, canSelect = true) => {
    if (!canSelect) return
    updatePlate({
      baseRecipe: {
        ...plate.baseRecipe,
        [key]: !plate.baseRecipe[key],
      },
    })
  }

  const handleTogglePromoBase = (plateIndex, key) => {
    if (plateIndex === order.cart.length) {
      const isSelected = plate.baseRecipe?.[key] !== false
      updatePlate({
        baseRecipe: {
          ...plate.baseRecipe,
          [key]: !isSelected
        }
      })
    } else {
      const nextCart = [...order.cart]
      const targetPlate = { ...nextCart[plateIndex] }
      const isSelected = targetPlate.baseRecipe?.[key] !== false
      targetPlate.baseRecipe = {
        ...targetPlate.baseRecipe,
        [key]: !isSelected
      }
      nextCart[plateIndex] = targetPlate
      updateOrder({ cart: nextCart })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {order?.isPromo ? (
        <>
          <div className="mb-4 sm:mb-8">
            <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">
              Promoción Especial
            </p>
            <h2 className="text-2xl font-bold mb-2">Personaliza la base por plato</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Desactiva Crema, Cilantro o Cebolla (CCC) en los platos que prefieras. Vienen incluidos por defecto.
            </p>
          </div>

          <div className="space-y-6">
            {[...order.cart, order.currentPlate].filter(Boolean).map((plateItem, pIdx) => {
              const sauceOpt = OPTIONS_SAUCE.find(o => o.value === plateItem.sauce)
              const proteinOpt = OPTIONS_PROTEIN.find(o => o.value === plateItem.protein)
              const sauceLabel = sauceOpt?.label || plateItem.sauce
              const proteinLabel = proteinOpt?.label || plateItem.protein
              
              return (
                <div key={plateItem.id || pIdx} className="bg-ui-card rounded-[2rem] border border-ui-border p-5 sm:p-6 space-y-4 shadow-sm bg-white">
                  <div className="flex items-center gap-2 border-b border-ui-border pb-3">
                    <div className="flex -space-x-1 shrink-0">
                      {sauceOpt?.illustration && (
                        <div className="w-6 h-6 border-2 border-white rounded-full bg-white overflow-hidden shadow-sm scale-90 shrink-0 flex items-center justify-center">
                          {sauceOpt.illustration}
                        </div>
                      )}
                      {proteinOpt?.illustration && (
                        <div className="w-6 h-6 border-2 border-white rounded-full bg-white overflow-hidden shadow-sm scale-90 shrink-0 flex items-center justify-center">
                          {proteinOpt.illustration}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-black text-brand-blue uppercase tracking-widest">
                      Plato {pIdx + 1}: <span className="text-ui-text lowercase font-bold text-xs">({sauceLabel.toLowerCase()} • {proteinLabel.toLowerCase()})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {OPTIONS_BASE_RECIPE.map((opt) => {
                      const isSelected = plateItem.baseRecipe?.[opt.id] !== false
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleTogglePromoBase(pIdx, opt.id)}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 flex items-center gap-3 select-none ${
                            isSelected
                              ? 'border-brand-blue bg-brand-blue/5 shadow-sm'
                              : 'border-ui-border bg-ui-bg hover:border-ui-border/80'
                          }`}
                        >
                          <div className="text-xl">{opt.illustration}</div>
                          <div className="flex-1 text-left">
                            <p className="font-black text-xs text-ui-text">{opt.label}</p>
                            <p className="text-[10px] text-ui-muted font-semibold mt-0.5">{opt.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-ui-border text-transparent'
                          }`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 sm:mb-8">
            <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">
              Plato {plateNumber}
            </p>
            <h2 className="text-2xl font-bold mb-2">Personaliza la base</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Toca algún ingrediente si deseas eliminarlo. Vienen incluidos por defecto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {optionsLoaded && availableOptions.length === 0 && (
              <div className="sm:col-span-3 rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/60 p-8 text-center">
                <p className="font-black text-ui-text">No hay ingredientes de base disponibles por inventario.</p>
                <p className="text-sm text-ui-muted mt-2">El administrador debe activar y abastecer crema, cebolla o cilantro.</p>
              </div>
            )}
            {availableOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                title={opt.label}
                description={opt.description}
                illustration={opt.illustration}
                selected={Boolean(plate.baseRecipe[opt.id]) && opt.availability.available}
                onClick={() => toggleBase(opt.id, opt.availability.available)}
                multiSelect
                disabled={!opt.availability.available}
                availabilityStatus={opt.availability.availabilityStatus}
                availabilityLabel={opt.availability.availabilityLabel}
                availabilityDetail={opt.availability.availabilityDetail}
              />
            ))}
          </div>
        </>
      )}

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <Button className="w-auto min-w-[120px] sm:min-w-[200px]" onClick={onNext}>
          <span className="hidden sm:inline">Siguiente Paso</span>
          <span className="sm:hidden">Siguiente</span>
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default BaseRecipePage
