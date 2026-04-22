import { calculateTotal, formatBaseRecipe } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const ConfirmationPage = ({ order, onReset }) => {
  const confirmedOrder = order?.lastOrder || null
  const allPlates = confirmedOrder?.items || order.cart || []
  const total = confirmedOrder?.total || calculateTotal(allPlates.length)
  const orderNumber = confirmedOrder?.orderNumber || 'N/A'

  return (
    <div className="text-center py-8 space-y-8 animate-fade-in max-w-lg mx-auto">
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-3xl opacity-40 animate-pulse" />
        <Logo className="relative w-full h-full drop-shadow-xl animate-fade-in transform hover:scale-105 transition-transform duration-500" />
      </div>

      <div>
        <h2 className="text-4xl font-black text-brand-blue mb-2 tracking-tight">¡Pedido Recibido!</h2>
        <p className="text-xl text-ui-muted font-medium">Gracias por elegir Chilaquiles TOP.</p>
      </div>

      <div className="bg-ui-card p-8 rounded-[2rem] shadow-2xl border border-ui-border text-left space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-orange" />

        <div className="flex justify-between items-center border-b border-ui-border pb-4">
          <span className="text-sm text-ui-muted font-black uppercase tracking-widest">Número de orden</span>
          <span className="text-2xl font-black text-brand-blue">{orderNumber}</span>
        </div>

        <div className="border-b border-ui-border pb-6">
          <span className="block text-xs font-black text-ui-muted uppercase tracking-widest mb-4">Resumen de la comanda</span>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
            {allPlates.map((plate, idx) => {
              const baseStr = formatBaseRecipe(plate.baseRecipe)
              return (
                <div key={idx} className="py-3 border-b border-ui-border last:border-0">
                  <p className="text-xs font-black text-brand-blue uppercase mb-1">Plato {idx + 1}</p>
                  <p className="text-sm font-bold text-ui-text">{plate.sauce} • {plate.protein} • {plate.complement}</p>
                  {baseStr && <p className="text-xs text-ui-muted italic mt-1">{baseStr}</p>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-ui-border pt-6 mt-6 flex justify-between items-end">
          <span className="font-black text-ui-muted text-xs uppercase tracking-widest">Total a pagar</span>
          <span className="text-4xl font-black text-brand-blue">Q{total}</span>
        </div>

        <div className="bg-brand-blue/5 rounded-2xl p-4 text-center border border-brand-blue/10">
          <p className="text-xs font-black text-brand-blue uppercase tracking-widest">Entrega estimada: 20-30 min</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button fullWidth onClick={onReset} variant="secondary" className="border-2 border-ui-border">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default ConfirmationPage
