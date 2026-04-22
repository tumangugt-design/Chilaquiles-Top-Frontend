import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getOrders, updateOrderStatus } from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { getBaseRecipeParts } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'

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

const ChefOrderCard = ({ order, onAdvance }) => (
  <div className={`rounded-[2rem] border-2 p-6 shadow-sm ${getCardTone(order.status)} ${getCardTextTone(order.status)}`}>
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <p className="text-[10px] font-black text-black/55 uppercase tracking-widest mb-1">Número de Orden</p>
        <h3 className="text-2xl font-black text-black/80">{order.orderNumber || order._id.slice(-6)}</h3>
      </div>
      <StatusBadge value={order.status} />
    </div>

    <div className="space-y-4">
      {order.items.map((item, idx) => {
        const bases = getBaseRecipeParts(item.baseRecipe)
        return (
          <div key={idx} className="rounded-2xl border border-black/15 bg-white/70 p-4">
            <p className="text-xs font-black text-brand-blue uppercase mb-2">Plato {idx + 1}</p>
            <div className="space-y-1 text-sm">
              <div className="font-bold text-black/80">{item.sauce}</div>
              <div className="font-bold text-black/80">{item.protein}</div>
              <div className="font-bold text-black/80">{item.complement}</div>
              {bases.length > 0 && (
                <div className="pt-2 mt-2 border-t border-black/15 space-y-1">
                  {bases.map((base) => (
                    <div key={base} className="text-black/75 font-bold">{base}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>

    {order.status !== 'listo_para_despacho' && order.status !== 'recolectado' && order.status !== 'en_camino' && order.status !== 'entregado' && (
      <div className="mt-6">
        <Button
          fullWidth
          onClick={() => onAdvance(order)}
          className={getActionButtonTone(order.status)}
        >
          {order.status === 'recibido' ? 'Tomar pedido' : 'Listo para despacho'}
        </Button>
      </div>
    )}
  </div>
)

const ChefPage = ({ authSession }) => {
  const { session, loading, error, loginWithGoogle, logout } = authSession
  const [activeOrders, setActiveOrders] = useState([])
  const [finishedOrders, setFinishedOrders] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const knownOrderIds = useRef(new Set())

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

  const advance = async (order) => {
    const nextStatus = order.status === 'recibido' ? 'en_proceso' : order.status === 'en_proceso' ? 'listo_para_despacho' : ''
    if (!nextStatus) return

    try {
      await updateOrderStatus(order._id, nextStatus)
      toast.success(nextStatus === 'en_proceso' ? '¡Pedido tomado!' : '¡Pedido listo para despacho!')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.')
    }
  }

  if (session && session.status === 'pending') {
    return (
      <PanelShell title="Acceso en Espera" subtitle="Estamos validando tu perfil">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-ui-text mb-4">Solicitud Recibida</h3>
          <p className="text-ui-muted max-w-sm mb-10 leading-relaxed font-medium">Tu cuenta está en proceso de revisión por el equipo administrativo.</p>
          <Button variant="secondary" onClick={logout} className="!px-10">Cerrar Sesión</Button>
        </div>
      </PanelShell>
    )
  }

  if (!session || session.role !== 'CHEF') {
    return (
      <PanelShell title="Centro de Producción" subtitle="Pedidos activos y terminados">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso a Cocina</h3>
          <p className="text-ui-muted max-w-sm mb-8">Valida tus credenciales para visualizar las órdenes entrantes y gestionar la producción.</p>
          <Button onClick={loginWithGoogle} className="flex items-center space-x-3 !py-4 !px-8 shadow-xl shadow-brand-orange/20 !bg-brand-orange" disabled={loading}>
            {loading ? <span>Cargando...</span> : <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg><span className="font-black">Entrar con Google</span></>}
          </Button>
          {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-brand-red text-sm font-bold">{error}</div>}
        </div>
      </PanelShell>
    )
  }

  return (
    <PanelShell
      title="Centro de Producción"
      subtitle="Pedidos en cocina y pedidos terminados"
      actions={
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full bg-brand-blue ${isRefreshing ? 'animate-ping' : ''}`} />
          <StatusBadge value={session.status} />
          <Button variant="secondary" onClick={logout}>Salir</Button>
        </div>
      }
    >
      <div className="grid xl:grid-cols-2 gap-8 animate-fade-in">
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Activos</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">{activeOrders.length}</span>
          </div>
          <div className="space-y-5">
            {activeOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold">No hay pedidos activos.</div>
            ) : (
              activeOrders.map((order) => <ChefOrderCard key={order._id} order={order} onAdvance={advance} />)
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <h2 className="text-xl font-black text-ui-text">Pedidos Terminados</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">{finishedOrders.length}</span>
          </div>
          <div className="space-y-5">
            {finishedOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-ui-border p-10 text-center text-ui-muted font-bold">No hay pedidos terminados.</div>
            ) : (
              finishedOrders.map((order) => <ChefOrderCard key={order._id} order={order} onAdvance={advance} />)
            )}
          </div>
        </section>
      </div>
    </PanelShell>
  )
}

export default ChefPage