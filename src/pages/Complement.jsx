// ============================================
// PÁGINA: Complement (Complemento)
// ============================================

import { OPTIONS_COMPLEMENT } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const ComplementPage = ({ plate, updatePlate, onNext, onBack }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">Elige tu complemento</h2>
        <p className="text-base sm:text-lg text-gray-500">El toque final para elevar el sabor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {OPTIONS_COMPLEMENT.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={plate.complement === opt.value}
            illustration={opt.illustration}
            onClick={() => updatePlate({ complement: opt.value })}
          />
        ))}
      </div>

      <div className="pt-12 hidden lg:flex items-center justify-between border-t border-gray-100">
        <button onClick={onBack} className="text-gray-500 font-bold hover:text-gray-800 transition-colors px-4 py-2">
          Atrás
        </button>
        <Button className="w-full md:w-auto min-w-[200px]" disabled={!plate.complement} onClick={onNext}>
          Siguiente Paso <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default ComplementPage
