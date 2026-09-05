import { useEffect, useState } from 'react'
import { calculateTotal, formatBaseRecipe, getOptionLabel, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import { getOrderConfirmation } from '../shared/config/api.js'

// Pantalla que ve el cliente al volver del link de pago de Recurrente (success_url).
// Es el equivalente de Confirmation.jsx para pagos en efectivo, pero como el navegador
// salio de la app hacia Recurrente y regreso, el estado en memoria del carrito ya no
// existe: los datos del pedido se piden de nuevo al backend.
const OrderConfirmationPage = ({ orderNumber }) => {
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getOrderConfirmation(orderNumber)
      .then(({ data }) => {
        if (!mounted) return
        setOrder(data)
        setLoading(false)
      })
      .catch((error) => {
        if (!mounted) return
        if (error?.response?.status === 404) setNotFound(true)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [orderNumber])

  const allPlates = order?.items || []
  const total = order?.total ?? calculateTotal(allPlates.length)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ui-bg">
        <div className="w-10 h-10 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ui-bg text-center px-6">
        <h2 className="text-2xl font-black text-ui-text mb-2">No encontramos ese pedido</h2>
        <p className="text-ui-muted font-medium mb-6">Verifica el link que recibiste o contáctanos por WhatsApp.</p>
        <a
          href="https://api.whatsapp.com/send/?phone=50233019938&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm"
        >
          Escríbenos
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ui-bg py-8 px-4">
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
            <span className="text-2xl font-black text-brand-blue">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center border-b border-ui-border pb-4">
            <span className="text-sm text-ui-muted font-black uppercase tracking-widest">Pago</span>
            <span className="text-sm font-black text-green-600 uppercase">Confirmado</span>
          </div>

          <div className="border-b border-ui-border pb-6">
            <span className="block text-xs font-black text-ui-muted uppercase tracking-widest mb-4">Resumen de la comanda</span>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
              {allPlates.map((plate, idx) => {
                const baseStr = formatBaseRecipe(plate.baseRecipe)
                return (
                  <div key={idx} className="py-3 border-b border-ui-border last:border-0">
                    <p className="text-xs font-black text-brand-blue uppercase mb-1">Plato {idx + 1}</p>
                    <p className="text-sm font-bold text-ui-text">{getOptionLabel(plate.sauce, OPTIONS_SAUCE)} • {getOptionLabel(plate.protein, OPTIONS_PROTEIN)} • {getOptionLabel(plate.complement, OPTIONS_COMPLEMENT)}</p>
                    {baseStr && <p className="text-sm font-bold text-ui-text uppercase mt-1">{baseStr}</p>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ui-border pt-6 mt-6 flex justify-between items-end">
            <span className="font-black text-ui-muted text-xs uppercase tracking-widest">Total pagado</span>
            <span className="text-4xl font-black text-brand-blue">Q{total}</span>
          </div>

          <div className="bg-brand-blue/5 rounded-2xl p-4 text-center border border-brand-blue/10">
            <p className="text-xs font-black text-brand-blue uppercase tracking-widest">tiempo de entrega estimado: 15-45 minutos</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            fullWidth
            onClick={() => {
              window.location.href = `/pedido/${order.orderNumber}`
            }}
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black py-4 text-lg rounded-2xl shadow-xl shadow-green-500/30 border-0"
          >
            Ver estado del pedido
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
