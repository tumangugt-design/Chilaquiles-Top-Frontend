import { calculateTotal, formatBaseRecipe } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const ConfirmationPage = ({ order, onReset }) => {
  const confirmedOrder = order?.lastOrder || null
  const allPlates = confirmedOrder?.items || order.cart || []
  const total = confirmedOrder?.total || calculateTotal(allPlates.length)
  const orderNumber = confirmedOrder?.orderNumber || 'N/A'

  const handleWhatsAppShare = () => {
    let message = `*ORDEN CHILAQUILES TOP*
`
    message += `*Número de orden:* ${orderNumber}
`
    message += `
*Resumen de la comanda*
`

    allPlates.forEach((plate, i) => {
      const base = formatBaseRecipe(plate.baseRecipe)
      message += `Plato ${i + 1}: ${plate.sauce} • ${plate.protein} • ${plate.complement}${base ? ` • ${base}` : ''}
`
    })

    message += `
*Total a pagar:* Q${total}
`
    message += `*Entrega estimada:* 20-30 min
`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

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
        <Button fullWidth onClick={handleWhatsAppShare} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-xl shadow-green-500/20 py-4 flex items-center justify-center space-x-2">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.096 0-4.141-.547-5.945-1.587L0 24zm6.549-3.328c1.611.956 3.204 1.442 4.887 1.442 5.305 0 9.623-4.317 9.623-9.623 0-2.569-1-4.985-2.817-6.802-1.817-1.817-4.233-2.817-6.806-2.817-5.305 0-9.623 4.318-9.623 9.623 0 1.685.487 3.279 1.445 4.887l-.953 3.483 3.644-.953zm10.158-6.55c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          <span className="font-black text-lg">Compartir por WhatsApp</span>
        </Button>

        <Button fullWidth onClick={onReset} variant="secondary" className="border-2 border-ui-border">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default ConfirmationPage
