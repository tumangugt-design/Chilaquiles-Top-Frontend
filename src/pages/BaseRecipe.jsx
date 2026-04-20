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

      <div className="pt-12 hidden lg:flex items-center justify-between border-t border-gray-100">
        <button onClick={onBack} className="text-gray-500 font-bold hover:text-gray-800 transition-colors px-4 py-2">
          Atrás
        </button>
        <Button className="w-full md:w-auto min-w-[200px]" onClick={onNext}>
          Revisar Plato <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default BaseRecipePage
