import { useEffect, useMemo, useState } from 'react'
import { OPTIONS_BASE_RECIPE } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import { buildInventoryStatusMap, getProductAvailability } from '../shared/utils/inventoryAvailability.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const baseNameById = {
  cream: 'crema',
  onion: 'cebolla',
  cilantro: 'cilantro',
}

const BaseRecipePage = ({ plate, plateNumber, updatePlate, onNext, onBack, showUnavailable = false }) => {
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

  const toggleBase = (key, canSelect = true) => {
    if (!canSelect) return
    updatePlate({
      baseRecipe: {
        ...plate.baseRecipe,
        [key]: !plate.baseRecipe[key],
      },
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <Button className="w-auto min-w-[120px] sm:min-w-[200px]" onClick={onNext}>
          <span className="hidden sm:inline">Revisar Plato</span>
          <span className="sm:hidden">Revisar</span>
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default BaseRecipePage
