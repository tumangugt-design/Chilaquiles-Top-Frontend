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
        <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <Logo className="relative w-full h-full drop-shadow-xl animate-fade-in transform hover:scale-105 transition-transform duration-500" />
      </div>

      <div>
        <h2 className="text-4xl font-black text-brand-blue mb-2 tracking-tight">¡Pedido Recibido!</h2>
        <p className="text-xl text-ui-muted font-medium">Gracias por elegir Chilaquiles TOP.</p>
      </div>

      <div className="bg-ui-card p-8 rounded-[2rem] shadow-2xl border border-ui-border text-left space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-orange" />

        <h3 className="font-black text-ui-text text-lg border-b border-ui-border pb-4">Detalles de entrega</h3>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-ui-muted font-bold uppercase tracking-wider">Cliente</span>
            <span className="text-sm font-black text-ui-text text-right">{confirmedOrder?.name || order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-ui-muted font-bold uppercase tracking-wider">Teléfono</span>
            <span className="text-sm font-black text-ui-text text-right">{confirmedOrder?.phone || order.customer.phone}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-ui-muted font-bold uppercase tracking-wider shrink-0">Dirección</span>
            <span className="text-sm font-black text-ui-text text-right max-w-[60%] break-words">
              {confirmedOrder?.address || order.customer.address}
            </span>
          </div>
        </div>

        <div className="border-t border-ui-border pt-6">
          <span className="block text-xs font-black text-ui-muted uppercase tracking-widest mb-4">
            Resumen de platos ({allPlates.length})
          </span>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {allPlates.map((plate, idx) => {
              const baseStr = getBaseLabel(plate.baseRecipe)
              return (
                <div key={idx} className="flex justify-between text-sm py-2 border-b border-ui-border last:border-0">
                  <div className="flex flex-col text-ui-text">
                    <span className="font-bold">
                      {plate.sauce} + {plate.protein}
                    </span>
                    <span className="text-[10px] text-ui-muted font-bold uppercase">Base: {baseStr || 'Sin extras'}</span>
                  </div>
                  <span className="font-black text-brand-blue">Q{getMarginalPrice(idx)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-ui-border pt-6 mt-6 flex justify-between items-end">
          <span className="font-black text-ui-muted text-xs uppercase tracking-widest">Total Pagado</span>
          <span className="text-4xl font-black text-brand-blue">Q{total}</span>
        </div>

        <div className="bg-brand-blue/5 rounded-2xl p-4 text-center border border-brand-blue/10">
          <p className="text-xs font-black text-brand-blue uppercase tracking-widest">⏱ Entrega estimada: 20-30 min</p>
        </div>
      </div>

      <Button fullWidth onClick={onReset} className="shadow-xl shadow-brand-orange/20">
        Volver al inicio
      </Button>
    </div>
  )
}

export default ConfirmationPage
