// ============================================
// PÁGINA: Summary (Resumen del pedido)
// ============================================

import { getMarginalPrice } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'

const getBaseLabel = (base) => {
  const parts = []
  if (base.onion) parts.push('Cebolla')
  if (base.cilantro) parts.push('Cilantro')
  if (base.cream) parts.push('Crema')

  if (parts.length === 0) return 'Sin verdura ni crema'
  return parts.join(', ')
}

const PlateDetails = ({ plate, onEdit, title, showEdit = true, idx }) => {
  const price = getMarginalPrice(idx)

  return (
    <div className="bg-ui-card border border-ui-border shadow-sm rounded-xl p-5 mb-4 relative overflow-hidden">
      {/* Left color bar accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-blue"></div>

      <div className="mb-3 pb-2 border-b border-ui-border flex justify-between items-center pl-3">
        <h3 className="font-bold text-ui-text text-lg">{title}</h3>
        <span className="font-bold text-brand-blue text-xl">Q{price}</span>
      </div>

      <div className="space-y-2 pl-3">
        {/* Removed SIZE section */}

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {plate.sauce === 'ROJA' && 'Salsa Roja'}
            {plate.sauce === 'VERDE' && 'Salsa Verde'}
            {plate.sauce === 'DIVORCIADOS' && 'Divorciados'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('SAUCE')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {plate.protein === 'STEAK' && 'Steak'}
            {plate.protein === 'POLLO' && 'Pollo Cocido'}
            {plate.protein === 'CHORIZO' && 'Chorizo Argentino'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('PROTEIN')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {plate.complement === 'AGUACATE' && 'Aguacate'}
            {plate.complement === 'CEBOLLA_CARAMELIZADA' && 'Cebolla Caramelizada'}
            {plate.complement === 'QUESO_EXTRA' && 'Queso Extra'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('COMPLEMENT')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        {/* Base Recipe Section */}
        <div className="flex justify-between items-center text-sm text-ui-muted pt-1 border-t border-ui-border mt-1">
          <span className="italic text-ui-muted">Base: {getBaseLabel(plate.baseRecipe)}</span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('BASE_RECIPE')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>
      </div>
    </div>
  )
}

const SummaryPage = ({ order, onNext, onBack, onEdit, onAddAnother }) => {
  // Combine all plates into a single list for display
  const allPlates = [...order.cart, order.currentPlate]
  const platesCount = allPlates.length
  const requestedCount = order.requestedCount || 1
  const isComplete = platesCount >= requestedCount

  const getAddAnotherLabel = () => {
    if (platesCount === 1) return 'Personalizar Segundo Plato'
    if (platesCount === 2) return 'Personalizar Tercer Plato'
    return 'Agregar otro plato'
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold mb-2 text-ui-text">Resumen del Pedido</h2>
        <p className="text-ui-muted text-sm">Revisa que todo esté delicioso antes de confirmar.</p>
      </div>

      {/* SINGLE LIST OF ALL PLATES */}
      <div className="space-y-4">
        {allPlates.map((plate, idx) => {
          // Only the LAST item (the currentPlate) is editable in this flow context
          const isCurrent = idx === allPlates.length - 1

          return (
            <PlateDetails
              key={plate.id || idx} // Fallback to index if ID missing
              plate={plate}
              title={`Plato ${idx + 1}`}
              onEdit={isCurrent ? onEdit : undefined}
              showEdit={isCurrent}
              idx={idx}
            />
          )
        })}
      </div>

      {/* ADD ANOTHER PLATE BUTTON OR LIMIT MESSAGE */}
      <div className="mt-6">
        {!isComplete ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={onAddAnother}
            className="py-4 border-2 border-dashed border-brand-orange text-brand-orange hover:bg-orange-50 hover:border-solid transition-all group"
          >
            <span className="text-xl mr-2 font-bold group-hover:scale-110 transition-transform">+</span>
            {getAddAnotherLabel()}
          </Button>
        ) : null}
      </div>

      {/* Action Buttons - Desktop */}
      <div className="hidden lg:block space-y-4 pt-6 border-t border-ui-border mt-6">
        <Button 
          fullWidth 
          onClick={onNext} 
          disabled={!isComplete}
          className="py-4 shadow-xl shadow-brand-orange/20"
        >
          Finalizar Pedido
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SummaryPage
