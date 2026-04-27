import { useState } from 'react'
import { calculateTotal, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT, formatBaseRecipe } from '../../shared/constants/index.jsx'
import Button from '../ui/Button.jsx'

const OrderSummary = ({ order, currentStep, onNext, onAddAnother }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (currentStep === 'LOCATION' || currentStep === 'CONFIRMATION') return null

  const currentPlate = order.currentPlate
  const totalItems = order.cart.length + 1
  const grandTotal = calculateTotal(Math.max(order.requestedCount || 0, totalItems))
  const MAX_PLATES = 4

  const canContinue = () => {
    switch (currentStep) {
      case 'SIZE':
        return !!order.requestedCount
      case 'SAUCE':
        return !!currentPlate.sauce
      case 'PROTEIN':
        return !!currentPlate.protein
      case 'COMPLEMENT':
        return !!currentPlate.complement
      case 'BASE_RECIPE':
        return true
      case 'SUMMARY':
        return !!currentPlate.sauce && !!currentPlate.protein && !!currentPlate.complement
      case 'CUSTOMER':
        return order.customer.name.length > 2 && order.customer.phone.length >= 8 && order.customer.address.length > 5
      default:
        return false
    }
  }

  const getButtonLabel = () => {
    if (currentStep === 'SUMMARY') {
      if (totalItems < (order.requestedCount || 1)) return 'Personalizar Siguiente'
      return 'Finalizar Pedido'
    }
    if (currentStep === 'CUSTOMER') return 'Confirmar Datos'
    return 'Siguiente'
  }

  const handleMainAction = () => {
    if (currentStep === 'SUMMARY' && totalItems < (order.requestedCount || 1)) {
      onAddAnother?.()
    } else {
      onNext?.()
    }
    setIsOpen(false)
  }

  const getLabel = (value, options) => {
    if (!value) return null
    const option = options.find((o) => o.value === value)
    return option ? option.label : value
  }

  const showBaseInSummary = ['BASE_RECIPE', 'SUMMARY', 'CUSTOMER'].includes(currentStep)

  const SummaryContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-ui-border pb-4">
        <h3 className="font-extrabold text-ui-text text-lg">Detalle de Costos</h3>
        <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded-md">{totalItems} plato(s)</span>
      </div>

      <div className="space-y-4">
        {order.cart.map((plate, idx) => (
          <div key={plate.id} className="bg-ui-bg rounded-lg p-3 opacity-75">
            <div className="flex justify-between items-center mb-1 border-b border-ui-border pb-1">
              <span className="text-xs font-bold text-ui-muted uppercase">Plato #{idx + 1}</span>
            </div>
            <div className="text-[10px] text-ui-muted leading-tight space-y-0.5 mt-1">
              <div>{getLabel(plate.sauce, OPTIONS_SAUCE)}, {getLabel(plate.protein, OPTIONS_PROTEIN)}</div>
              {showBaseInSummary && !!formatBaseRecipe(plate.baseRecipe) && (
                <div className="text-ui-text font-bold">{formatBaseRecipe(plate.baseRecipe)}</div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2 border-b border-blue-100 pb-1">
            <span className="text-xs font-bold text-brand-blue uppercase">
              {`Plato ${totalItems} ${order.requestedCount > 1 ? `(${totalItems} de ${order.requestedCount})` : '(Editando)'}`}
            </span>
          </div>
          {currentPlate.sauce || currentPlate.protein ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4"><span className="text-ui-muted font-medium">Salsa</span><span className="text-ui-text font-bold text-right">{getLabel(currentPlate.sauce, OPTIONS_SAUCE)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-ui-muted font-medium">Proteína</span><span className="text-ui-text font-bold text-right">{getLabel(currentPlate.protein, OPTIONS_PROTEIN)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-ui-muted font-medium">Complemento</span><span className="text-ui-text font-bold text-right">{getLabel(currentPlate.complement, OPTIONS_COMPLEMENT)}</span></div>
              {showBaseInSummary && !!formatBaseRecipe(currentPlate.baseRecipe) && (
                <div className="pt-1 border-t border-ui-border text-ui-text font-bold">
                  {formatBaseRecipe(currentPlate.baseRecipe)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Seleccionando...</span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
        <span className="text-gray-500 font-bold">Total Final</span>
        <span className="text-3xl font-black text-brand-blue">Q{grandTotal}</span>
      </div>

      <div className="lg:hidden">
        <Button fullWidth onClick={() => setIsOpen(false)} variant="secondary" className="py-3 mt-4">
          Cerrar Detalle
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block w-96 pl-8 flex-shrink-0">
        <div className="sticky top-28">
          <div className="bg-ui-card rounded-3xl p-8 shadow-sm border border-ui-border">
            <SummaryContent />
          </div>
        </div>
      </div>

      {currentStep !== 'CUSTOMER' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-ui-bg via-ui-bg/95 to-transparent pointer-events-none" />
          <div className="bg-ui-card border-t border-ui-border shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-5 sm:p-6 pb-8 sm:pb-6 relative">
            <div className="flex items-center gap-4 max-w-lg mx-auto">
              <div onClick={() => setIsOpen(true)} className="flex flex-col cursor-pointer px-2 active:opacity-60 transition-opacity">
                <span className="text-[10px] uppercase font-black text-ui-muted mb-0.5 tracking-widest">Total</span>
                <div className="flex items-center text-brand-blue font-black text-2xl sm:text-3xl">
                  Q{grandTotal}
                  <div className="ml-1.5 bg-brand-blue/10 rounded-full p-1.5 animate-bounce">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                className="flex-1 py-4 sm:py-5 text-lg font-black shadow-xl shadow-brand-blue/30 rounded-2xl"
                disabled={!canContinue()}
                onClick={handleMainAction}
              >
                {getButtonLabel()}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-ui-bg/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsOpen(false)} />
          <div className="relative bg-ui-card w-full rounded-t-[2rem] p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center mb-6" onClick={() => setIsOpen(false)}>
              <div className="w-12 h-1.5 bg-ui-border rounded-full" />
            </div>
            <SummaryContent />
          </div>
        </div>
      )}
    </>
  )
}

export default OrderSummary
