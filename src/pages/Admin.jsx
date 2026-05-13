import { useEffect, useRef, useState } from 'react'
import PanelShell from '../components/ui/PanelShell.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import {
  getUsersByRole,
  getUserOrderHistory,
  saveInventoryItem,
  createStaffUser,
  updateStaffUser,
  deleteUser,
  getInventory,
  getOrders,
  syncInventory,
  toggleInventoryStatus,
  getOperatingHours,
  updateOperatingHours,
  getFinancesSummary
} from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { formatBaseRecipe, INVENTORY_PRODUCT_OPTIONS, INVENTORY_PRODUCT_MAP } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'
import StaffAccessCard from '../components/ui/StaffAccessCard.jsx'
import InternalOrder from './InternalOrder.jsx'
import { 
  Users, 
  UserCircle, 
  ChefHat, 
  Truck, 
  PackagePlus, 
  Box, 
  ClipboardList, 
  PlusCircle, 
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  Settings,
  TrendingUp,
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react'
import AdminNavbar from '../components/layout/AdminNavbar.jsx'

const emptyItem = { name: '', amount: '', unit: '', price: '' }

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
  const basesByPlate = order.items.map((item) => formatBaseRecipe(item.baseRecipe))
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
              {basesByPlate[idx] ? (
                <div className="text-sm font-bold text-black/80 uppercase">
                  {basesByPlate[idx]}
                </div>
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
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-ui-border bg-ui-card shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 sm:px-8 py-4 sm:py-6 border-b border-ui-border">
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

const AdminPage = ({ authSession, onProfileClick }) => {
  const { session, logout } = authSession
  const [activeTab, setActiveTab] = useState('staff')
  const [orderFilter, setOrderFilter] = useState('all')
  const [inventory, setInventory] = useState([])
  const [clientUsers, setClientUsers] = useState([])
  const [chefUsers, setChefUsers] = useState([])
  const [driverUsers, setDriverUsers] = useState([])
  const [ordersCache, setOrdersCache] = useState({})
  const [itemForm, setItemForm] = useState(emptyItem)
  const [staffForm, setStaffForm] = useState({ id: null, name: '', phone: '', username: '', password: '', role: 'CHEF' })
  const [scheduleForm, setScheduleForm] = useState({ 
    weekly: {}, 
    specialDates: {}, 
    dateRanges: [], 
    isOpen: true, 
    openTime: '08:00', 
    closeTime: '17:00' 
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [financesSummary, setFinancesSummary] = useState(null)
  const [financesLoading, setFinancesLoading] = useState(false)
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL')
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

  const loadFinances = async () => {
    setFinancesLoading(true)
    try {
      const response = await getFinancesSummary()
      setFinancesSummary(response.data)
    } catch (err) {
      toast.error('No se pudieron cargar las finanzas')
    } finally {
      setFinancesLoading(false)
    }
  }

  const loadData = async () => {
    setIsRefreshing(true)

    try {
      if (activeTab === 'finances') {
        await loadFinances()
      } else if (activeTab === 'orders') {
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
      } else if (activeTab === 'staff') {
        await Promise.all([loadRoleUsers('CHEF'), loadRoleUsers('REPARTIDOR')])
      } else if (['entries', 'inventory'].includes(activeTab)) {
        const inventoryResponse = await getInventory()
        setInventory(inventoryResponse.data)
      } else if (activeTab === 'clients') {
        await loadRoleUsers('CLIENT')
      } else if (activeTab === 'schedule') {
        const scheduleResponse = await getOperatingHours()
        const data = scheduleResponse.data
        setScheduleForm({
          weekly: data?.weekly || {},
          specialDates: data?.specialDates || {},
          dateRanges: data?.dateRanges || [],
          isOpen: Boolean(data?.isOpen),
          openTime: data?.openTime || '',
          closeTime: data?.closeTime || '',
        })
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

  const submitStaffUser = async (e) => {
    e.preventDefault()
    if (!staffForm.name || !staffForm.phone || !staffForm.username || (!staffForm.id && !staffForm.password)) {
      return toast.error('Completa nombre, teléfono, usuario, contraseña y rol')
    }

    try {
      const payload = {
        name: staffForm.name,
        phone: staffForm.phone,
        username: staffForm.username,
        role: staffForm.role,
      }
      if (staffForm.password) payload.password = staffForm.password

      if (staffForm.id) {
        await updateStaffUser(staffForm.id, payload)
        toast.success('Usuario actualizado')
      } else {
        await createStaffUser(payload)
        toast.success('Usuario creado')
      }
      setStaffForm({ id: null, name: '', phone: '', username: '', password: '', role: 'CHEF' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el usuario')
    }
  }

  const editStaffUser = (user) => {
    setStaffForm({
      id: user._id,
      name: user.name || '',
      phone: user.phone || '',
      username: user.username || '',
      password: '',
      role: user.role || 'CHEF',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeStaffUser = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name || user.username}?`)) return
    try {
      await deleteUser(user._id)
      toast.success('Usuario eliminado')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar el usuario')
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
        amount: Number(itemForm.amount),
        price: Number(itemForm.price || 0)
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

  const handleSyncInventory = async () => {
    const loadingToast = toast.loading('Sincronizando catálogo...')
    try {
      await syncInventory()
      toast.success('Inventario sincronizado', { id: loadingToast })
      loadData()
    } catch (err) {
      toast.error('Error al sincronizar', { id: loadingToast })
    }
  }

  const handleToggleStatus = async (name, currentStatus) => {
    try {
      await toggleInventoryStatus(name, !currentStatus)
      toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'}`)
      loadData()
    } catch (err) {
      toast.error('No se pudo cambiar el estado')
    }
  }

  const saveSchedule = async (event) => {
    if (event) event.preventDefault()
    setIsSaving(true)
    try {
      const response = await updateOperatingHours(scheduleForm)
      const data = response.data?.settings || scheduleForm
      setScheduleForm({
        weekly: data.weekly || {},
        specialDates: data.specialDates || {},
        dateRanges: data.dateRanges || [],
        isOpen: Boolean(data.isOpen),
        openTime: data.openTime || '',
        closeTime: data.closeTime || '',
      })
      toast.success('Horario actualizado con éxito')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el horario')
    } finally {
      setIsSaving(false)
    }
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
      <StaffAccessCard
        title="Acceso Administrativo"
        subtitle="Ingresa con tu usuario y contraseña."
        accentClass="!bg-brand-blue"
        authSession={authSession}
        isAdmin={true}
      />
    )
  }

  return (
    <div className="min-h-screen bg-ui-bg">
      <AdminNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        session={session} 
        logout={logout}
        onProfileClick={onProfileClick}
      />

      <div className="pt-20 flex flex-col min-h-screen">
        <main className="flex-1 p-2 sm:p-6 lg:p-10">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 lg:p-12 shadow-2xl shadow-brand-blue/5 border border-ui-border min-h-full">
            {activeTab === 'internal_order' ? (
              <InternalOrder onSuccess={() => setActiveTab('orders')} />
            ) : activeTab === 'finances' ? (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between border-b border-ui-border pb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-ui-text">Finanzas</h2>
                    <p className="text-sm text-ui-muted mt-1">Resumen de ventas, costos y utilidades.</p>
                  </div>
                  {financesLoading && <div className="animate-pulse text-brand-blue font-black text-xs uppercase">Cargando datos...</div>}
                </div>

                {!financesSummary ? (
                  <div className="py-20 text-center rounded-[3rem] border border-dashed border-ui-border bg-ui-bg/20">
                    <p className="text-ui-muted font-bold">No hay datos financieros disponibles por el momento.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {[
                      { title: 'Hoy', data: financesSummary.daily },
                      { title: 'Esta Semana', data: financesSummary.weekly },
                      { title: 'Este Mes', data: financesSummary.monthly }
                    ].map((period) => (
                      <div key={period.title} className="space-y-5">
                        <h3 className="text-xl font-black text-ui-text ml-2">{period.title}</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="rounded-[2.5rem] border border-ui-border bg-brand-blue/5 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                                <TrendingUp size={20} />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-ui-muted">Ventas</p>
                            </div>
                            <p className="text-3xl font-black text-brand-blue">Q{period.data.revenue.toFixed(2)}</p>
                            <p className="text-[10px] font-bold text-ui-muted mt-2">{period.data.orderCount} pedidos completados</p>
                          </div>

                          <div className="rounded-[2.5rem] border border-ui-border bg-brand-orange/5 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                                <DollarSign size={20} />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-ui-muted">Costos (Entradas)</p>
                            </div>
                            <p className="text-3xl font-black text-brand-orange">Q{period.data.costs.toFixed(2)}</p>
                            <p className="text-[10px] font-bold text-ui-muted mt-2">Inversión en ingredientes</p>
                          </div>

                          <div className="rounded-[2.5rem] border border-ui-border bg-green-500/5 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                                <Box size={20} />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-ui-muted">Utilidades</p>
                            </div>
                            <p className={`text-3xl font-black ${period.data.utilities >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                              Q{period.data.utilities.toFixed(2)}
                            </p>
                            <p className="text-[10px] font-bold text-ui-muted mt-2">Ganancia neta aproximada</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>

      {activeTab === 'staff' && (
        <div className="space-y-8 animate-fade-in">
          <form onSubmit={submitStaffUser} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-ui-border pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-ui-text">Usuarios</h2>
                <p className="text-sm text-ui-muted mt-1">El admin crea las cuentas de Chef y Repartidor. Ya no hay solicitudes ni aprobaciones.</p>
              </div>
              {staffForm.id && (
                <Button type="button" variant="secondary" onClick={() => setStaffForm({ id: null, name: '', phone: '', username: '', password: '', role: 'CHEF' })}>
                  Cancelar edición
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
              <input className="p-4 rounded-2xl border border-ui-border bg-white font-bold" placeholder="Nombre completo" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
              <input className="p-4 rounded-2xl border border-ui-border bg-white font-bold" placeholder="Teléfono" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
              <input className="p-4 rounded-2xl border border-ui-border bg-white font-bold" placeholder="Usuario" value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value.toLowerCase() })} disabled={Boolean(staffForm.id)} />
              <input type="password" className="p-4 rounded-2xl border border-ui-border bg-white font-bold" placeholder={staffForm.id ? 'Nueva contraseña opcional' : 'Contraseña'} value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
              <select className="p-4 rounded-2xl border border-ui-border bg-white font-bold" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                <option value="CHEF">Chef</option>
                <option value="REPARTIDOR">Repartidor</option>
              </select>
            </div>

            <Button type="submit" className="w-full md:w-auto !px-10 !py-4">
              {staffForm.id ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </form>

          <div className="grid lg:grid-cols-2 gap-6">
            {[{ title: 'Chefs', users: chefUsers }, { title: 'Repartidores', users: driverUsers }].map((group) => (
              <div key={group.title} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-ui-border pb-3">
                  <h3 className="font-black text-ui-text text-lg">{group.title}</h3>
                  <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">{group.users.length}</span>
                </div>
                {group.users.length === 0 ? (
                  <p className="text-center py-10 text-ui-muted font-bold">No hay usuarios creados.</p>
                ) : (
                  <div className="space-y-3">
                    {group.users.map((user) => (
                      <div key={user._id} className="rounded-2xl border border-ui-border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-black text-ui-text">{user.name || user.username}</p>
                          <p className="text-xs font-bold text-ui-muted">{user.phone || 'Sin teléfono'} · {user.username}</p>
                          <p className="text-[10px] font-black text-brand-blue uppercase mt-1">{user.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" onClick={() => editStaffUser(user)}>Editar</Button>
                          <Button type="button" variant="secondary" className="!bg-red-500/10 !text-brand-red !border-red-500/20" onClick={() => removeStaffUser(user)}>Eliminar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'clients'  && (
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

            <div className="grid md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Precio Total (Q)</label>
                <input
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.price}
                  placeholder="0.00"
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
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
              {INVENTORY_PRODUCT_OPTIONS.map((product) => {
                const inventoryItem = inventory.find(i => i.name === product.value)
                const unitCost = inventoryItem?.lastPrice || 0
                const totalCost = unitCost * product.usedPerPlate
                return (
                  <div key={product.value} className="rounded-2xl border border-ui-border bg-white/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-black text-ui-text truncate">{product.label}</p>
                        <p className="text-[10px] uppercase tracking-widest text-ui-muted font-black mt-1">
                          {product.category} · Q{unitCost.toFixed(2)}/{product.unit}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-brand-blue">
                          {product.usedPerPlate} {product.unit}
                        </p>
                        <p className="text-[10px] font-black text-green-600 mt-0.5">
                          Q{totalCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-ui-text">Inventario</h2>
              <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Estado de stock y catálogo</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={16} />
                <select 
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-ui-border bg-white font-black text-[10px] uppercase tracking-widest outline-none"
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                >
                  <option value="ALL">Todas las categorías</option>
                  <option value="Base">Bases</option>
                  <option value="Salsas">Salsas</option>
                  <option value="Proteínas">Proteínas</option>
                  <option value="Complementos">Complementos</option>
                  <option value="Empaque">Empaque</option>
                </select>
              </div>
              <Button variant="secondary" className="w-full sm:w-auto !bg-brand-blue/10 !text-brand-blue !border-brand-blue/20" onClick={handleSyncInventory}>
                Sincronizar Catálogo
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inventory
              .filter(item => {
                if (inventoryCategoryFilter === 'ALL') return true
                const meta = INVENTORY_PRODUCT_MAP[item.name]
                return meta?.category === inventoryCategoryFilter
              })
              .map((item) => {
              const meta = INVENTORY_PRODUCT_MAP[item.name]
              return (
                <div key={item._id} className={`rounded-[2rem] border border-ui-border p-5 transition-all ${item.isActive === false ? 'bg-black/5 opacity-70 grayscale' : 'bg-ui-bg/40'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-black text-ui-text capitalize leading-tight truncate">{meta?.label || item.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mt-1">{meta?.category || 'Inventario'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.stock <= item.minimumStock ? 'text-brand-red' : 'text-brand-blue'}`}>
                        {Number(item.stock).toFixed(2)}
                      </p>
                      <p className="text-[10px] font-bold text-ui-muted uppercase">{item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 gap-2">
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.isActive === false ? 'bg-ui-muted/20 text-ui-muted' : 'bg-green-500/10 text-green-600'}`}>
                      {item.isActive === false ? 'Inactivo' : 'Activo'}
                    </div>
                    <button 
                      onClick={() => handleToggleStatus(item.name, item.isActive ?? true)}
                      className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-xl transition-all border ${
                        item.isActive === false 
                          ? 'border-brand-blue text-brand-blue hover:bg-brand-blue/10' 
                          : 'border-brand-red text-brand-red hover:bg-brand-red/10'
                      }`}
                    >
                      {item.isActive === false ? 'Activar' : 'Desactivar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}


      {activeTab === 'schedule' && (
        <div className="space-y-8 animate-fade-in">
          <div className="border-b border-ui-border pb-4">
            <h2 className="text-2xl font-black tracking-tight text-ui-text">Configuración de Horario</h2>
            <p className="text-sm text-ui-muted mt-1">Administra el horario semanal, fechas especiales y cierres temporales.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Weekly Schedule */}
            <div className="rounded-[2.5rem] border border-ui-border bg-ui-bg/40 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-brand-blue" size={24} />
                <h3 className="text-xl font-black text-ui-text">Horario Semanal</h3>
              </div>
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayNames = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' }
                  const config = scheduleForm.weekly[day] || { isOpen: false, openTime: '08:00', closeTime: '17:00' }
                  return (
                    <div key={day} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-ui-border shadow-sm">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          checked={config.isOpen} 
                          onChange={(e) => setScheduleForm({
                            ...scheduleForm,
                            weekly: { ...scheduleForm.weekly, [day]: { ...config, isOpen: e.target.checked } }
                          })}
                          className="w-5 h-5 rounded-lg border-ui-border text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="font-bold text-ui-text w-24">{dayNames[day]}</span>
                      </div>
                      {config.isOpen && (
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={config.openTime} 
                            onChange={(e) => setScheduleForm({
                              ...scheduleForm,
                              weekly: { ...scheduleForm.weekly, [day]: { ...config, openTime: e.target.value } }
                            })}
                            className="p-2 text-xs font-black rounded-lg border border-ui-border bg-ui-bg"
                          />
                          <span className="text-ui-muted text-xs font-black">-</span>
                          <input 
                            type="time" 
                            value={config.closeTime} 
                            onChange={(e) => setScheduleForm({
                              ...scheduleForm,
                              weekly: { ...scheduleForm.weekly, [day]: { ...config, closeTime: e.target.value } }
                            })}
                            className="p-2 text-xs font-black rounded-lg border border-ui-border bg-ui-bg"
                          />
                        </div>
                      )}
                      {!config.isOpen && <span className="text-[10px] font-black uppercase text-brand-red tracking-widest px-3 py-1 bg-red-50 rounded-full">Cerrado</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Special Dates & Ranges */}
            <div className="space-y-8">
              <div className="rounded-[2.5rem] border border-ui-border bg-ui-bg/40 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-brand-orange" size={24} />
                  <h3 className="text-xl font-black text-ui-text">Fechas Especiales</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-ui-muted font-bold">Programa cierres o cambios de horario para días específicos (ej. Navidad, Feriados).</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      id="special-date-input"
                      className="p-3 rounded-xl border border-ui-border bg-white text-xs font-black"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const dateInput = document.getElementById('special-date-input')
                        if (dateInput.value) {
                          setScheduleForm({
                            ...scheduleForm,
                            specialDates: { ...scheduleForm.specialDates, [dateInput.value]: { isOpen: false, note: 'Cerrado' } }
                          })
                          dateInput.value = ''
                        }
                      }}
                      className="bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest px-4 hover:shadow-lg transition-all"
                    >
                      Añadir Día
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {Object.entries(scheduleForm.specialDates).map(([date, config]) => (
                      <div key={date} className="flex items-center justify-between p-3 rounded-xl bg-white border border-ui-border">
                        <div>
                          <p className="text-xs font-black text-ui-text">{date}</p>
                          <p className="text-[10px] font-bold text-brand-red uppercase">{config.isOpen ? 'Horario Especial' : 'Cerrado Total'}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newSpecial = { ...scheduleForm.specialDates }
                            delete newSpecial[date]
                            setScheduleForm({ ...scheduleForm, specialDates: newSpecial })
                          }}
                          className="p-2 text-brand-red hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {Object.keys(scheduleForm.specialDates).length === 0 && (
                      <p className="text-center py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">No hay fechas especiales</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-ui-border bg-ui-bg/40 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Box className="text-green-600" size={24} />
                  <h3 className="text-xl font-black text-ui-text">Estado Manual (Legacy)</h3>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-ui-border">
                  <p className="text-sm font-bold text-ui-text">Forzar apertura inmediata</p>
                  <button
                    type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, isOpen: !scheduleForm.isOpen })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${scheduleForm.isOpen ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'bg-red-500/10 text-red-700 border-red-500/30'}`}
                  >
                    {scheduleForm.isOpen ? 'Abierto' : 'Cerrado'}
                  </button>
                </div>
              </div>

              <Button onClick={saveSchedule} className="w-full !py-6 !text-lg" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Aplicar Todos los Cambios'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ui-border pb-6 mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-ui-text">Pedidos</h2>
              <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Gestión de órdenes en tiempo real</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${isRefreshing ? 'bg-brand-blue/10 text-brand-blue animate-pulse' : 'bg-ui-bg text-ui-muted border border-ui-border'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-brand-blue' : 'bg-ui-muted'}`} />
                {isRefreshing ? 'Sincronizando...' : 'Sincronizado'}
              </span>
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-2xl bg-ui-bg border border-ui-border text-ui-text hover:bg-ui-bg/80 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Refrescar Pedidos"
              >
                <Bell size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

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
              </>
            )}
          </div>
        </main>
      </div>

      <UserHistoryModal
        modal={historyModal}
        onClose={closeHistoryModal}
        onSearchChange={updateHistorySearch}
      />
      
      <footer className="py-10 text-center">
        <p className="text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] opacity-40">
          Chilaquiles TOP · Sistema de Gestión Administrativa
        </p>
      </footer>
    </div>
  )
}

export default AdminPage
