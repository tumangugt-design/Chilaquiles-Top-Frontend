import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import {
  getPendingStaff,
  getUsersByRole,
  getUserOrderHistory,
  saveInventoryItem,
  updateStaffStatus,
  getInventory,
  getOrders
} from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { getBaseRecipeParts, INVENTORY_PRODUCT_OPTIONS, INVENTORY_PRODUCT_MAP } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'
import StaffAccessCard from '../components/ui/StaffAccessCard.jsx'

const emptyItem = { name: '', amount: '', unit: '' }

const getCardTone = (status) => {
  if (status === 'recibido') return 'border-[#FBC02D] bg-[#FFF8D6]'
  if (status === 'en_proceso' || status === 'recolectado' || status === 'en_camino') return 'border-[#E65100] bg-[#FFE8D1]'
  return 'border-[#2E7D32] bg-[#DFF5E2]'
}

const getCardTextTone = (status) => {
  if (status === 'recibido') return 'text-[#5C4400]'
  if (status === 'en_proceso' || status === 'recolectado' || status === 'en_camino') return 'text-[#7A2E00]'
  return 'text-[#14532D]'
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  try {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch (error) {
    return 'Sin fecha'
  }
}

const formatUserSubtitle = (user) => {
  if (user.phone) return user.phone
  if (user.email) return user.email
  return 'Sin contacto'
}

const getHistoryMeta = (type) => {
  if (type === 'client') {
    return {
      title: 'Historial del cliente',
      empty: 'Este cliente todavía no tiene órdenes registradas.'
    }
  }

  if (type === 'chef') {
    return {
      title: 'Historial de cocina',
      empty: 'Este cocinero todavía no tiene órdenes preparadas.'
    }
  }

  return {
    title: 'Historial de reparto',
    empty: 'Este repartidor todavía no tiene órdenes entregadas.'
  }
}

const OrderHistoryCard = ({ order, type = 'client' }) => {
  const basesByPlate = order.items.map((item) => getBaseRecipeParts(item.baseRecipe))
  const showCustomer = type !== 'client'
  const showChef = type === 'client' && order.chefId?.name
  const showRepartidor = type === 'client' && order.repartidorId?.name

  return (
    <div className={`rounded-[2rem] border-2 p-5 shadow-sm ${getCardTone(order.status)} ${getCardTextTone(order.status)}`}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <p className="text-[10px] font-black text-black/55 uppercase tracking-widest">Número de orden</p>
          <p className="font-black text-xl text-black/80">{order.orderNumber || order._id?.slice(-6)}</p>
          <p className="text-xs font-bold text-black/60 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge value={order.status} />
      </div>

      <div className="space-y-3 mb-4">
        {showCustomer && (
          <div className="rounded-2xl border border-black/15 bg-white/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/55">Cliente</p>
            <p className="font-black text-black/80 mt-1">{order.name || order.userId?.name || 'Cliente sin nombre'}</p>
            <p className="text-sm text-black/65">{order.phone || order.userId?.phone || 'Sin teléfono'}</p>
          </div>
        )}

        {showChef && (
          <div className="rounded-2xl border border-black/15 bg-white/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/55">Cocinero</p>
            <p className="font-black text-black/80 mt-1">{order.chefId.name}</p>
          </div>
        )}

        {showRepartidor && (
          <div className="rounded-2xl border border-black/15 bg-white/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/55">Repartidor</p>
            <p className="font-black text-black/80 mt-1">{order.repartidorId.name}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {order.items.map((item, idx) => (
          <div key={`${order._id}-item-${idx}`} className="rounded-2xl border border-black/15 bg-white/70 p-4">
            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">Plato {idx + 1}</p>
            <div className="space-y-1 text-sm font-bold text-black/80">
              <div>{item.sauce}</div>
              <div>{item.protein}</div>
              <div>{item.complement}</div>
            </div>
            <div className="pt-2 mt-2 border-t border-black/15 space-y-1">
              {basesByPlate[idx].length > 0 ? (
                basesByPlate[idx].map((base) => (
                  <div key={`${order._id}-base-${idx}-${base}`} className="text-sm font-bold text-black/70">
                    {base}
                  </div>
                ))
              ) : (
                <div className="text-sm font-bold text-black/50">Sin base adicional</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-black/15 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-black/65 line-clamp-2">{order.address}</p>
        <p className="font-black text-black/80 whitespace-nowrap">Q{order.total}</p>
      </div>
    </div>
  )
}

const UserHistoryModal = ({ modal, onClose, onSearchChange }) => {
  if (!modal.isOpen) return null

  const meta = getHistoryMeta(modal.type)
  const filteredOrders = modal.orders.filter((order) =>
    (order.orderNumber || '').toLowerCase().includes(modal.search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-ui-border bg-ui-card shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-6 sm:px-8 py-6 border-b border-ui-border">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-ui-text tracking-tight">{meta.title}</h3>
            <p className="text-ui-muted font-medium mt-2">
              {modal.user?.name || 'Usuario'} · {formatUserSubtitle(modal.user)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full lg:w-72">
              <input
                value={modal.search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por número de orden"
                className="w-full rounded-2xl border border-ui-border bg-ui-bg px-4 py-3 font-bold text-ui-text outline-none"
              />
            </div>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {modal.loading ? (
            <div className="py-20 text-center">
              <p className="text-ui-muted font-bold">Cargando historial...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/40">
              <p className="text-ui-muted font-bold">
                {modal.orders.length === 0 ? meta.empty : 'No se encontraron órdenes con ese número.'}
              </p>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <OrderHistoryCard key={order._id} order={order} type={modal.type} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StaffRequestCard = ({ user, onApprove }) => (
  <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6">
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="font-black text-lg text-ui-text leading-tight">{user.name || 'Usuario Nuevo'}</p>
        <p className="text-xs font-bold text-ui-muted uppercase tracking-widest mt-1">{user.email || user.phone}</p>
      </div>
      <StatusBadge value={user.status} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button className="col-span-2" onClick={() => onApprove(user._id, 'approved', user.role)}>Aprobar como {user.role}</Button>
      <Button variant="secondary" onClick={() => onApprove(user._id, 'approved', 'CHEF')}>Chef</Button>
      <Button variant="secondary" onClick={() => onApprove(user._id, 'approved', 'REPARTIDOR')}>Repartidor</Button>
      <Button variant="secondary" className="col-span-2 !bg-red-500/10 !text-brand-red !border-red-500/20" onClick={() => onApprove(user._id, 'rejected', user.role)}>
        Denegar Acceso
      </Button>
    </div>
  </div>
)

const ManagementUserCard = ({ user, titleLabel, subtitleLabel, badgeValue, onOpenHistory }) => {
  const isClient = user?.role === 'CLIENT'
  const hasCoordinates =
    typeof user?.location?.lat === 'number' &&
    typeof user?.location?.lng === 'number'

  const addressText = isClient
    ? (
      user?.address?.trim() ||
      (hasCoordinates
        ? `Ubicación compartida: https://www.google.com/maps/search/?api=1&query=${user.location.lat},${user.location.lng}`
        : 'Sin dirección registrada')
    )
    : null

  return (
    <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6 h-full min-h-[22rem] flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0 flex-1">
          <p className="font-black text-lg text-ui-text leading-tight truncate">
            {titleLabel}
          </p>
          <p className="text-xs font-bold text-ui-muted uppercase tracking-widest mt-1 break-all">
            {subtitleLabel}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge value={badgeValue} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isClient ? (
          <div className="rounded-2xl border border-ui-border bg-white/60 px-4 py-3 h-[105px] overflow-y-auto mb-4">
            <p className="text-[10px] uppercase tracking-widest font-black text-ui-muted mb-1">
              Dirección
            </p>
            <p className="text-ui-text font-bold whitespace-normal break-words break-all leading-snug">
              {addressText}
            </p>
          </div>
        ) : (
          <div className="h-[105px] mb-4" />
        )}

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-brand-blue/10 text-brand-blue px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {user?.role}
          </div>

          {user?.createdAt && (
            <div className="rounded-full bg-ui-card border border-ui-border px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {formatDate(user.createdAt)}
            </div>
          )}
        </div>
      </div>

      <Button className="w-full mt-6" onClick={() => onOpenHistory(user)}>
        Historial de órdenes
      </Button>
    </div>
  )
}

const AdminPage = ({ authSession }) => {
  const { session, logout } = authSession
  const [activeTab, setActiveTab] = useState('staff')
  const [orderFilter, setOrderFilter] = useState('all')
  const [pendingUsers, setPendingUsers] = useState([])
  const [inventory, setInventory] = useState([])
  const [clientUsers, setClientUsers] = useState([])
  const [chefUsers, setChefUsers] = useState([])
  const [driverUsers, setDriverUsers] = useState([])
  const [ordersCache, setOrdersCache] = useState({})
  const [itemForm, setItemForm] = useState(emptyItem)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    loading: false,
    search: '',
    type: 'client',
    user: null,
    orders: []
  })
  const knownOrderIds = useRef(new Set())

  const loadRoleUsers = async (role) => {
    const response = await getUsersByRole(role)
    if (role === 'CLIENT') setClientUsers(response.data)
    if (role === 'CHEF') setChefUsers(response.data)
    if (role === 'REPARTIDOR') setDriverUsers(response.data)
  }

  const loadData = async () => {
    setIsRefreshing(true)

    try {
      if (activeTab === 'orders') {
        const response = await getOrders(orderFilter)
        const orders = response.data

        let hasNewOrder = false
        orders.forEach((order) => {
          if (!knownOrderIds.current.has(order._id)) {
            if (knownOrderIds.current.size > 0 && order.status === 'recibido') {
              hasNewOrder = true
            }
            knownOrderIds.current.add(order._id)
          }
        })

        if (hasNewOrder) playNotificationSound()
        setOrdersCache((prev) => ({ ...prev, [orderFilter]: orders }))
      } else if (['staff', 'entries', 'inventory'].includes(activeTab)) {
        const [pendingResponse, inventoryResponse] = await Promise.all([
          getPendingStaff(),
          getInventory()
        ])

        setPendingUsers(pendingResponse.data)
        setInventory(inventoryResponse.data)
      } else if (activeTab === 'clients') {
        await loadRoleUsers('CLIENT')
      } else if (activeTab === 'chefs') {
        await loadRoleUsers('CHEF')
      } else if (activeTab === 'drivers') {
        await loadRoleUsers('REPARTIDOR')
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
    if (!itemForm.name || !itemForm.amount) {
      return toast.error('Selecciona un producto y una cantidad')
    }

    setIsSaving(true)

    try {
      await saveInventoryItem({
        name: itemForm.name,
        unit: itemForm.unit,
        amount: Number(itemForm.amount)
      })

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

  const openHistoryModal = async (type, user) => {
    setHistoryModal({
      isOpen: true,
      loading: true,
      search: '',
      type,
      user,
      orders: []
    })

    try {
      const response = await getUserOrderHistory(type, user._id)
      setHistoryModal({
        isOpen: true,
        loading: false,
        search: '',
        type,
        user,
        orders: response.data
      })
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo cargar el historial.'
      toast.error(message)
      setHistoryModal({
        isOpen: false,
        loading: false,
        search: '',
        type,
        user: null,
        orders: []
      })
    }
  }

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      loading: false,
      search: '',
      type: 'client',
      user: null,
      orders: []
    })
  }

  const updateHistorySearch = (value) => {
    setHistoryModal((prev) => ({
      ...prev,
      search: value
    }))
  }

  if (!session || session.role !== 'ADMIN') {
    return (
      <PanelShell title="Panel Chilaquiles TOP" subtitle="Pedidos, cocina, reparto e inventario">
        <StaffAccessCard
          title="Acceso Administrativo"
          subtitle="Ingresa con tu usuario y contraseña."
          accentClass="!bg-brand-blue"
          authSession={authSession}
        />
      </PanelShell>
    )
  }

  return (
    <PanelShell
      title="Dashboard Administrativo"
      subtitle="Staff, usuarios, entradas de inventario, inventario y pedidos"
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
          ['staff', 'Accesos'],
          ['clients', 'Clientes'],
          ['chefs', 'Usuarios Cocineros'],
          ['drivers', 'Usuarios Repartidores'],
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
            <h2 className="text-xl font-black tracking-tight text-ui-text">Solicitudes</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">
              {pendingUsers.length} pendientes
            </span>
          </div>

          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
                <p className="text-ui-muted text-sm font-medium">No hay solicitudes pendientes.</p>
              </div>
            ) : (
              pendingUsers.map((user) => (
                <StaffRequestCard key={user._id} user={user} onApprove={changeStatus} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Clientes</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">
              {clientUsers.length} registrados
            </span>
          </div>

          {clientUsers.length === 0 ? (
            <div className="text-center py-16 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
              <p className="text-ui-muted text-sm font-medium">No hay clientes registrados.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {clientUsers.map((user) => (
                <ManagementUserCard
                  key={user._id}
                  user={user}
                  titleLabel={user.name || 'Cliente sin nombre'}
                  subtitleLabel={formatUserSubtitle(user)}
                  badgeValue={user.status}
                  onOpenHistory={(selectedUser) => openHistoryModal('client', selectedUser)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chefs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Usuarios Cocineros</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">
              {chefUsers.length} aprobados
            </span>
          </div>

          {chefUsers.length === 0 ? (
            <div className="text-center py-16 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
              <p className="text-ui-muted text-sm font-medium">No hay cocineros aprobados todavía.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {chefUsers.map((user) => (
                <ManagementUserCard
                  key={user._id}
                  user={user}
                  titleLabel={user.name || 'Cocinero sin nombre'}
                  subtitleLabel={formatUserSubtitle(user)}
                  badgeValue={user.status}
                  onOpenHistory={(selectedUser) => openHistoryModal('chef', selectedUser)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Usuarios Repartidores</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">
              {driverUsers.length} aprobados
            </span>
          </div>

          {driverUsers.length === 0 ? (
            <div className="text-center py-16 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
              <p className="text-ui-muted text-sm font-medium">No hay repartidores aprobados todavía.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {driverUsers.map((user) => (
                <ManagementUserCard
                  key={user._id}
                  user={user}
                  titleLabel={user.name || 'Repartidor sin nombre'}
                  subtitleLabel={formatUserSubtitle(user)}
                  badgeValue={user.status}
                  onOpenHistory={(selectedUser) => openHistoryModal('repartidor', selectedUser)}
                />
              ))}
            </div>
          )}
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
                <input
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.amount}
                  onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full !py-5" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Registrar entrada'}
            </Button>
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
                    <span className="text-sm font-black text-brand-blue">
                      {product.usedPerPlate} {product.unit}
                    </span>
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
                    <span className={`text-xl font-black ${item.stock <= item.minimumStock ? 'text-brand-red' : 'text-brand-blue'}`}>
                      {Number(item.stock).toFixed(2)}
                    </span>
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
              <OrderHistoryCard key={order._id} order={order} type="admin" />
            ))}

            {currentOrders.length === 0 && !isRefreshing && (
              <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-ui-border">
                <p className="text-ui-muted font-bold">No hay pedidos en este estado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <UserHistoryModal
        modal={historyModal}
        onClose={closeHistoryModal}
        onSearchChange={updateHistorySearch}
      />
    </PanelShell>
  )
}

export default AdminPage
