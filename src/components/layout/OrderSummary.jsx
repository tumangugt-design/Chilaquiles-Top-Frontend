// ============================================
// COMPONENTE: OrderSummary
// Panel de resumen de orden (Desktop) + Dock móvil
// ============================================

import { useState } from 'react'
import { calculateTotal, getMarginalPrice, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT } from '../../shared/constants/index.jsx'
import Button from '../ui/Button.jsx'

const OrderSummary = ({ order, currentStep, onEdit, onNext, onAddAnother }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (currentStep === 'LOCATION' || currentStep === 'CONFIRMATION') return null

  const currentPlate = order.currentPlate
  const totalItems = order.cart.length + 1
  const grandTotal = calculateTotal(Math.max(order.requestedCount || 0, totalItems))
  const MAX_PLATES = 4
  const canAddMore = totalItems < MAX_PLATES

  const canContinue = () => {
    switch (currentStep) {
      case 'SAUCE': return !!currentPlate.sauce
      case 'PROTEIN': return !!currentPlate.protein
      case 'COMPLEMENT': return !!currentPlate.complement
      case 'BASE_RECIPE': return true
      case 'SUMMARY': 
        // If we need more plates, we can only continue if the current one is somewhat "complete"
        // (though in this app, sauce/protein/complement are required)
        return !!currentPlate.sauce && !!currentPlate.protein && !!currentPlate.complement
      case 'CUSTOMER':
        return order.customer.name.length > 2 && order.customer.phone.length >= 8 && order.customer.address.length > 5
      default: return false
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
      if (onAddAnother) onAddAnother()
    } else {
      if (onNext) onNext()
    }
    setIsOpen(false)
  }

  const ItemRow = ({ label, value }) => {
    if (!value) return null
    return (
      <div className="flex justify-between items-start py-1">
        <span className="text-ui-muted text-xs font-medium">{label}</span>
        <span className="text-ui-text text-xs font-bold text-right ml-4 max-w-[150px] leading-tight">{value}</span>
      </div>
    )
  }

  const getLabel = (value, options) => {
    if (!value) return null
    const option = options.find(o => o.value === value)
    return option ? option.label : value
  }

  const getBaseLabel = (base) => {
    const parts = []
    if (base.onion) parts.push('Cebolla')
    if (base.cilantro) parts.push('Cilantro')
    if (base.cream) parts.push('Crema')
    if (parts.length === 0) return 'Sin extras base'
    return parts.join(', ')
  }

  const SummaryContent = () => (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-ui-border pb-4">
        <h3 className="font-extrabold text-ui-text text-lg">Detalle de Costos</h3>
        <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded-md">{totalItems} plato(s)</span>
      </div>

      <div className="space-y-4">
        {/* Cart Items */}
        {order.cart.map((plate, idx) => (
          <div key={plate.id} className="bg-ui-bg rounded-lg p-3 opacity-75">
            <div className="flex justify-between items-center mb-1 border-b border-ui-border pb-1">
              <span className="text-xs font-bold text-ui-muted uppercase">Plato #{idx + 1} (En carrito)</span>
              <span className="text-xs font-bold text-ui-text">Q{getMarginalPrice(idx)}</span>
            </div>
            <div className="text-[10px] text-ui-muted leading-tight space-y-0.5">
              <div>{getLabel(plate.sauce, OPTIONS_SAUCE)}, {getLabel(plate.protein, OPTIONS_PROTEIN)}</div>
              <div className="italic text-ui-muted">Base: {getBaseLabel(plate.baseRecipe)}</div>
            </div>
          </div>
        ))}

        {/* Current Plate */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2 border-b border-blue-100 pb-1">
            <span className="text-xs font-bold text-brand-blue uppercase">
              Plato Actual {order.requestedCount > 1 ? `(${totalItems} de ${order.requestedCount})` : '(Editando)'}
            </span>
            <span className="text-xs font-bold text-brand-blue">Q{getMarginalPrice(order.cart.length)}</span>
          </div>
          {currentPlate.sauce || currentPlate.protein ? (
            <div className="space-y-0.5">
              <ItemRow label="Salsa" value={getLabel(currentPlate.sauce, OPTIONS_SAUCE)} />
              <ItemRow label="Proteína" value={getLabel(currentPlate.protein, OPTIONS_PROTEIN)} />
              <ItemRow label="Complemento" value={getLabel(currentPlate.complement, OPTIONS_COMPLEMENT)} />
              <ItemRow label="Base" value={getBaseLabel(currentPlate.baseRecipe)} />
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Seleccionando...</span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
        <span className="text-gray-500 font-bold">Total Final</span>
        <span className="text-3xl font-black text-brand-blue">Q{grandTotal}</span>
      </div>

      {/* Action Buttons */}
      <div className="lg:hidden">
        <Button fullWidth onClick={() => setIsOpen(false)} variant="secondary" className="py-3 mt-4">
          Cerrar Detalle
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden lg:block w-96 pl-8 flex-shrink-0">
        <div className="sticky top-28">
          <div className="bg-ui-card rounded-3xl p-8 shadow-sm border border-ui-border">
            <SummaryContent />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Dock */}
      {currentStep !== 'CUSTOMER' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 relative">
          <div className="flex items-center gap-4 max-w-md mx-auto">

            {/* Total & Toggle */}
            <div
              onClick={() => setIsOpen(true)}
              className="flex flex-col cursor-pointer px-2 active:opacity-60 transition-opacity"
            >
              <span className="text-[10px] uppercase font-bold text-ui-muted mb-0.5">Total</span>
              <div className="flex items-center text-brand-blue font-black text-2xl">
                Q{grandTotal}
                <div className="ml-1.5 bg-blue-50 rounded-full p-0.5 animate-bounce">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Primary Action */}
            <Button
              variant="primary"
              className="flex-1 py-3.5 text-base shadow-lg rounded-xl"
              disabled={!canContinue()}
              onClick={handleMainAction}
            >
              {getButtonLabel()}
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Mobile Bottom Sheet Modal */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-ui-bg/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
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
