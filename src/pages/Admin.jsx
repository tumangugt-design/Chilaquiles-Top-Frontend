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
  updateInventoryPrice,
  updateInventoryStock,
  getOperatingHours,
  updateOperatingHours,
  getPromotions,
  updatePromotions,
  getCalculatorCosts,
  updateCalculatorCosts,
  getFinancesSummary,
  getAvailablePlates
} from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { formatBaseRecipe, INVENTORY_PRODUCT_OPTIONS, INVENTORY_PRODUCT_MAP, getAllowedInputUnits, convertInventoryAmountToBaseUnit } from '../shared/constants/index.jsx'
import toast from 'react-hot-toast'
import StaffAccessCard from '../components/ui/StaffAccessCard.jsx'
import InternalOrder from './InternalOrder.jsx'
import { 
  Search,
  Settings,
  TrendingUp,
  Calendar,
  Filter,
  DollarSign,
  Clock,
  Box,
  Bell,
  Menu,
  X,
  PlusCircle,
  LogOut,
  Users,
  UserCircle,
  ChefHat,
  Truck,
  PackagePlus,
  ClipboardList
} from 'lucide-react'
import AdminNavbar from '../components/layout/AdminNavbar.jsx'

const emptyItem = { name: '', amount: '', unit: '', price: '' }

const SCHEDULE_DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const normalizeScheduleWeekly = (weekly = {}) => {
  return Object.entries(SCHEDULE_DAY_INDEX).reduce((acc, [day, index]) => {
    const current = weekly?.[day] || weekly?.[String(index)] || weekly?.[index] || {}
    acc[day] = {
      isOpen: current.isOpen === undefined ? true : Boolean(current.isOpen),
      openTime: current.openTime || '08:00',
      closeTime: current.closeTime || '17:00',
    }
    return acc
  }, {})
}



