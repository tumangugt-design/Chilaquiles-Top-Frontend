// ============================================
// PÁGINA: BaseRecipe (Personalizar base)
// ============================================

import { OPTIONS_BASE_RECIPE } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const BaseRecipePage = ({ plate, updatePlate, onNext, onBack }) => {
  const toggleBase = (key) => {
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
        <h2 className="text-2xl font-bold mb-2">Personaliza la base</h2>
        <p className="text-sm sm:text-base text-gray-500">
          Toca algún ingrediente si deseas eliminarlo. Vienen incluidos por defecto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {OPTIONS_BASE_RECIPE.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            illustration={opt.illustration}
            selected={plate.baseRecipe[opt.id]}
            onClick={() => toggleBase(opt.id)}
            multiSelect
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
