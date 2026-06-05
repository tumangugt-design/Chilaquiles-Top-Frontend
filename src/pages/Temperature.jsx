import { useState } from 'react'
import Button from '../components/ui/Button.jsx'

const TemperaturePage = ({ order, updateOrder, onNext, onBack }) => {
  const [selected, setSelected] = useState(order.sauceTemperature || '')

  const handleSelect = (temp) => {
    setSelected(temp)
    updateOrder({ sauceTemperature: temp })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2 sm:mb-3">
          ¿Cómo quieres recibir tu salsa?
        </h2>
        <p className="text-base sm:text-lg text-ui-muted">
          Decide cómo disfrutarás tus chilaquiles.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Option 1: FRIO */}
        <button
          type="button"
          onClick={() => handleSelect('FRIO')}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden bg-ui-card ${
            selected === 'FRIO'
              ? 'border-brand-blue ring-4 ring-brand-blue/10 transform scale-[1.01] shadow-lg'
              : 'border-ui-border hover:border-brand-blue/40 shadow-sm'
          }`}
        >
          <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg">
            La mejor experiencia 🔥
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center text-3xl shadow-sm border border-blue-100/20">
              🧊
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-brand-blue mb-1">
                Frío (Para calentar en casa)
              </h3>
              <p className="text-sm font-medium text-ui-muted leading-relaxed">
                Llega frío. Lo calientas en casa para que el queso se derrita y los totopos queden súper crujientes. ¡El secreto de los expertos!
              </p>
            </div>
          </div>
        </button>

        {/* Option 2: CALIENTE */}
        <button
          type="button"
          onClick={() => handleSelect('CALIENTE')}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative bg-ui-card ${
            selected === 'CALIENTE'
              ? 'border-brand-blue ring-4 ring-brand-blue/10 transform scale-[1.01] shadow-lg'
              : 'border-ui-border hover:border-brand-blue/40 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-3xl shadow-sm border border-red-100/20">
              ♨️
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-ui-text mb-1">
                Caliente
              </h3>
              <p className="text-sm font-medium text-ui-muted leading-relaxed">
                Aunque puede que llegue tibio 😢 (Dependiendo del tráfico y distancia).
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Inline Warning for Caliente */}
      {selected === 'CALIENTE' && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-left animate-slide-up flex gap-4 items-start">
          <div className="text-3xl shrink-0">⏰</div>
          <div>
            <h4 className="font-black text-base text-red-500 mb-1">
              +12 Minutos Extra
            </h4>
            <p className="text-ui-text text-sm font-medium leading-relaxed">
              Al seleccionar salsa caliente, tu pedido tendrá un <strong>tiempo de espera adicional de 12 minutos</strong> para prepararlo al momento.
            </p>
          </div>
        </div>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="pt-8 flex justify-between items-center border-t border-ui-border mt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center px-4 py-2"
        >
          <span className="mr-2">←</span> <span className="hidden sm:inline">Volver</span><span className="sm:hidden text-xs">Atrás</span>
        </button>
        <div className="hidden lg:block">
          <Button 
            className="w-auto min-w-[120px] sm:min-w-[200px]" 
            disabled={!selected} 
            onClick={onNext}
          >
            <span className="hidden sm:inline">Siguiente Paso</span>
            <span className="sm:hidden">Siguiente</span>
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TemperaturePage
