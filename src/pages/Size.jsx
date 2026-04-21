import { OPTIONS_COUNT } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const SizePage = ({ order, updateOrder, onNext, onBack }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">¿Cuánta hambre tienes?</h2>
        <p className="text-base sm:text-lg text-gray-500">Selecciona la cantidad de platos de tu orden para empezar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {OPTIONS_COUNT.map((opt) => (
          <OptionCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            price={`Q${opt.price}`}
            selected={order.requestedCount === opt.value}
            illustration={opt.illustration}
            badge={opt.badge}
            onClick={() => updateOrder({ requestedCount: opt.value })}
          />
        ))}
      </div>

      <div className="pt-8 hidden lg:flex justify-between items-center border-t border-ui-border">
        <button
          onClick={onBack}
          className="text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center"
        >
          <span className="mr-2">←</span> Volver
        </button>
        <Button className="w-full md:w-auto min-w-[200px]" disabled={!order.requestedCount} onClick={onNext}>
          Siguiente Paso <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SizePage
