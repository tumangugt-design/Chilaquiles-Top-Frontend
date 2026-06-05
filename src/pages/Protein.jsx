import React, { useEffect, useMemo, useState } from 'react'
import { OPTIONS_PROTEIN, getPromoConstraint, getOptionObject } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import { buildInventoryStatusMap, getProductAvailability } from '../shared/utils/inventoryAvailability.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'
import { IllustrationSteak } from '../components/illustrations/IngredientIllustrations.jsx'

const ProteinPage = ({ plate, plateNumber, updatePlate, onNext, onBack, showUnavailable = false, appliedPromo }) => {
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

  const promoProtein = getPromoConstraint(appliedPromo, 'protein')

  const availableOptions = useMemo(() => {
    if (!optionsLoaded) return []
    const statusMap = buildInventoryStatusMap(inventoryItems)

    // Dynamically merge proteins from inventory database
    const dynamicProteins = inventoryItems.filter(item => item.category === 'Proteínas')
    const allProteins = [...OPTIONS_PROTEIN]

    dynamicProteins.forEach(item => {
      const optionValue = item.name.toUpperCase().replace(/\s+/g, '_')
      const exists = allProteins.some(opt => opt.value === optionValue)
      if (!exists) {
        const optionObj = getOptionObject(optionValue, 'Proteínas', inventoryItems)
        allProteins.push({
          ...optionObj,
          isDynamic: true,
          dbName: item.name
        })
      }
    })

    return allProteins
      .map((option) => {
        const availability = getProductAvailability(statusMap, option.dbName || option.value.toLowerCase())
        const isPromoMismatch = appliedPromo && promoProtein !== 'ALL' && option.value !== promoProtein
        return {
          ...option,
          availability: isPromoMismatch
            ? { available: false, availabilityStatus: 'inactive', availabilityLabel: 'No aplica a promo' }
            : availability,
          promoBadge: appliedPromo && promoProtein === option.value ? 'Requerido por Promo 🎁' : null
        }
      })
      .filter((option) => showUnavailable || option.availability.available || (appliedPromo && promoProtein !== 'ALL'))
  }, [inventoryItems, optionsLoaded, showUnavailable, appliedPromo, promoProtein])

  useEffect(() => {
    if (optionsLoaded && appliedPromo && promoProtein !== 'ALL') {
      updatePlate({ protein: promoProtein })
    } else if (optionsLoaded && plate.protein && !availableOptions.some((option) => option.value === plate.protein && option.availability.available)) {
      updatePlate({ protein: null })
    }
  }, [optionsLoaded, availableOptions, plate.protein, updatePlate, appliedPromo, promoProtein])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">Plato {plateNumber}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3">Elige tu proteína</h2>
        <p className="text-base sm:text-lg text-ui-muted">Incluido en el precio. Calidad premium.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {optionsLoaded && availableOptions.length === 0 && (
          <div className="md:col-span-3 rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/60 p-8 text-center">
            <p className="font-black text-ui-text">No hay proteínas disponibles por inventario.</p>
            <p className="text-sm text-ui-muted mt-2">El administrador debe activar y abastecer al menos una proteína con el stock suficiente.</p>
          </div>
        )}
        {availableOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={plate.protein === opt.value}
            illustration={opt.illustration}
            spicyLevel={opt.spicyLevel}
            disabled={!opt.availability.available}
            availabilityStatus={opt.availability.availabilityStatus}
            availabilityLabel={opt.promoBadge || opt.availability.availabilityLabel}
            availabilityDetail={opt.availability.availabilityDetail}
            onClick={() => updatePlate({ protein: opt.value })}
          />
        ))}
      </div>

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <div className="hidden lg:block">
          <Button className="w-auto min-w-[120px] sm:min-w-[200px]" disabled={!plate.protein} onClick={onNext}>
            <span className="hidden sm:inline">Siguiente Paso</span>
            <span className="sm:hidden">Siguiente</span>
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProteinPage
