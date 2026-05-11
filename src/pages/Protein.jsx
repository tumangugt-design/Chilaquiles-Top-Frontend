import { useEffect, useMemo, useState } from 'react'
import { OPTIONS_PROTEIN } from '../shared/constants/index.jsx'
import { getPublicInventoryOptions } from '../shared/config/api.js'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const ProteinPage = ({ plate, plateNumber, updatePlate, onNext, onBack }) => {
  const [activeNames, setActiveNames] = useState(null)

  useEffect(() => {
    let mounted = true
    getPublicInventoryOptions()
      .then((response) => mounted && setActiveNames(response.data?.activeNames || []))
      .catch(() => mounted && setActiveNames(null))
    return () => { mounted = false }
  }, [])

  const availableOptions = useMemo(() => {
    if (!activeNames) return OPTIONS_PROTEIN
    return OPTIONS_PROTEIN.filter((option) => activeNames.includes(option.value.toLowerCase()))
  }, [activeNames])

  useEffect(() => {
    if (activeNames && plate.protein && !availableOptions.some((option) => option.value === plate.protein)) {
      updatePlate({ protein: null })
    }
  }, [activeNames, availableOptions, plate.protein, updatePlate])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <p className="text-sm sm:text-base font-black text-brand-blue uppercase tracking-widest mb-2">Plato {plateNumber}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3">Elige tu proteína</h2>
        <p className="text-base sm:text-lg text-ui-muted">Incluido en el precio. Calidad premium.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {availableOptions.length === 0 && (
          <div className="md:col-span-3 rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/60 p-8 text-center">
            <p className="font-black text-ui-text">No hay proteínas disponibles por inventario.</p>
            <p className="text-sm text-ui-muted mt-2">El administrador debe activar y abastecer al menos una proteína.</p>
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
            onClick={() => updatePlate({ protein: opt.value })}
          />
        ))}
      </div>

      <div className="pt-8 flex items-center justify-between border-t border-ui-border mt-4">
        <button onClick={onBack} className="text-ui-muted font-bold hover:text-ui-text transition-colors px-4 py-2 flex items-center">
          <span className="mr-2">←</span> <span className="hidden sm:inline">Atrás</span><span className="sm:hidden text-xs">Volver</span>
        </button>
        <Button className="w-auto min-w-[120px] sm:min-w-[200px]" disabled={!plate.protein} onClick={onNext}>
          <span className="hidden sm:inline">Siguiente Paso</span>
          <span className="sm:hidden">Siguiente</span>
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default ProteinPage
