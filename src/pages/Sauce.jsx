import React, { useEffect, useMemo, useState } from 'react'
import { OPTIONS_SAUCE, SAUCE_PORTIONS, getPromoConstraint } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import { buildInventoryStatusMap, combineAvailabilities, getProductAvailability } from '../shared/utils/inventoryAvailability.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'
import { IllustrationRoja } from '../components/illustrations/SauceIllustrations.jsx'

const getSauceAvailability = (statusMap, option) => {
  if (option.value === 'ROJA') return getProductAvailability(statusMap, 'salsa roja', SAUCE_PORTIONS.fullMl, { amount: SAUCE_PORTIONS.fullOz, unit: 'oz' })
  if (option.value === 'VERDE') return getProductAvailability(statusMap, 'salsa verde', SAUCE_PORTIONS.fullMl, { amount: SAUCE_PORTIONS.fullOz, unit: 'oz' })
  if (option.value === 'DIVORCIADOS') {
    return combineAvailabilities(
      [
        getProductAvailability(statusMap, 'salsa roja', SAUCE_PORTIONS.halfMl, { amount: SAUCE_PORTIONS.halfOz, unit: 'oz' }),
        getProductAvailability(statusMap, 'salsa verde', SAUCE_PORTIONS.halfMl, { amount: SAUCE_PORTIONS.halfOz, unit: 'oz' }),
      ],
      'Requiere 4 oz de salsa roja y 4 oz de salsa verde.'
    )
  }
  return getProductAvailability(statusMap, option.dbName || option.value.toLowerCase().replace(/_/g, ' '))
}

const SaucePage = ({ plate, plateNumber, updatePlate, onNext, onBack, showUnavailable = false, appliedPromo }) => {
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

  const promoSauce = getPromoConstraint(appliedPromo, 'sauce')

  const availableOptions = useMemo(() => {
    if (!optionsLoaded) return []
    const statusMap = buildInventoryStatusMap(inventoryItems)

    // Dynamically merge sauces from inventory database
    const dynamicSauces = inventoryItems.filter(item => item.category === 'Salsas')
    const allSauces = [...OPTIONS_SAUCE]

    dynamicSauces.forEach(item => {
      if (item.name === 'salsa roja' || item.name === 'salsa verde') return

      const optionValue = item.name.toUpperCase().replace(/\s+/g, '_')
      const exists = allSauces.some(opt => opt.value === optionValue)
      if (!exists) {
        const capitalizedLabel = item.name
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        allSauces.push({
          id: optionValue,
          label: capitalizedLabel,
          value: optionValue,
          description: `Salsa ${item.name} para tus chilaquiles.`,
          illustration: React.createElement(IllustrationRoja),
          isDynamic: true,
          dbName: item.name
        })
      }
    })

    return allSauces
      .map((option) => {
        const availability = getSauceAvailability(statusMap, option)
        const isPromoMismatch = appliedPromo && promoSauce !== 'ALL' && option.value !== promoSauce
        return {
          ...option,
          availability: isPromoMismatch
            ? { available: false, availabilityStatus: 'inactive', availabilityLabel: 'No aplica a promo' }
            : availability,
          promoBadge: appliedPromo && promoSauce === option.value ? 'Requerido por Promo 🎁' : null
        }
      })
      .filter((option) => showUnavailable || option.availability.available || (appliedPromo && promoSauce !== 'ALL'))
  }, [inventoryItems, optionsLoaded, showUnavailable, appliedPromo, promoSauce])

  useEffect(() => {
    if (optionsLoaded && appliedPromo && promoSauce !== 'ALL') {
      updatePlate({ sauce: promoSauce })
    } else if (optionsLoaded && plate.sauce && !availableOptions.some((option) => option.value === plate.sauce && option.availability.available)) {
      updatePlate({ sauce: null })
    }
  }, [optionsLoaded, availableOptions, plate.sauce, updatePlate, appliedPromo, promoSauce])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">
          Plato {plateNumber}
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">Elige tu salsa</h2>
        <p className="text-base sm:text-lg text-gray-500">El alma de tus chilaquiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {optionsLoaded && availableOptions.length === 0 && (
          <div className="md:col-span-2 rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/60 p-8 text-center">
            <p className="font-black text-ui-text">No hay salsas disponibles por inventario.</p>
            <p className="text-sm text-ui-muted mt-2">El administrador debe activar y abastecer al menos una salsa con el stock suficiente.</p>
          </div>
        )}
        {availableOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={plate.sauce === opt.value}
            illustration={opt.illustration}
            badge={opt.badge}
            disabled={!opt.availability.available}
            availabilityStatus={opt.availability.availabilityStatus}
            availabilityLabel={opt.promoBadge || opt.availability.availabilityLabel}
            availabilityDetail={opt.availability.availabilityDetail}
            onClick={() => updatePlate({ sauce: opt.value })}
          />
        ))}
      </div>

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <div className="hidden lg:block">
          <Button className="w-auto min-w-[120px] sm:min-w-[200px]" disabled={!plate.sauce} onClick={onNext}>
            <span className="hidden sm:inline">Siguiente Paso</span>
            <span className="sm:hidden">Siguiente</span>
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SaucePage
