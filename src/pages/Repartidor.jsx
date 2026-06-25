import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getOrders, updateOrderStatus } from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { formatBaseRecipe, getOptionLabel, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'
import StaffAccessCard from '../components/ui/StaffAccessCard.jsx'
import StaffNavbar from '../components/layout/StaffNavbar.jsx'

const getCardTone = (status) => {
  if (status === 'listo_para_despacho') return 'border-[#FBC02D] bg-[#FFF8D6]'
  if (status === 'recolectado' || status === 'en_camino') return 'border-[#E65100] bg-[#FFE8D1]'
  return 'border-[#2E7D32] bg-[#DFF5E2]'
}

const getCardTextTone = (status) => {
  if (status === 'listo_para_despacho') return 'text-[#5C4400]'
  if (status === 'recolectado' || status === 'en_camino') return 'text-[#7A2E00]'
  return 'text-[#14532D]'
}


const getPromoInfo = (order) => {
  const promos = order?.appliedPromos && order.appliedPromos.length > 0
    ? order.appliedPromos
    : (order?.appliedPromo ? [order.appliedPromo] : [])
  if (promos.length === 0) return null
  const name = promos.map(p => p.name || 'PROMO').join(', ')
  const plates = promos.reduce((sum, p) => sum + (p.plates?.length || p.requestedCount || 0), 0) || order?.items?.length || 0
  const price = promos.reduce((sum, p) => sum + Number(p.promoPrice ?? p.price ?? 0), 0)
  const priceLabel = price > 0 ? `Q${price.toFixed(0)}` : ''
  return { name, plates, priceLabel }
}

const PromoBadge = ({ order }) => {
  const promo = getPromoInfo(order)
  if (!promo) return null
  return (
    <div className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-800">
      <span>🎁 PROMO</span>
      <span>{promo.name}</span>
      {promo.priceLabel && <span>· {promo.priceLabel}</span>}
      {promo.plates ? <span>· {promo.plates} platos</span> : null}
    </div>
  )
}

const getActionButtonTone = (status) => {
  if (status === 'listo_para_despacho') {
    return '!bg-[#FBC02D] !text-[#3D2F00] hover:!bg-[#E0AA00] border border-[#D39E00]'
  }

  if (status === 'recolectado' || status === 'en_camino') {
    return '!bg-[#FB8C00] !text-white hover:!bg-[#EF6C00] border border-[#E65100]'
  }

  return '!bg-[#4CAF50] !text-white hover:!bg-[#388E3C] border border-[#2E7D32]'
}

const RepartidorPage = ({ authSession, onProfileClick }) => {
  const { session, logout } = authSession
  const [activeOrders, setActiveOrders] = useState([])
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [activeTab, setActiveTab] = useState('ACTIVOS')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const knownOrderIds = useRef(new Set())

  const loadOrders = async () => {
    setIsRefreshing(true)
    try {
      const [activeResponse, deliveredResponse] = await Promise.all([getOrders(), getOrders('delivered')])
      const currentActive = activeResponse.data
      const currentDelivered = deliveredResponse.data

      let hasNewOrder = false
      currentActive.forEach((order) => {
        if (!knownOrderIds.current.has(order._id)) {
          if (knownOrderIds.current.size > 0 && order.status === 'listo_para_despacho') hasNewOrder = true
          knownOrderIds.current.add(order._id)
        }
      })
      if (hasNewOrder) playNotificationSound()

      setActiveOrders(currentActive)
      setDeliveredOrders(currentDelivered)
    } catch {
      toast.error('Error al cargar entregas')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (session?.role === 'REPARTIDOR' && session?.status === 'approved') {
      loadOrders()
      const interval = setInterval(loadOrders, 5000)
      return () => clearInterval(interval)
    }
  }, [session])

  const openWazeRoute = (order) => {
    const directUrl = order.navigationLinks?.waze
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (!order.location?.lat || !order.location?.lng) {
      toast.error('Este pedido no tiene ubicación.')
      return
    }

    const fallbackUrl = `https://waze.com/ul?ll=${order.location.lat},${order.location.lng}&navigate=yes`
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
  }

  const advance = async (order) => {
    const nextStatus = order.status === 'listo_para_despacho'
      ? 'recolectado'
      : order.status === 'recolectado'
        ? 'en_camino'
        : order.status === 'en_camino'
          ? 'entregado'
          : ''

    if (!nextStatus) return

    try {
      await updateOrderStatus(order._id, nextStatus)
      if (nextStatus === 'en_camino') {
        openWazeRoute(order)
      }
      toast.success(nextStatus === 'recolectado' ? 'Pedido tomado' : nextStatus === 'en_camino' ? 'Viaje iniciado' : 'Pedido entregado')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.')
    }
  }

  if (session && session.status === 'pending') {
    return (
      <PanelShell title="Acceso en espera" subtitle="Tu acceso está pendiente.">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-ui-text mb-4">Acceso no disponible</h3>
          <p className="text-ui-muted max-w-sm mb-10 leading-relaxed font-medium">Solicita al administrador que cree o habilite tu usuario.</p>
          <Button variant="secondary" onClick={logout} className="!px-10">Cerrar Sesión</Button>
        </div>
      </PanelShell>
    )
  }

  if (!session || session.role !== 'REPARTIDOR') {
    return (
      <StaffAccessCard
        title="Acceso de Repartidor"
        subtitle="Ingresa con tu usuario y contraseña."
        accentClass="!bg-[#4CAF50]"
        authSession={authSession}
      />
    )
  }

  const renderOrderCard = (order) => {
    return (
      <div key={order._id} className={`rounded-[2rem] border-2 p-5 sm:p-6 shadow-sm ${getCardTone(order.status)} ${getCardTextTone(order.status)}`}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] font-black text-black/55 uppercase tracking-widest mb-1">Número de orden</p>
            <h3 className="text-2xl font-black text-black/80">{order.orderNumber || order._id.slice(-6)}</h3>
            <PromoBadge order={order} />
          </div>
          <StatusBadge value={order.status} />
        </div>

        <div className="space-y-3 text-sm mb-5">
          <div><span className="text-black/55 font-black uppercase text-[10px] tracking-widest block mb-1">Nombre del cliente</span><span className="font-bold text-black/80">{order.name}</span></div>
          <div><span className="text-black/55 font-black uppercase text-[10px] tracking-widest block mb-1">Teléfono del cliente</span><span className="font-bold text-black/80">{order.phone}</span></div>
          <div><span className="text-black/55 font-black uppercase text-[10px] tracking-widest block mb-1">Dirección</span><span className="font-bold text-black/80">{order.address}</span></div>
          <div><span className="text-black/55 font-black uppercase text-[10px] tracking-widest block mb-1">Código de acceso</span><span className="font-bold text-black/80">{order.accessCode || 'Sin código'}</span></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-5">
          <Button variant="secondary" onClick={() => openWazeRoute(order)} disabled={!order.navigationLinks?.waze && !order.location?.lat}>
            Ubicación
          </Button>
          {order.status === 'listo_para_despacho' && (
            <Button className={getActionButtonTone(order.status)} onClick={() => advance(order)}>
              Tomar pedido
            </Button>
          )}
          {order.status === 'recolectado' && (
            <Button className={getActionButtonTone(order.status)} onClick={() => advance(order)}>
              Iniciar viaje
            </Button>
          )}
          {order.status === 'en_camino' && (
            <Button className={getActionButtonTone(order.status)} onClick={() => advance(order)}>
              Marcar entregado
            </Button>
          )}
        </div>

        {(order.status === 'en_camino' || order.status === 'entregado') && (
          <details className="rounded-2xl border border-black/15 bg-white/70 p-4">
            <summary className="cursor-pointer font-black text-sm text-brand-blue uppercase">Comanda</summary>
            <div className="mt-4 space-y-4 text-sm">
              {order.items.map((item, idx) => {
                const baseText = formatBaseRecipe(item.baseRecipe)
                return (
                  <div key={idx} className="rounded-2xl border border-black/15 bg-white/60 p-4">
                    <p className="text-xs font-black text-brand-blue uppercase mb-2">Plato {idx + 1}</p>
                    <div className="space-y-1 font-bold text-black/80">
                      <div>{getOptionLabel(item.sauce, OPTIONS_SAUCE)}</div>
                      <div>{getOptionLabel(item.protein, OPTIONS_PROTEIN)}</div>
                      <div>{getOptionLabel(item.complement, OPTIONS_COMPLEMENT)}</div>
                      {baseText && (
                        <div className="pt-2 mt-2 border-t border-black/15 font-bold text-black/80 uppercase">
                          {baseText}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )}
      </div>
    )
  }

  return (
    <>
      <StaffNavbar role="REPARTIDOR" session={session} logout={logout} count={activeOrders.length + deliveredOrders.length} isRefreshing={isRefreshing} onProfileClick={onProfileClick} />
      <PanelShell
        title="Logística de Entrega"
        subtitle="Pedidos activos y entregados"
        actions={<StatusBadge value={session.status} />}
        compactTop
      >
      {/* Mobile Tab Swiper */}
      <div className="flex md:hidden bg-ui-bg p-1.5 rounded-2xl border border-ui-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVOS')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === 'ACTIVOS'
              ? 'bg-[#0c2461] text-white shadow-md'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Activos ({activeOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ENTREGADOS')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === 'ENTREGADOS'
              ? 'bg-[#0c2461] text-white shadow-md'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Entregados ({deliveredOrders.length})
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 animate-fade-in">
        <section className={`space-y-5 scroll-mt-24 ${activeTab === 'ACTIVOS' ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Activos</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">{activeOrders.length}</span>
          </div>
          <div className="space-y-5">
            {activeOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold bg-white">No hay pedidos activos.</div>
            ) : (
              activeOrders.map(renderOrderCard)
            )}
          </div>
        </section>

        <section className={`space-y-5 scroll-mt-24 ${activeTab === 'ENTREGADOS' ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Entregados</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">{deliveredOrders.length}</span>
          </div>
          <div className="space-y-5">
            {deliveredOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold bg-white">No hay pedidos entregados.</div>
            ) : (
              deliveredOrders.map(renderOrderCard)
            )}
          </div>
        </section>
      </div>
      </PanelShell>
    </>
  )
}

export default RepartidorPage
