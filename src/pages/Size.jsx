import { useState } from 'react'
import { OPTIONS_COUNT } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import Button from '../components/ui/Button.jsx'

const SizePage = ({ order, updateOrder, onNext, onBack }) => {
  const [showHotWarning, setShowHotWarning] = useState(false)

  if (!order.sauceTemperature) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ui-bg/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-ui-card w-full max-w-lg p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-ui-border flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2">¿Cómo quieres recibir tu salsa?</h2>
            <p className="text-ui-muted text-sm sm:text-base">Decide cómo disfrutarás tus chilaquiles.</p>
          </div>

          {!showHotWarning ? (
            <div className="space-y-4">
              <button
                onClick={() => updateOrder({ sauceTemperature: 'FRIO' })}
                className="w-full text-left p-4 rounded-2xl border-2 border-brand-blue/30 bg-brand-blue/5 hover:bg-brand-blue/10 transition-all shadow-md group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg">La mejor experiencia 🔥</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🧊</div>
                  <div>
                    <h3 className="font-black text-lg text-brand-blue mb-1">Frío (Para calentar en casa)</h3>
                    <p className="text-sm font-medium text-ui-muted">Llega frío. Lo calientas en casa para que el queso se derrita y los totopos queden súper crujientes. ¡El secreto de los expertos!</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowHotWarning(true)}
                className="w-full text-left p-4 rounded-2xl border-2 border-ui-border hover:border-ui-border/80 transition-all opacity-80"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ui-bg rounded-full flex items-center justify-center text-2xl shadow-sm">♨️</div>
                  <div>
                    <h3 className="font-black text-lg text-ui-text mb-1">Caliente</h3>
                    <p className="text-sm text-ui-muted">Aunque puede que llegue tibio 😢 (Dependiendo del tráfico y distancia).</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl mb-3">⏰</div>
                <h3 className="font-black text-xl text-red-500 mb-2">+12 Minutos Extra</h3>
                <p className="text-ui-text text-sm">Al seleccionar salsa caliente, tu pedido tendrá un <strong>tiempo de espera adicional de 12 minutos</strong> para prepararlo al momento.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={() => updateOrder({ sauceTemperature: 'CALIENTE' })} className="w-full !bg-red-500 shadow-red-500/30">Sí, deseo continuar</Button>
                <Button variant="secondary" onClick={() => setShowHotWarning(false)} className="w-full">No, regresar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

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

      <div className="pt-8 flex justify-between items-center border-t border-ui-border mt-4">
        <button
          onClick={onBack}
          className="text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center px-4 py-2"
        >
          <span className="mr-2">←</span> <span className="hidden sm:inline">Volver</span><span className="sm:hidden text-xs">Atrás</span>
        </button>
        <Button 
          className="w-auto min-w-[120px] sm:min-w-[200px]" 
          disabled={!order.requestedCount} 
          onClick={onNext}
        >
          <span className="hidden sm:inline">Siguiente Paso</span>
          <span className="sm:hidden">Siguiente</span>
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SizePage
