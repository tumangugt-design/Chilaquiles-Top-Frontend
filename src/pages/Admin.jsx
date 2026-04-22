import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getPendingStaff, saveInventoryItem, updateStaffStatus, getInventory, getOrders } from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { getBaseRecipeParts, INVENTORY_PRODUCT_OPTIONS, INVENTORY_PRODUCT_MAP } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'

const emptyItem = { name: '', amount: '', unit: '' }

const getCardTone = (status) => {
  if (status === 'recibido') return 'border-[#FBC02D] bg-[#FFFDE7]'
  if (status === 'en_proceso' || status === 'recolectado' || status === 'en_camino') return 'border-[#E65100] bg-[#FFF3E0]'
  return 'border-[#2E7D32] bg-[#E8F5E9]'
}

const AdminPage = ({ authSession }) => {
  const { session, loading, error, loginWithGoogle, logout } = authSession
  const [activeTab, setActiveTab] = useState('staff')
  const [orderFilter, setOrderFilter] = useState('all')
  const [pendingUsers, setPendingUsers] = useState([])
  const [inventory, setInventory] = useState([])
  const [ordersCache, setOrdersCache] = useState({})
  const [itemForm, setItemForm] = useState(emptyItem)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const knownOrderIds = useRef(new Set())

  const loadData = async () => {
    setIsRefreshing(true)
    try {
      if (activeTab === 'orders') {
        const response = await getOrders(orderFilter)
        const orders = response.data
        let hasNewOrder = false
        orders.forEach((order) => {
          if (!knownOrderIds.current.has(order._id)) {
            if (knownOrderIds.current.size > 0 && order.status === 'recibido') hasNewOrder = true
            knownOrderIds.current.add(order._id)
          }
        })
        if (hasNewOrder) playNotificationSound()
        setOrdersCache((prev) => ({ ...prev, [orderFilter]: orders }))
      } else {
        const [pendingResponse, inventoryResponse] = await Promise.all([getPendingStaff(), getInventory()])
        setPendingUsers(pendingResponse.data)
        setInventory(inventoryResponse.data)
      }
    } catch (err) {
      console.error('Error loading Admin data:', err)
      const msg = err.response?.data?.message || 'Error de conexión con el servidor.'
      toast.error(`Admin: ${msg}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  const currentOrders = ordersCache[orderFilter] || []

  useEffect(() => {
    if (session?.role === 'ADMIN' && session?.status === 'approved') {
      loadData()
      const interval = setInterval(loadData, 5000)
      return () => clearInterval(interval)
    }
  }, [session, activeTab, orderFilter])

  const changeStatus = async (userId, status, role) => {
    try {
      await updateStaffStatus(userId, { status, role })
      toast.success('Usuario actualizado')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el usuario.')
    }
  }

  const submitInventory = async (e) => {
    e.preventDefault()
    if (!itemForm.name || !itemForm.amount) return toast.error('Selecciona un producto y una cantidad')
    setIsSaving(true)
    try {
      await saveInventoryItem({ name: itemForm.name, unit: itemForm.unit, amount: Number(itemForm.amount) })
      toast.success('Entrada de inventario registrada')
      setItemForm(emptyItem)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar inventario.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProductChange = (value) => {
    const product = INVENTORY_PRODUCT_MAP[value]
    setItemForm({
      name: value,
      amount: itemForm.amount,
      unit: product?.unit || '',
    })
  }

  if (!session || session.role !== 'ADMIN') {
    return (
      <PanelShell title="Panel de Administración" subtitle="Gestión de staff, inventario y pedidos">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso Administrativo</h3>
          <p className="text-ui-muted max-w-sm mb-8">Inicia sesión con una cuenta autorizada para gestionar la operación.</p>
          <Button onClick={loginWithGoogle} className="flex items-center space-x-3 !py-4 !px-8 shadow-xl shadow-brand-blue/20" disabled={loading}>
            {loading ? <span>Cargando...</span> : <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg><span className="font-black">Entrar con Google</span></>}
          </Button>
          {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-brand-red text-sm font-bold">{error}</div>}
        </div>
      </PanelShell>
    )
  }

  return (
    <PanelShell
      title="Dashboard Administrativo"
      subtitle="Staff, entradas de inventario, inventario y pedidos"
      actions={
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full bg-brand-blue ${isRefreshing ? 'animate-ping' : ''}`} />
          <StatusBadge value={session.status} />
          <Button variant="secondary" onClick={logout}>Salir</Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {[
          ['staff', 'Staff'],
          ['entries', 'Entrada Inventario'],
          ['inventory', 'Inventario'],
          ['orders', 'Pedidos'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === id ? 'bg-brand-blue text-white shadow-lg' : 'bg-ui-bg text-ui-muted border border-ui-border'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Solicitudes de Staff</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">{pendingUsers.length} pendientes</span>
          </div>
          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
                <p className="text-ui-muted text-sm font-medium">No hay solicitudes nuevas en este momento.</p>
              </div>
            ) : (
              pendingUsers.map((user) => (
                <div key={user._id} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="font-black text-lg text-ui-text leading-tight">{user.name || 'Usuario Nuevo'}</p>
                      <p className="text-xs font-bold text-ui-muted uppercase tracking-widest mt-1">{user.email || user.phone}</p>
                    </div>
                    <StatusBadge value={user.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="col-span-2" onClick={() => changeStatus(user._id, 'approved', user.role)}>Aprobar como {user.role}</Button>
                    <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'CHEF')}>Chef</Button>
                    <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'REPARTIDOR')}>Repartidor</Button>
                    <Button variant="secondary" className="col-span-2 !bg-red-500/10 !text-brand-red !border-red-500/20" onClick={() => changeStatus(user._id, 'rejected', user.role)}>Denegar Acceso</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-8 animate-fade-in">
          <form onSubmit={submitInventory} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6 space-y-5">
            <div className="border-b border-ui-border pb-4">
              <h2 className="text-xl font-black text-ui-text">Entrada de Inventario</h2>
              <p className="text-sm text-ui-muted mt-1">Selecciona el producto y registra la cantidad ingresada.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Producto</label>
              <select
                className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                value={itemForm.name}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Selecciona un producto</option>
                {INVENTORY_PRODUCT_OPTIONS.map((product) => (
                  <option key={product.value} value={product.value}>
                    {product.category} · {product.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad</label>
                <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold" value={itemForm.unit} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Cantidad</label>
                <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold" type="number" min="0" step="0.01" value={itemForm.amount} onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })} />
              </div>
            </div>

            <Button type="submit" className="w-full !py-5" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Registrar entrada'}</Button>
          </form>

          <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6 space-y-4">
            <div className="border-b border-ui-border pb-4">
              <h3 className="text-xl font-black text-ui-text">Consumo por plato</h3>
            </div>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {INVENTORY_PRODUCT_OPTIONS.map((product) => (
                <div key={product.value} className="rounded-2xl border border-ui-border bg-white/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-ui-text">{product.label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-ui-muted font-black mt-1">{product.category}</p>
                    </div>
                    <span className="text-sm font-black text-brand-blue">{product.usedPerPlate} {product.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Inventario</h2>
            <span className="text-xs font-black uppercase tracking-widest text-ui-muted">Solo lectura</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const meta = INVENTORY_PRODUCT_MAP[item.name]
              return (
                <div key={item._id} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-black text-ui-text capitalize leading-tight">{meta?.label || item.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mt-1">{meta?.category || 'Inventario'}</p>
                    </div>
                    <span className={`text-xl font-black ${item.stock <= item.minimumStock ? 'text-brand-red' : 'text-brand-blue'}`}>{Number(item.stock).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ui-muted font-bold uppercase tracking-widest border-t border-ui-border pt-3">
                    <span>Unidad</span>
                    <span>{item.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'recibido', label: 'Recibidas' },
              { id: 'en_proceso', label: 'En preparación' },
              { id: 'en_camino', label: 'En camino' },
              { id: 'entregado', label: 'Entregadas' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setOrderFilter(filter.id)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${orderFilter === filter.id ? 'bg-brand-orange text-white' : 'bg-ui-bg text-ui-muted border border-ui-border'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentOrders.map((order) => (
              <div key={order._id} className={`rounded-[2.5rem] border-2 p-6 shadow-sm ${getCardTone(order.status)}`}>
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Número de orden</p>
                    <p className="font-black text-lg text-ui-text">{order.orderNumber || order._id.slice(-6)}</p>
                    <p className="text-sm font-bold text-ui-text mt-2">{order.name}</p>
                  </div>
                  <StatusBadge value={order.status} />
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="rounded-3xl border border-ui-border/60 bg-white/60 p-4">
                      <p className="text-[10px] font-black text-brand-blue uppercase mb-2">Plato {idx + 1}</p>
                      <div className="space-y-1">
                        <div className="text-sm font-black text-ui-text">{item.sauce}</div>
                        <div className="text-sm font-black text-ui-text">{item.protein}</div>
                        <div className="text-sm font-black text-ui-text">{item.complement}</div>
                        <div className="pt-2 mt-2 border-t border-ui-border/60 space-y-1">
                          {getBaseRecipeParts(item.baseRecipe).map((base) => <div key={base} className="text-sm font-black text-ui-text">{base}</div>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-ui-border text-sm">
                  <p className="font-medium text-ui-muted max-w-[60%] line-clamp-2">{order.address}</p>
                  <p className="font-black text-brand-orange">Q{order.total}</p>
                </div>
              </div>
            ))}
            {currentOrders.length === 0 && !isRefreshing && (
              <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-ui-border">
                <p className="text-ui-muted font-bold">No hay pedidos en este estado.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PanelShell>
  )
}

export default AdminPage
