

import { OPTIONS_PROTEIN } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const ProteinPage = ({ plate, updatePlate, onNext, onBack }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">Elige tu proteína</h2>
        <p className="text-base sm:text-lg text-gray-500">Incluido en el precio. Calidad premium.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {OPTIONS_PROTEIN.map((opt) => (
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
