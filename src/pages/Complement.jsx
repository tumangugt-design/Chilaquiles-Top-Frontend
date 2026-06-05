import { useEffect, useMemo, useState } from 'react'
import { OPTIONS_COMPLEMENT, getPromoConstraint, normalizeComplementValue } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import { buildInventoryStatusMap, getProductAvailability } from '../shared/utils/inventoryAvailability.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const complementNameById = {
  AGUACATE: 'aguacate',
  CEBOLLA_CARAMELIZADA: 'cebolla caramelizada',
  QUESO_EXTRA: 'queso extra',
}

const ComplementPage = ({ plate, plateNumber, updatePlate, onNext, onBack, showUnavailable = false, appliedPromo }) => {
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

  const promoComplement = normalizeComplementValue(getPromoConstraint(appliedPromo, 'complement')) || 'ALL'

  const availableOptions = useMemo(() => {
    if (!optionsLoaded) return []
    const statusMap = buildInventoryStatusMap(inventoryItems)
    return OPTIONS_COMPLEMENT
      .map((option) => {
        const availability = getProductAvailability(statusMap, complementNameById[option.id])
        const optionValue = normalizeComplementValue(option.value)
        const isPromoMismatch = appliedPromo && promoComplement !== 'ALL' && optionValue !== promoComplement
        return {
          ...option,
          availability: isPromoMismatch
            ? { available: false, availabilityStatus: 'inactive', availabilityLabel: 'No aplica a promo' }
            : availability,
          promoBadge: appliedPromo && optionValue === promoComplement ? 'Requerido por Promo 🎁' : null
        }
      })
      .filter((option) => showUnavailable || option.availability.available || (appliedPromo && promoComplement !== 'ALL'))
  }, [inventoryItems, optionsLoaded, showUnavailable, appliedPromo, promoComplement])

  useEffect(() => {
    if (optionsLoaded && appliedPromo && promoComplement !== 'ALL') {
      updatePlate({ complement: promoComplement })
    } else if (optionsLoaded && plate.complement && !availableOptions.some((option) => normalizeComplementValue(option.value) === normalizeComplementValue(plate.complement) && option.availability.available)) {
      updatePlate({ complement: null })
    }
  }, [optionsLoaded, availableOptions, plate.complement, updatePlate, appliedPromo, promoComplement])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">Plato {plateNumber}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3">Elige tu complemento</h2>
        <p className="text-base sm:text-lg text-ui-muted">El toque final para elevar el sabor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {optionsLoaded && availableOptions.length === 0 && (
          <div className="md:col-span-3 rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/60 p-8 text-center">
            <p className="font-black text-ui-text">No hay complementos disponibles por inventario.</p>
            <p className="text-sm text-ui-muted mt-2">El administrador debe activar y abastecer al menos un complemento con el stock suficiente.</p>
          </div>
        )}
        {availableOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={normalizeComplementValue(plate.complement) === normalizeComplementValue(opt.value)}
            illustration={opt.illustration}
            disabled={!opt.availability.available}
            availabilityStatus={opt.availability.availabilityStatus}
            availabilityLabel={opt.promoBadge || opt.availability.availabilityLabel}
            availabilityDetail={opt.availability.availabilityDetail}
            onClick={() => updatePlate({ complement: opt.value })}
          />
        ))}
      </div>

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <div className="hidden lg:block">
          <Button className="w-auto min-w-[120px] sm:min-w-[200px]" disabled={!plate.complement} onClick={onNext}>
            <span className="hidden sm:inline">Siguiente Paso</span>
            <span className="sm:hidden">Siguiente</span>
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ComplementPage
