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
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 mb-4 relative overflow-hidden">
      {/* Left color bar accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-blue"></div>

      <div className="mb-3 pb-2 border-b border-gray-100 flex justify-between items-center pl-3">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <span className="font-bold text-brand-blue text-xl">Q{price}</span>
      </div>

      <div className="space-y-2 pl-3">
        {/* Removed SIZE section */}

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {plate.sauce === 'ROJA' && 'Salsa Roja'}
            {plate.sauce === 'VERDE' && 'Salsa Verde'}
            {plate.sauce === 'DIVORCIADOS' && 'Divorciados'}
          </span>
          {showEdit && onEdit && (
            <button
              onClick={() => onEdit('SAUCE')}
              className="text-brand-blue text-xs font-bold uppercase hover:bg-blue-50 px-2 py-1 rounded"
            >
              Editar
            </button>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {plate.protein === 'STEAK' && 'Steak'}
            {plate.protein === 'POLLO' && 'Pollo Cocido'}
            {plate.protein === 'CHORIZO' && 'Chorizo Argentino'}
          </span>
          {showEdit && onEdit && (
            <button
              onClick={() => onEdit('PROTEIN')}
              className="text-brand-blue text-xs font-bold uppercase hover:bg-blue-50 px-2 py-1 rounded"
            >
              Editar
            </button>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {plate.complement === 'AGUACATE' && 'Aguacate'}
            {plate.complement === 'CEBOLLA_CARAMELIZADA' && 'Cebolla Caramelizada'}
            {plate.complement === 'QUESO_EXTRA' && 'Queso Extra'}
          </span>
          {showEdit && onEdit && (
            <button
              onClick={() => onEdit('COMPLEMENT')}
              className="text-brand-blue text-xs font-bold uppercase hover:bg-blue-50 px-2 py-1 rounded"
            >
              Editar
            </button>
          )}
        </div>

        {/* Base Recipe Section */}
        <div className="flex justify-between items-center text-sm text-gray-600 pt-1 border-t border-gray-50 mt-1">
          <span className="italic text-gray-500">Base: {getBaseLabel(plate.baseRecipe)}</span>
          {showEdit && onEdit && (
            <button
              onClick={() => onEdit('BASE_RECIPE')}
              className="text-brand-blue text-xs font-bold uppercase hover:bg-blue-50 px-2 py-1 rounded"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const SummaryPage = ({ order, onNext, onBack, onEdit, onAddAnother }) => {
  // Combine all plates into a single list for display
  const allPlates = [...order.cart, order.currentPlate]
  const MAX_PLATES = 4
  const platesCount = allPlates.length
  const canAddMore = platesCount < MAX_PLATES

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold mb-2 text-gray-900">Resumen del Pedido</h2>
        <p className="text-gray-500 text-sm">Revisa que todo esté delicioso antes de confirmar.</p>
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
        {canAddMore ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={onAddAnother}
            className="py-4 border-2 border-dashed border-brand-orange text-brand-orange hover:bg-orange-50 hover:border-solid transition-all group"
          >
            <span className="text-xl mr-2 font-bold group-hover:scale-110 transition-transform">+</span>
            Agregar otro plato
          </Button>
        ) : (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-brand-orange mb-2">
              <span className="font-bold text-lg">!</span>
            </div>
            <p className="text-gray-800 font-bold text-sm">Has alcanzado el límite de {MAX_PLATES} platos.</p>
            <p className="text-gray-500 text-xs mt-1">
              Para pedidos más grandes, por favor realiza una segunda orden o contáctanos.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Desktop */}
      <div className="hidden lg:block space-y-4 pt-6 border-t border-gray-100 mt-6">
        <Button fullWidth onClick={onNext} className="py-4 shadow-xl shadow-brand-orange/20">
          Finalizar Pedido
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SummaryPage
