// ============================================
// PÁGINA: Confirmation (Confirmación final)
// ============================================

import { calculateTotal, getMarginalPrice } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const getBaseLabel = (base) => {
  const parts = []
  if (base.onion) parts.push('Ceb')
  if (base.cilantro) parts.push('Cil')
  if (base.cream) parts.push('Cre')
  if (parts.length === 0) return ''
  return parts.join(',')
}

const ConfirmationPage = ({ order, onReset }) => {
  const confirmedOrder = order.lastOrder
  const allPlates = confirmedOrder?.items?.length ? confirmedOrder.items : [...order.cart, order.currentPlate]
  const total = confirmedOrder?.total || calculateTotal(allPlates.length)

  return (
    <div className="text-center py-8 space-y-8 animate-fade-in max-w-lg mx-auto">
      {/* LOGO HERO */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <Logo className="relative w-full h-full drop-shadow-xl animate-fade-in transform hover:scale-105 transition-transform duration-500" />
      </div>

      <div>
        <h2 className="text-4xl font-extrabold text-brand-blue mb-2 tracking-tight">¡Pedido Recibido!</h2>
        <p className="text-xl text-gray-500 font-medium">Gracias por elegir Chilaquiles TOP.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 text-left space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-orange" />

        <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Detalles de entrega</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 font-medium">Cliente</span>
            <span className="text-sm font-bold text-gray-900 text-right">{confirmedOrder?.name || order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 font-medium">Teléfono</span>
            <span className="text-sm font-bold text-gray-900 text-right">{confirmedOrder?.phone || order.customer.phone}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-500 font-medium shrink-0">Dirección</span>
            <span className="text-sm font-bold text-gray-900 text-right max-w-[60%] break-words">
              {confirmedOrder?.address || order.customer.address}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Resumen de platos ({allPlates.length})
          </span>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {allPlates.map((plate, idx) => {
              const baseStr = getBaseLabel(plate.baseRecipe)
              return (
                <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <div className="flex flex-col text-gray-600">
                    <span>
                      {plate.sauce} / {plate.protein}
                    </span>
                    <span className="text-xs text-gray-400 italic">Base: {baseStr || 'Sin extras'}</span>
                  </div>
                  <span className="font-bold text-gray-900">Q{getMarginalPrice(idx)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4 mt-4 flex justify-between items-end">
          <span className="font-bold text-gray-600 text-sm uppercase tracking-wider">Total a pagar</span>
          <span className="text-3xl font-extrabold text-brand-blue">Q{total}</span>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs font-bold text-brand-blue">⏱ Tiempo estimado: 20-30 minutos</p>
        </div>
      </div>

      <Button fullWidth onClick={onReset} className="shadow-xl shadow-brand-orange/20">
        Volver al inicio
      </Button>
    </div>
  )
}

export default ConfirmationPage