const formatInventoryAmount = (value) => {
  const numeric = Number(value || 0)
  if (Number.isNaN(numeric)) return '0'
  if (Number.isInteger(numeric)) return String(numeric)
  return numeric.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

const getPlatesByIngredient = (item) => {
  const meta = INVENTORY_PRODUCT_MAP[item.name]
  const required = Number(meta?.usedPerPlate || 0)
  if (!required || required <= 0) return null
  return Math.floor(Number(item.stock || 0) / required)
}

const getStockAlertItems = (items = []) => {
  return items
    .map((item) => {
      const meta = INVENTORY_PRODUCT_MAP[item.name]
      const required = Number(meta?.usedPerPlate || 0)
      const stock = Number(item.stock || 0)
      if (!meta || !required || required <= 0 || item.isActive === false || stock >= required) return null
      return {
        name: meta.label || item.name,
        stock,
        unit: meta.unit || item.unit || '',
        required,
        requiredUnit: meta.displayUnit || meta.unit || item.unit || '',
        requiredLabel: `${formatInventoryAmount(meta.displayUsedPerPlate ?? required)} ${meta.displayUnit || meta.unit || item.unit || ''}`.trim(),
      }
    })
    .filter(Boolean)
}

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
          {order.sauceTemperature && (
            <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${order.sauceTemperature === 'FRIO' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              <span className="text-xs">{order.sauceTemperature === 'FRIO' ? '🧊' : '♨️'}</span> Salsa {order.sauceTemperature}
            </div>
          )}
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
  const [priceEditForm, setPriceEditForm] = useState({ name: null, price: '' })
  const [stockEditForm, setStockEditForm] = useState({ name: null, stock: '', unit: '' })
  const [staffForm, setStaffForm] = useState({ id: null, name: '', phone: '', username: '', password: '', role: 'CHEF' })
  const [scheduleForm, setScheduleForm] = useState({ 
    weekly: normalizeScheduleWeekly(), 
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
  const [stockAlert, setStockAlert] = useState({ isOpen: false, platesCount: null, items: [] })
  const [promotions, setPromotions] = useState([])
  const [promoForm, setPromoForm] = useState({
    id: null,
    name: '',
    description: '',
    promoPrice: '',
    isActive: false,
    startDate: '',
    endDate: '',
    imageUrl: '',
  })
  const [calcPlate, setCalcPlate] = useState({
    sauce: 'ROJA',
    protein: 'POLLO',
    complement: 'CEBOLLA_CARAMELIZADA',
    baseRecipe: { cream: true, onion: true, cilantro: true }
  })
  const [calcPromoPlates, setCalcPromoPlates] = useState('2')
  const [calcPromoPrice, setCalcPromoPrice] = useState('55')
  const [simulatedCosts, setSimulatedCosts] = useState({})
  const stockAlertLoaded = useRef(false)
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
      // The API returns { success: true, data: { daily, weekly, monthly } }
      setFinancesSummary(response.data.data || response.data)
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
      } else if (activeTab === 'promotions') {
        const [promotionsResponse, inventoryResponse, calcCostsResponse] = await Promise.all([
          getPromotions(),
          getInventory(),
          getCalculatorCosts().catch(() => ({ data: {} }))
        ])
        setPromotions(promotionsResponse.data || [])
        setInventory(inventoryResponse.data || [])
        setSimulatedCosts(calcCostsResponse.data || {})
      } else if (activeTab === 'clients') {
        await loadRoleUsers('CLIENT')
      } else if (activeTab === 'schedule') {
        const scheduleResponse = await getOperatingHours()
        const data = scheduleResponse.data
        setScheduleForm({
          weekly: normalizeScheduleWeekly(data?.weekly || {}),
          specialDates: data?.specialDates || {},
          dateRanges: data?.dateRanges || [],
          isOpen: data?.isOpen === undefined ? true : Boolean(data?.isOpen),
          openTime: data?.openTime || '08:00',
          closeTime: data?.closeTime || '17:00',
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

  const loadStockAlert = async () => {
    try {
      const [inventoryResponse, platesResponse] = await Promise.all([getInventory(), getAvailablePlates()])
      const items = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : []
      const platesCount = Number(platesResponse.data?.count ?? 0)
      const alertItems = getStockAlertItems(items)

      setStockAlert({
        isOpen: alertItems.length > 0 || platesCount <= 5,
        platesCount,
        items: alertItems,
      })
    } catch (error) {
      console.error('No se pudo cargar alerta de inventario:', error)
    }
  }


  useEffect(() => {
    if (session?.role === 'ADMIN' && session?.status === 'approved') {
      loadData()

      // Evita que formularios editables, como Horario, Entradas, Stock o Usuarios,
      // se reinicien cada 5 segundos mientras el admin está escribiendo.
      // El refresco automático solo es necesario en Pedidos para detectar órdenes nuevas.
      if (activeTab !== 'orders') return

      const interval = setInterval(loadData, 5000)
      return () => clearInterval(interval)
    }
  }, [session, activeTab, orderFilter])


  useEffect(() => {
    if (session?.role === 'ADMIN' && session?.status === 'approved' && !stockAlertLoaded.current) {
      stockAlertLoaded.current = true
      loadStockAlert()
    }
  }, [session])

  const openStockFromAlert = () => {
    setStockAlert((prev) => ({ ...prev, isOpen: false }))
    setActiveTab('inventory')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      const product = INVENTORY_PRODUCT_MAP[itemForm.name]
      const storedAmount = convertInventoryAmountToBaseUnit(itemForm.amount, itemForm.unit, product)

      await saveInventoryItem({
        name: itemForm.name,
        inputUnit: itemForm.unit,
        amount: Number(itemForm.amount),
        totalPrice: itemForm.price === '' ? null : Number(itemForm.price)
      })

      toast.success(`Entrada registrada: ${storedAmount.toFixed(2)} ${product?.unit || ''}`)
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
    const allowedUnits = getAllowedInputUnits(product)
    setItemForm({
      name: value,
      amount: itemForm.amount,
      unit: allowedUnits[0]?.value || product?.unit || '',
      price: itemForm.price,
    })
  }

  const selectedInventoryProduct = INVENTORY_PRODUCT_MAP[itemForm.name]
  const entryStoredAmount = convertInventoryAmountToBaseUnit(itemForm.amount, itemForm.unit, selectedInventoryProduct)
  const entryTotalPrice = itemForm.price === '' ? null : Number(itemForm.price)

  const handleStartPriceEdit = (product, currentPrice) => {
    setPriceEditForm({
      name: product.value,
      price: String(Number(currentPrice || 0))
    })
  }

  const handleCancelPriceEdit = () => {
    setPriceEditForm({ name: null, price: '' })
  }

  const handleSaveProductPrice = async (product) => {
    const price = Number(priceEditForm.price)

    if (Number.isNaN(price) || price < 0) {
      return toast.error('Ingresa un precio válido mayor o igual a cero')
    }

    setIsSaving(true)
    try {
      await updateInventoryPrice(product.value, price)
      toast.success(`Precio actualizado para ${product.label}`)
      setPriceEditForm({ name: null, price: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el precio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartStockEdit = (item) => {
    const meta = INVENTORY_PRODUCT_MAP[item.name]
    const allowedUnits = getAllowedInputUnits(meta)
    setStockEditForm({
      name: item.name,
      stock: String(Number(item.stock || 0)),
      unit: allowedUnits[0]?.value || meta?.unit || item.unit || ''
    })
  }

  const handleCancelStockEdit = () => {
    setStockEditForm({ name: null, stock: '', unit: '' })
  }

  const handleSaveStockEdit = async (item) => {
    const stock = Number(stockEditForm.stock)
    const meta = INVENTORY_PRODUCT_MAP[item.name]

    if (Number.isNaN(stock) || stock < 0) {
      return toast.error('Ingresa un stock válido mayor o igual a cero')
    }

    setIsSaving(true)
    try {
      const storedStock = convertInventoryAmountToBaseUnit(stock, stockEditForm.unit, meta)
      await updateInventoryStock(item.name, stock, stockEditForm.unit)
      toast.success(`Stock actualizado para ${meta?.label || item.name}: ${storedStock.toFixed(2)} ${meta?.unit || item.unit}`)
      setStockEditForm({ name: null, stock: '', unit: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el stock')
    } finally {
      setIsSaving(false)
    }
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
    const meta = INVENTORY_PRODUCT_MAP[name]
    const isPackaging = meta?.category === 'Empaque'

    if (isPackaging && currentStatus !== false) {
      toast.error('Los productos de empaque son obligatorios y no se pueden desactivar.')
      return
    }

    try {
      await toggleInventoryStatus(name, !currentStatus)
      toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'}`)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado')
    }
  }

  const saveSchedule = async (event) => {
    if (event) event.preventDefault()
    setIsSaving(true)
    try {
      const response = await updateOperatingHours(scheduleForm)
      const data = response.data?.settings || scheduleForm
      setScheduleForm({
        weekly: normalizeScheduleWeekly(data.weekly || {}),
        specialDates: data.specialDates || {},
        dateRanges: data.dateRanges || [],
        isOpen: data.isOpen === undefined ? true : Boolean(data.isOpen),
        openTime: data.openTime || '08:00',
        closeTime: data.closeTime || '17:00',
      })
      toast.success('Horario actualizado con éxito')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el horario')
    } finally {
      setIsSaving(false)
    }
  }

  const getProductCost = (name) => {
    const item = inventory.find(i => i.name === name)
    return Number(item?.lastPrice || 0)
  }

  const getIngredientCost = (name, plate) => {
    // Check if it's one of the selected ingredients in the plate configuration
    const activeIngredients = []
    if (plate?.sauce === 'ROJA') activeIngredients.push('salsa roja')
    else if (plate?.sauce === 'VERDE') activeIngredients.push('salsa verde')
    else if (plate?.sauce === 'DIVORCIADOS') {
      activeIngredients.push('salsa roja')
      activeIngredients.push('salsa verde')
    }
    
    if (plate?.protein === 'POLLO') activeIngredients.push('pollo')
    else if (plate?.protein === 'STEAK') activeIngredients.push('steak')
    else if (plate?.protein === 'CHORIZO') activeIngredients.push('chorizo')
    
    if (plate?.complement === 'AGUACATE') activeIngredients.push('aguacate')
    else if (plate?.complement === 'CEBOLLA_CARAMELIZADA' || plate?.complement === 'CEBOLLA CARAMELIZADA') activeIngredients.push('cebolla caramelizada')
    else if (plate?.complement === 'QUESO_EXTRA' || plate?.complement === 'QUESO EXTRA') activeIngredients.push('queso extra')

    const isActive = activeIngredients.includes(name)

    const sim = simulatedCosts[name]
    const qtyVal = Number(sim?.qty)
    const priceVal = Number(sim?.price)
    
    if (qtyVal > 0 && priceVal > 0) {
      const product = INVENTORY_PRODUCT_MAP[name]
      if (product) {
        const baseQty = convertInventoryAmountToBaseUnit(qtyVal, sim.unit, product)
        if (baseQty > 0) {
          const costPerBaseUnit = priceVal / baseQty
          return costPerBaseUnit * (product.usedPerPlate || 0)
        }
      }
    }

    if (isActive) {
      return 0
    }

    return getProductCost(name)
  }

  const calculatePlateRecipeCost = (plate) => {
    let cost = 0
    cost += getIngredientCost('plato rectangular', plate)
    cost += getIngredientCost('tenedor', plate)
    cost += getIngredientCost('servilleta', plate)
    cost += getIngredientCost('sticker', plate)
    
    cost += getIngredientCost('totopos', plate)
    cost += getIngredientCost('queso', plate)
    if (plate.baseRecipe?.cream !== false) cost += getIngredientCost('crema', plate)
    if (plate.baseRecipe?.onion !== false) cost += getIngredientCost('cebolla', plate)
    if (plate.baseRecipe?.cilantro !== false) cost += getIngredientCost('cilantro', plate)

    if (plate.sauce === 'ROJA') {
      cost += getIngredientCost('salsa roja', plate)
      cost += getIngredientCost('plato de 8 onz', plate)
      cost += getIngredientCost('tapadera de 8 onz', plate)
    } else if (plate.sauce === 'VERDE') {
      cost += getIngredientCost('salsa verde', plate)
      cost += getIngredientCost('plato de 8 onz', plate)
      cost += getIngredientCost('tapadera de 8 onz', plate)
    } else if (plate.sauce === 'DIVORCIADOS') {
      cost += getIngredientCost('salsa roja', plate) * 0.5
      cost += getIngredientCost('salsa verde', plate) * 0.5
      cost += getIngredientCost('plato de 4 onz', plate) * 2
      cost += getIngredientCost('tapadera de 4 onz', plate) * 2
    }

    if (plate.protein === 'STEAK') cost += getIngredientCost('steak', plate)
    if (plate.protein === 'POLLO') cost += getIngredientCost('pollo', plate)
    if (plate.protein === 'CHORIZO') cost += getIngredientCost('chorizo', plate)

    if (plate.complement === 'AGUACATE') cost += getIngredientCost('aguacate', plate)
    if (plate.complement === 'CEBOLLA_CARAMELIZADA' || plate.complement === 'CEBOLLA CARAMELIZADA') cost += getIngredientCost('cebolla caramelizada', plate)
    if (plate.complement === 'QUESO_EXTRA' || plate.complement === 'QUESO EXTRA') cost += getIngredientCost('queso extra', plate)

    return cost
  }

  const handleSaveCalculatorCost = async (ingredientName) => {
    try {
      const item = simulatedCosts[ingredientName]
      if (!item || !item.qty || !item.price) {
        return toast.error('Ingresa cantidad y precio para guardar')
      }
      
      const response = await getCalculatorCosts().catch(() => ({ data: {} }))
      const current = response.data || {}
      
      const updated = {
        ...current,
        [ingredientName]: {
          qty: item.qty,
          unit: item.unit,
          price: item.price
        }
      }
      
      await updateCalculatorCosts(updated)
      setSimulatedCosts(updated)
      toast.success(`Costo de ${INVENTORY_PRODUCT_MAP[ingredientName]?.label || ingredientName} guardado con éxito`)
    } catch (err) {
      toast.error('No se pudo guardar el costo del ingrediente')
    }
  }

  const handleSavePromotion = async (e) => {
    if (e) e.preventDefault()
    if (!promoForm.name) {
      return toast.error('Ingresa el nombre de la promoción')
    }

    let priceNum = null
    if (promoForm.promoPrice) {
      priceNum = Number(promoForm.promoPrice)
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        return toast.error('Ingresa un precio de promoción válido')
      }
    }

    setIsSaving(true)
    try {
      let updatedPromos = []
      if (promoForm.id) {
        updatedPromos = promotions.map(p => p.id === promoForm.id ? { ...p, ...promoForm, promoPrice: priceNum } : p)
      } else {
        const newPromo = {
          ...promoForm,
          id: Math.random().toString(36).slice(2, 11),
          promoPrice: priceNum
        }
        updatedPromos = [...promotions, newPromo]
      }

      await updatePromotions(updatedPromos)
      setPromotions(updatedPromos)
      toast.success(promoForm.id ? 'Promoción actualizada con éxito' : 'Promoción creada con éxito')
      setPromoForm({
        id: null,
        name: '',
        description: '',
        promoPrice: '',
        isActive: false,
        startDate: '',
        endDate: '',
        imageUrl: '',
      })
    } catch (err) {
      toast.error('No se pudo guardar la promoción')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePromoStatus = async (id, currentStatus) => {
    const updatedPromos = promotions.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p)
    try {
      await updatePromotions(updatedPromos)
      setPromotions(updatedPromos)
      toast.success(`Promoción ${!currentStatus ? 'activada' : 'desactivada'}`)
    } catch (err) {
      toast.error('No se pudo cambiar el estado de la promoción')
    }
  }

  const handleDeletePromotion = async (id) => {
    const updatedPromos = promotions.filter(p => p.id !== id)
    try {
      await updatePromotions(updatedPromos)
      setPromotions(updatedPromos)
      toast.success('Promoción eliminada')
    } catch (err) {
      toast.error('No se pudo eliminar la promoción')
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
    <div className="min-h-screen bg-ui-bg overflow-x-hidden">
      <AdminNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        session={session} 
        logout={logout}
        onProfileClick={onProfileClick}
      />


      {stockAlert.isOpen && (
        <div className="fixed inset-x-3 top-24 z-[70] mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[2rem] border border-orange-300 bg-white p-4 shadow-2xl shadow-orange-900/10 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600">Alerta de inventario</p>
              <h3 className="mt-1 text-lg font-black text-ui-text">Revisar stock antes de vender</h3>
            </div>
            <button
              type="button"
              onClick={() => setStockAlert((prev) => ({ ...prev, isOpen: false }))}
              className="rounded-full border border-ui-border bg-ui-bg px-3 py-1 text-xs font-black text-ui-muted"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {stockAlert.platesCount !== null && stockAlert.platesCount <= 5 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-700">
                Quedan solo {stockAlert.platesCount} platos disponibles.
              </div>
            )}

            {stockAlert.items.slice(0, 6).map((item) => (
              <div key={item.name} className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">
                <span className="font-black">{item.name}</span>: disponible {formatInventoryAmount(item.stock)} {item.unit}. Necesario para 1 plato: {item.requiredLabel}.
              </div>
            ))}

            {stockAlert.items.length > 6 && (
              <p className="text-xs font-bold text-ui-muted">Y {stockAlert.items.length - 6} productos más con stock insuficiente.</p>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={openStockFromAlert} className="!py-3">
              Revisar stock
            </Button>
          </div>
        </div>
      )}

      <div className="pt-20 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-full overflow-x-hidden p-2 sm:p-6 lg:p-10">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 lg:p-12 shadow-2xl shadow-brand-blue/5 border border-ui-border min-h-full overflow-hidden">
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
                            <p className="text-3xl font-black text-brand-blue">Q{period.data?.revenue?.toFixed(2) || '0.00'}</p>
                            <p className="text-[10px] font-bold text-ui-muted mt-2">{period.data?.orderCount || 0} pedidos completados</p>
                          </div>

                          <div className="rounded-[2.5rem] border border-ui-border bg-brand-orange/5 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                                <DollarSign size={20} />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-ui-muted">Costos (Entradas)</p>
                            </div>
                            <p className="text-3xl font-black text-brand-orange">Q{period.data?.costs?.toFixed(2) || '0.00'}</p>
                            <p className="text-[10px] font-bold text-ui-muted mt-2">Inversión en ingredientes</p>
                          </div>

                          <div className="rounded-[2.5rem] border border-ui-border bg-green-500/5 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                                <Box size={20} />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-ui-muted">Utilidades</p>
                            </div>
                            <p className={`text-3xl font-black ${(period.data?.utilities || 0) >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                              Q{period.data?.utilities?.toFixed(2) || '0.00'}
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
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-4 sm:gap-8 animate-fade-in min-w-0">
          <form onSubmit={submitInventory} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-5 min-w-0">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad de entrada</label>
                <select
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  disabled={!itemForm.name}
                >
                  {getAllowedInputUnits(selectedInventoryProduct).map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
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
                  placeholder="Ej. 10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Precio fijo del producto (Q)</label>
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

            {selectedInventoryProduct && entryStoredAmount > 0 && (
              <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-4 py-3 text-sm font-bold text-ui-muted space-y-1">
                <div>
                  Se guardará como <span className="text-brand-blue font-black">{entryStoredAmount.toFixed(2)} {selectedInventoryProduct.unit}</span> en stock.
                </div>
                {entryTotalPrice !== null && !Number.isNaN(entryTotalPrice) && (
                  <div className="text-xs">
                    Costo de porción calculado: <span className="text-brand-blue font-black">
                      Q{((entryTotalPrice / entryStoredAmount) * (selectedInventoryProduct.usedPerPlate || 1)).toFixed(2)}
                    </span> por plato (usando {selectedInventoryProduct.usedPerPlate} {selectedInventoryProduct.unit}).
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full !py-5" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Registrar entrada'}
            </Button>
          </form>

          <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
            <div className="border-b border-ui-border pb-4">
              <h3 className="text-xl font-black text-ui-text">Consumo por plato</h3>
            </div>

            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {INVENTORY_PRODUCT_OPTIONS.map((product) => {
                const inventoryItem = inventory.find(i => i.name === product.value)
                const fixedPrice = Number(inventoryItem?.lastPrice || 0)
                const isEditingPrice = priceEditForm.name === product.value
                return (
                  <div key={product.value} className="rounded-2xl border border-ui-border bg-white/60 p-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="font-black text-ui-text break-words leading-tight">{product.label}</p>
                        <p className="text-[10px] uppercase tracking-widest text-ui-muted font-black mt-1">
                          {product.category} · Precio fijo Q{fixedPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm font-black text-brand-blue break-words">
                          {product.usedPerPlate} {product.unit}
                        </p>
                        <p className="text-[10px] font-black text-green-600 mt-0.5">
                          Precio fijo Q{fixedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {isEditingPrice ? (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-2 border-t border-ui-border pt-4">
                        <input
                          className="w-full rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
                          type="number"
                          min="0"
                          step="0.01"
                          value={priceEditForm.price}
                          onChange={(e) => setPriceEditForm({ ...priceEditForm, price: e.target.value })}
                          placeholder="Precio fijo del producto"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveProductPrice(product)}
                          disabled={isSaving}
                          className="rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPriceEdit}
                          className="rounded-xl border border-ui-border bg-ui-bg px-4 py-3 text-[10px] font-black uppercase tracking-widest text-ui-muted transition-all hover:bg-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 border-t border-ui-border pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartPriceEdit(product, fixedPrice)}
                          className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
                        >
                          Editar precio
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ui-border pb-4 min-w-0">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
            {inventory
              .filter(item => {
                if (inventoryCategoryFilter === 'ALL') return true
                const meta = INVENTORY_PRODUCT_MAP[item.name]
                return meta?.category === inventoryCategoryFilter
              })
              .map((item) => {
              const meta = INVENTORY_PRODUCT_MAP[item.name]
              const isPackaging = meta?.category === 'Empaque'
              const isActive = isPackaging ? true : item.isActive !== false
              const stockStoredPreview = stockEditForm.name === item.name
                ? convertInventoryAmountToBaseUnit(stockEditForm.stock, stockEditForm.unit, meta)
                : 0
              return (
                <div key={item._id} className={`w-full min-w-0 overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] border border-ui-border p-4 sm:p-5 transition-all ${!isActive ? 'bg-black/5 opacity-70 grayscale' : 'bg-ui-bg/40'}`}>
                  <div className="flex flex-row items-start justify-between gap-3 sm:gap-4 mb-4 min-w-0">
                    <div className="min-w-0 max-w-full">
                      <h3 className="font-black text-ui-text capitalize leading-tight break-words">{meta?.label || item.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mt-1 break-words">{meta?.category || 'Inventario'}</p>
                    </div>
                    <div className="text-right shrink-0 max-w-[45%]">
                      <p className={`text-2xl sm:text-xl font-black break-words ${item.stock <= item.minimumStock ? 'text-brand-red' : 'text-brand-blue'}`}>
                        {Number(item.stock).toFixed(2)}
                      </p>
                      <p className="text-[10px] font-bold text-ui-muted uppercase break-words">{item.unit}</p>
                      {getPlatesByIngredient(item) !== null && (
                        <p className="mt-1 rounded-full bg-brand-blue/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-blue">
                          {getPlatesByIngredient(item)} platos
                        </p>
                      )}
                    </div>
                  </div>

                  {stockEditForm.name === item.name ? (
                    <div className="mt-4 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-3 sm:p-4 min-w-0">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-ui-muted mb-2">
                        Nuevo stock
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr,0.85fr,auto,auto] gap-2 min-w-0">
                        <input
                          className="w-full min-w-0 rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
                          type="number"
                          min="0"
                          step="0.01"
                          value={stockEditForm.stock}
                          onChange={(e) => setStockEditForm({ ...stockEditForm, stock: e.target.value })}
                          placeholder="Cantidad"
                        />
                        <select
                          className="w-full min-w-0 rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
                          value={stockEditForm.unit}
                          onChange={(e) => setStockEditForm({ ...stockEditForm, unit: e.target.value })}
                        >
                          {getAllowedInputUnits(meta).map((unit) => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveStockEdit(item)}
                          disabled={isSaving}
                          className="w-full sm:w-auto rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelStockEdit}
                          className="w-full sm:w-auto rounded-xl border border-ui-border bg-ui-bg px-4 py-3 text-[10px] font-black uppercase tracking-widest text-ui-muted transition-all hover:bg-white"
                        >
                          Cancelar
                        </button>
                      </div>
                      {stockStoredPreview > 0 && (
                        <p className="mt-3 text-xs font-bold text-ui-muted">
                          Se guardará como <span className="font-black text-brand-blue">{stockStoredPreview.toFixed(2)} {meta?.unit || item.unit}</span>.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 gap-3 border-t border-ui-border/60 min-w-0">
                      <div className={`w-fit text-[10px] font-black uppercase px-3 py-1 rounded-full ${!isActive ? 'bg-ui-muted/20 text-ui-muted' : 'bg-green-500/10 text-green-600'}`}>
                        {!isActive ? 'Inactivo' : 'Activo'}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto min-w-0">
                        <button
                          type="button"
                          onClick={() => handleStartStockEdit(item)}
                          className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                        >
                          Editar stock
                        </button>
                        {isPackaging ? (
                          <div className="w-full sm:w-fit text-center text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-700">
                            Fijo
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => handleToggleStatus(item.name, item.isActive ?? true)}
                            className={`w-full sm:w-auto text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all border ${
                              item.isActive === false 
                                ? 'border-brand-blue text-brand-blue hover:bg-brand-blue/10' 
                                : 'border-brand-red text-brand-red hover:bg-brand-red/10'
                            }`}
                          >
                            {item.isActive === false ? 'Activar' : 'Desactivar'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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

      {activeTab === 'promotions' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-4 sm:gap-8 animate-fade-in min-w-0">
          
          {/* Left Column: Calculator & Form */}
          <div className="space-y-6 sm:space-y-8 min-w-0">
            
            {/* Interactive Cost & Profit Calculator */}
            <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4">
              <div className="border-b border-ui-border pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-ui-text">Calculadora de Costo de Plato</h3>
                  <p className="text-xs text-ui-muted font-bold mt-1 uppercase tracking-widest">Calcula el costo real de preparación según ingredientes</p>
                </div>
                <div className="bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shrink-0">
                  Calculadora 📊
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">Salsa</label>
                  <select
                    className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                    value={calcPlate.sauce}
                    onChange={(e) => setCalcPlate({ ...calcPlate, sauce: e.target.value })}
                  >
                    <option value="ROJA">Salsa Roja</option>
                    <option value="VERDE">Salsa Verde</option>
                    <option value="DIVORCIADOS">Divorciados</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">Proteína</label>
                  <select
                    className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                    value={calcPlate.protein}
                    onChange={(e) => setCalcPlate({ ...calcPlate, protein: e.target.value })}
                  >
                    <option value="POLLO">Pollo Cocido</option>
                    <option value="STEAK">Steak</option>
                    <option value="CHORIZO">Chorizo Argentino</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">Complemento</label>
                  <select
                    className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                    value={calcPlate.complement}
                    onChange={(e) => setCalcPlate({ ...calcPlate, complement: e.target.value })}
                  >
                    <option value="CEBOLLA_CARAMELIZADA">Cebolla Caramelizada</option>
                    <option value="AGUACATE">Aguacate</option>
                    <option value="QUESO_EXTRA">Queso Extra</option>
                  </select>
                </div>
              </div>

              {/* Dynamic purchase simulation inputs for selected options */}
              {(() => {
                const activeIngredients = []
                if (calcPlate.sauce === 'ROJA') activeIngredients.push('salsa roja')
                else if (calcPlate.sauce === 'VERDE') activeIngredients.push('salsa verde')
                else if (calcPlate.sauce === 'DIVORCIADOS') {
                  activeIngredients.push('salsa roja')
                  activeIngredients.push('salsa verde')
                }
                
                if (calcPlate.protein === 'POLLO') activeIngredients.push('pollo')
                else if (calcPlate.protein === 'STEAK') activeIngredients.push('steak')
                else if (calcPlate.protein === 'CHORIZO') activeIngredients.push('chorizo')
                
                if (calcPlate.complement === 'AGUACATE') activeIngredients.push('aguacate')
                else if (calcPlate.complement === 'CEBOLLA_CARAMELIZADA' || calcPlate.complement === 'CEBOLLA CARAMELIZADA') activeIngredients.push('cebolla caramelizada')
                else if (calcPlate.complement === 'QUESO_EXTRA' || calcPlate.complement === 'QUESO EXTRA') activeIngredients.push('queso extra')

                return (
                  <div className="mt-3 border-t border-ui-border/60 pt-3 space-y-2">
                    <p className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">
                      Precio de Compra de Ingredientes Seleccionados (Opcional)
                    </p>
                    <div className="flex flex-col gap-2">
                      {activeIngredients.map((name) => {
                        const product = INVENTORY_PRODUCT_MAP[name]
                        if (!product) return null
                        
                        const sim = simulatedCosts[name] || { qty: '', unit: getAllowedInputUnits(product)[0]?.value || 'und', price: '' }
                        
                        const updateSim = (field, val) => {
                          setSimulatedCosts(prev => ({
                            ...prev,
                            [name]: {
                              ...sim,
                              [field]: val
                            }
                          }))
                        }
                        
                        return (
                          <div key={name} className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-white p-3 rounded-2xl border border-ui-border shadow-sm animate-fade-in w-full">
                            <div className="w-full md:w-1/4 text-left shrink-0">
                              <div className="text-xs font-black text-ui-text capitalize">
                                {product.label}
                              </div>
                              <span className="block text-[8px] font-bold text-ui-muted uppercase tracking-wider mt-0.5">
                                Usa {product.usedPerPlate} {product.unit} por plato
                              </span>
                            </div>
                            
                            <div className="w-full md:flex-1 flex flex-col gap-0.5 min-w-0">
                              <span className="text-[8px] font-black uppercase text-ui-muted tracking-widest ml-1">Cant. Comprada</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="p-2 rounded-xl border border-ui-border bg-ui-bg/30 outline-none font-bold text-xs w-full"
                                placeholder="Ej. 10"
                                value={sim.qty}
                                onChange={(e) => updateSim('qty', e.target.value)}
                              />
                            </div>

                            <div className="w-full md:w-[100px] flex flex-col gap-0.5 shrink-0">
                              <span className="text-[8px] font-black uppercase text-ui-muted tracking-widest ml-1">Unidad</span>
                              <select
                                className="p-2 rounded-xl border border-ui-border bg-ui-bg/30 outline-none font-bold text-xs w-full"
                                value={sim.unit}
                                onChange={(e) => updateSim('unit', e.target.value)}
                              >
                                {getAllowedInputUnits(product).map((u) => (
                                  <option key={u.value} value={u.value}>
                                    {u.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="w-full md:flex-1 flex flex-col gap-0.5 min-w-0">
                              <span className="text-[8px] font-black uppercase text-ui-muted tracking-widest ml-1">Precio Compra (Q)</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="p-2 rounded-xl border border-ui-border bg-ui-bg/30 outline-none font-bold text-xs w-full"
                                placeholder="Ej. 20"
                                value={sim.price}
                                onChange={(e) => updateSim('price', e.target.value)}
                              />
                            </div>

                            <div className="w-full md:w-auto shrink-0 pt-2 md:pt-4">
                              <button
                                type="button"
                                onClick={() => handleSaveCalculatorCost(name)}
                                className="w-full md:w-auto bg-brand-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest px-3 py-2.5 hover:shadow-lg transition-all hover:bg-brand-blue/90"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Promo Simulation Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-ui-border/60 pt-4 mt-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">
                    Cantidad de Platos en Promoción
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                    placeholder="Ej. 2 para 2x1"
                    value={calcPromoPlates}
                    onChange={(e) => setCalcPromoPlates(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">
                    Precio de Venta Promocional (Q)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                    placeholder="Ej. 55"
                    value={calcPromoPrice}
                    onChange={(e) => setCalcPromoPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Recipe Cost Result Summary */}
              {(() => {
                const singlePlateCost = calculatePlateRecipeCost(calcPlate)
                const platesCount = Number(calcPromoPlates) || 1
                const promoPriceVal = Number(calcPromoPrice) || 0
                
                const totalPromoCost = singlePlateCost * platesCount
                const profit = promoPriceVal - totalPromoCost
                const profitMargin = promoPriceVal > 0 ? (profit / promoPriceVal * 100) : 0

                return (
                  <div className="p-4 rounded-2xl bg-white border border-ui-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div>
                      <p className="text-[9px] font-black uppercase text-ui-muted tracking-widest">Costo Total de Insumos de la Promo</p>
                      <p className="text-3xl font-black text-brand-blue mt-1">Q{totalPromoCost.toFixed(2)}</p>
                      <p className="text-[10px] text-ui-muted font-bold mt-1">
                        Equivale a Q{singlePlateCost.toFixed(2)} c/u por {platesCount} {platesCount === 1 ? 'plato' : 'platos'}.
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-[9px] font-black uppercase text-ui-muted tracking-widest">Rentabilidad de la Promo (Venta Q{promoPriceVal.toFixed(2)})</p>
                      <p className={`text-xl font-black mt-1 ${profit >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                        Q{profit.toFixed(2)}
                      </p>
                      <p className={`text-[10px] font-bold mt-0.5 ${profit >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                        {profitMargin.toFixed(0)}% Utilidad
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Promotion Creator/Editor Form */}
            <form onSubmit={handleSavePromotion} className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4">
              <div className="border-b border-ui-border pb-3">
                <h3 className="text-lg font-black text-ui-text">
                  {promoForm.id ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                </h3>
                <p className="text-xs text-ui-muted font-bold mt-1 uppercase tracking-widest">Ingresa los detalles y sube el banner de la promoción</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Nombre de la Promoción</label>
                  <input
                    className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold"
                    type="text"
                    required
                    value={promoForm.name}
                    onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                    placeholder="Ej. Súper Combo de Chilaquiles"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Precio Promocional (Q, Opcional)</label>
                  <input
                    className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold"
                    type="number"
                    min="1"
                    step="0.01"
                    value={promoForm.promoPrice || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, promoPrice: e.target.value })}
                    placeholder="Ej. 55"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Descripción</label>
                <textarea
                  className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold resize-none"
                  rows={2}
                  value={promoForm.description || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="Ej. Válido únicamente para consumo en restaurante."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Fecha Inicio</label>
                  <input
                    className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold text-ui-text"
                    type="date"
                    value={promoForm.startDate || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Fecha Fin</label>
                  <input
                    className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold text-ui-text"
                    type="date"
                    value={promoForm.endDate || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Imagen/Banner de la Promoción</label>
                {promoForm.imageUrl ? (
                  <div className="relative w-full h-48 border border-ui-border rounded-2xl overflow-hidden group">
                    <img src={promoForm.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, imageUrl: '' })}
                      className="absolute top-2 right-2 bg-brand-red text-white rounded-xl px-3 py-1.5 hover:bg-brand-red/90 transition shadow-lg text-[10px] font-black uppercase tracking-wider"
                    >
                      Quitar Imagen
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ui-border rounded-2xl cursor-pointer bg-white hover:bg-ui-bg/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="text-3xl mb-1">🖼️</span>
                        <p className="text-xs font-bold text-ui-muted">Sube el banner de la promoción aquí</p>
                        <p className="text-[9px] text-ui-muted mt-0.5">Formatos: PNG, JPG, WEBP (Máx. 2MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              return toast.error('La imagen debe ser menor a 2MB')
                            }
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setPromoForm(prev => ({ ...prev, imageUrl: reader.result }))
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 !py-4 animate-slide-up" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : promoForm.id ? 'Actualizar Promoción' : 'Crear Promoción'}
                </Button>
                {promoForm.id && (
                  <button
                    type="button"
                    onClick={() => setPromoForm({
                      id: null,
                      name: '',
                      description: '',
                      promoPrice: '',
                      isActive: false,
                      startDate: '',
                      endDate: '',
                      imageUrl: '',
                    })}
                    className="rounded-2xl border border-ui-border bg-white px-5 text-xs font-black uppercase tracking-wider text-ui-muted transition-colors hover:bg-ui-bg"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: List of Promotions */}
          <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
            <div className="border-b border-ui-border pb-3">
              <h3 className="text-lg font-black text-ui-text">Promociones Creadas</h3>
              <p className="text-xs text-ui-muted font-bold mt-1 uppercase tracking-widest">Activa o desactiva las promos para los clientes</p>
            </div>

            <div className="space-y-4 max-h-[48rem] overflow-y-auto pr-2">
              {promotions.map((promo) => {
                return (
                  <div key={promo.id} className="rounded-2xl border border-ui-border bg-white p-4 space-y-4 shadow-sm min-w-0 flex flex-col justify-between">
                    <div>
                      {promo.imageUrl && (
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-ui-border mb-3">
                          <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-base text-ui-text leading-tight break-words">{promo.name}</h4>
                          {promo.description && (
                            <p className="text-xs text-ui-muted font-medium leading-normal mt-1 break-words">{promo.description}</p>
                          )}
                          {(promo.startDate || promo.endDate) && (
                            <p className="text-[10px] text-ui-muted font-black uppercase tracking-wider mt-2 flex items-center gap-1.5">
                              <span>📅</span> {promo.startDate || 'Inicio'} al {promo.endDate || 'Fin'}
                            </p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleTogglePromoStatus(promo.id, promo.isActive)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-colors ${
                            promo.isActive
                              ? 'bg-green-500/10 text-green-700 border-green-500/30'
                              : 'bg-ui-bg text-ui-muted border-ui-border'
                          }`}
                        >
                          {promo.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-ui-border pt-3 mt-1">
                      <div>
                        {promo.promoPrice ? (
                          <>
                            <span className="text-[9px] text-ui-muted uppercase tracking-wider font-bold block">Precio de Venta</span>
                            <span className="text-base font-black text-brand-blue">Q{Number(promo.promoPrice).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-[9px] text-ui-muted uppercase tracking-wider font-bold block italic">Sin precio fijo</span>
                        )}
                      </div>

                      <div className="flex gap-3 text-[10px] font-black uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setPromoForm(promo)}
                          className="text-brand-orange hover:underline font-black"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="text-brand-red hover:underline font-black"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {promotions.length === 0 && (
                <div className="py-12 text-center border border-dashed border-ui-border rounded-2xl bg-white/40">
                  <p className="text-xs font-black uppercase tracking-widest text-ui-muted">No hay promociones registradas</p>
                </div>
              )}
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
