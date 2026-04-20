// ============================================
// PÁGINA: Sauce (Salsa)
// ============================================

import { OPTIONS_SAUCE } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const SaucePage = ({ plate, updatePlate, onNext, onBack }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">Elige tu salsa</h2>
        <p className="text-base sm:text-lg text-gray-500">El alma de tus chilaquiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {OPTIONS_SAUCE.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={plate.sauce === opt.value}
            illustration={opt.illustration}
            badge={opt.badge}
            onClick={() => updatePlate({ sauce: opt.value })}
          />
        ))}
      </div>

      <div className="pt-12 hidden lg:flex items-center justify-between border-t border-gray-100">
        <button onClick={onBack} className="text-gray-500 font-bold hover:text-gray-800 transition-colors px-4 py-2">
          Atrás
        </button>
        <Button className="w-full md:w-auto min-w-[200px]" disabled={!plate.sauce} onClick={onNext}>
          Siguiente Paso <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SaucePage
