import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getOrders, updateOrderStatus } from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { formatBaseRecipe } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'
import StaffAccessCard from '../components/ui/StaffAccessCard.jsx'
import StaffNavbar from '../components/layout/StaffNavbar.jsx'

const getCardTone = (status) => {
  if (status === 'recibido') return 'border-[#FBC02D] bg-[#FFF8D6]'
  if (status === 'en_proceso') return 'border-[#E65100] bg-[#FFE8D1]'
  return 'border-[#2E7D32] bg-[#DFF5E2]'
}

const getCardTextTone = (status) => {
  if (status === 'recibido') return 'text-[#5C4400]'
  if (status === 'en_proceso') return 'text-[#7A2E00]'
  return 'text-[#14532D]'
}

const getActionButtonTone = (status) => {
  if (status === 'recibido') {
    return '!bg-[#FBC02D] !text-[#3D2F00] hover:!bg-[#E0AA00] border border-[#D39E00]'
  }

  if (status === 'en_proceso') {
    return '!bg-[#FB8C00] !text-white hover:!bg-[#EF6C00] border border-[#E65100]'
  }

  return '!bg-[#4CAF50] !text-white hover:!bg-[#388E3C] border border-[#2E7D32]'
}

const ChefOrderCard = ({ order, onAdvance, onArchive }) => (
  <div className={`rounded-[2rem] border-2 p-5 sm:p-6 shadow-sm ${getCardTone(order.status)} ${getCardTextTone(order.status)}`}>
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <p className="text-[10px] font-black text-black/55 uppercase tracking-widest mb-1">Número de Orden</p>
        <h3 className="text-2xl font-black text-black/80">{order.orderNumber || order._id.slice(-6)}</h3>
        {order.sauceTemperature && (
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.sauceTemperature === 'FRIO' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            <span className="text-sm">{order.sauceTemperature === 'FRIO' ? '🧊' : '♨️'}</span> Salsa {order.sauceTemperature}
          </div>
        )}
      </div>
      <StatusBadge value={order.status} />
    </div>

    <div className="space-y-4">
      {order.items.map((item, idx) => {
        const baseText = formatBaseRecipe(item.baseRecipe)
        return (
          <div key={idx} className="rounded-2xl border border-black/15 bg-white/70 p-4">
            <p className="text-xs font-black text-brand-blue uppercase mb-2">Plato {idx + 1}</p>
            <div className="space-y-1 text-sm">
              <div className="font-bold text-black/80">{item.sauce}</div>
              <div className="font-bold text-black/80">{item.protein}</div>
              <div className="font-bold text-black/80">{item.complement}</div>
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

    <div className="mt-6 flex flex-col gap-2">
      {order.status !== 'listo_para_despacho' && order.status !== 'recolectado' && order.status !== 'en_camino' && order.status !== 'entregado' && (
        <Button
          fullWidth
          onClick={() => onAdvance(order)}
          className={getActionButtonTone(order.status)}
        >
          {order.status === 'recibido' ? 'Tomar pedido' : 'Completar pedido'}
        </Button>
      )}

      {(order.status === 'listo_para_despacho' || order.status === 'recolectado' || order.status === 'en_camino' || order.status === 'entregado') && (
        <Button
          fullWidth
          variant="secondary"
          onClick={() => onArchive(order._id)}
          className="!bg-black/5 !text-black/60 hover:!bg-black/10 border-none"
        >
          Archivar pedido
        </Button>
      )}
    </div>
  </div>
)

const ChefPage = ({ authSession, onProfileClick }) => {
  const { session, logout } = authSession
  const [activeOrders, setActiveOrders] = useState([])
  const [finishedOrders, setFinishedOrders] = useState([])
  const [archivedOrderIds, setArchivedOrderIds] = useState(() => {
    const saved = localStorage.getItem('chef_archived_orders')
    return saved ? JSON.parse(saved) : []
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const knownOrderIds = useRef(new Set())

  useEffect(() => {
    localStorage.setItem('chef_archived_orders', JSON.stringify(archivedOrderIds))
  }, [archivedOrderIds])

  const loadOrders = async () => {
    setIsRefreshing(true)
    try {
      const [activeResponse, finishedResponse] = await Promise.all([getOrders(), getOrders('finished')])
      const incomingActive = activeResponse.data
      const incomingFinished = finishedResponse.data

      let hasNewOrder = false
      incomingActive.forEach((order) => {
        if (!knownOrderIds.current.has(order._id)) {
          if (knownOrderIds.current.size > 0 && order.status === 'recibido') hasNewOrder = true
          knownOrderIds.current.add(order._id)
        }
      })
      if (hasNewOrder) playNotificationSound()

      setActiveOrders(incomingActive)
      setFinishedOrders(incomingFinished)
    } catch {
      toast.error('Error al cargar pedidos')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (session?.role === 'CHEF' && session?.status === 'approved') {
      loadOrders()
      const interval = setInterval(loadOrders, 5000)
      return () => clearInterval(interval)
    }
  }, [session])

  const archiveOrder = (orderId) => {
    setArchivedOrderIds(prev => [...prev, orderId])
    toast.success('Pedido archivado')
  }

  const clearFinished = () => {
    const currentFinishedIds = finishedOrders.map(o => o._id)
    setArchivedOrderIds(prev => [...new Set([...prev, ...currentFinishedIds])])
    toast.success('Lista de terminados despejada')
  }

  const advance = async (order) => {
    const nextStatus = order.status === 'recibido' ? 'en_proceso' : order.status === 'en_proceso' ? 'listo_para_despacho' : ''
    if (!nextStatus) return

    try {
      await updateOrderStatus(order._id, nextStatus)
      toast.success(nextStatus === 'listo_para_despacho' ? '¡Pedido completado!' : '¡Pedido tomado!')
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
            <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-ui-text mb-4">Acceso no disponible</h3>
          <p className="text-ui-muted max-w-sm mb-10 leading-relaxed font-medium">Solicita al administrador que cree o habilite tu usuario.</p>
          <Button variant="secondary" onClick={logout} className="!px-10">Cerrar Sesión</Button>
        </div>
      </PanelShell>
    )
  }

  if (!session || session.role !== 'CHEF') {
    return (
      <StaffAccessCard
        title="Acceso a Cocina"
        subtitle="Ingresa con tu usuario y contraseña."
        accentClass="!bg-brand-orange"
        authSession={authSession}
      />
    )
  }

  return (
    <>
      <StaffNavbar role="CHEF" session={session} logout={logout} count={activeOrders.length + finishedOrders.filter(o => !archivedOrderIds.includes(o._id)).length} isRefreshing={isRefreshing} onProfileClick={onProfileClick} />
      <PanelShell
        title="Centro de Producción"
        subtitle="Pedidos en cocina y pedidos terminados"
        actions={<StatusBadge value={session.status} />}
        compactTop
      >
      <div className="grid xl:grid-cols-2 gap-6 sm:gap-8 animate-fade-in">
        <section className="space-y-5 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Activos</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">{activeOrders.length}</span>
          </div>
          <div className="space-y-5">
            {activeOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold">No hay pedidos activos.</div>
            ) : (
              activeOrders.map((order) => (
                <ChefOrderCard 
                  key={order._id} 
                  order={order} 
                  onAdvance={advance} 
                  onArchive={archiveOrder} 
                />
              ))
            )}
          </div>
        </section>

        <section className="space-y-5 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Terminados</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={clearFinished}
                className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:underline"
              >
                Limpiar lista
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-ui-muted">
                {finishedOrders.filter(o => !archivedOrderIds.includes(o._id)).length}
              </span>
            </div>
          </div>
          <div className="space-y-5">
            {finishedOrders.filter(o => !archivedOrderIds.includes(o._id)).length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold">No hay pedidos terminados.</div>
            ) : (
              finishedOrders
                .filter(o => !archivedOrderIds.includes(o._id))
                .map((order) => (
                  <ChefOrderCard 
                    key={order._id} 
                    order={order} 
                    onAdvance={advance} 
                    onArchive={archiveOrder} 
                  />
                ))
            )}
          </div>
        </section>
      </div>
      </PanelShell>
    </>
  )
}

export default ChefPage