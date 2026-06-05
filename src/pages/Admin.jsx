import React, { useEffect, useRef, useState, useMemo } from 'react'
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
  getFinancesSummary,
  getAvailablePlates,
  getLastPurchases,
  getInventoryLogs,
  getPortions,
  updatePortion,
  createPackagingProduct,
  getCoupons,
  updateCoupons
} from '../shared/config/api.js'
import { playNotificationSound } from '../shared/utils/notifications.js'
import { formatBaseRecipe, INVENTORY_PRODUCT_OPTIONS, INVENTORY_PRODUCT_MAP, OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT, OPTIONS_BASE_RECIPE, getAllowedInputUnits, convertInventoryAmountToBaseUnit, getOptionLabel, normalizeComplementValue } from '../shared/constants/index.jsx'
import OptionCard from '../components/ui/OptionCard.jsx'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
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
import {
  IllustrationSteak,
  IllustrationPollo,
  IllustrationChorizo,
  IllustrationAguacate,
  IllustrationCebollaCaramel,
  IllustrationQuesoExtra,
  IllustrationQueso,
  IllustrationTotopos,
  IllustrationCebolla,
  IllustrationCilantro,
  IllustrationCrema,
  IllustrationPulledPork
} from '../components/illustrations/IngredientIllustrations.jsx'
import {
  IllustrationRoja,
  IllustrationVerde,
  IllustrationDivorciados
} from '../components/illustrations/SauceIllustrations.jsx'

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

const formatCurrency = (value) => {
  const numeric = Number(value || 0)
  if (Number.isNaN(numeric)) return '0.00'
  return numeric.toFixed(2)
}

const getCostSource = (source = '') => {
  if (source === 'inventory') return 'Última entrada'
  if (source === 'log') return 'Historial de entradas'
  if (source === 'inventory-price') return 'Precio guardado'
  if (source === 'manual') return 'Simulación manual'
  return 'Entradas'
}


const BASE_INGREDIENT_NAMES = ['crema', 'cebolla', 'cilantro']
const FIXED_RECIPE_INGREDIENT_NAMES = ['totopos', 'queso']
const FIXED_PACKAGING_NAMES = ['plato rectangular', 'tenedor', 'servilleta', 'sticker']
const SAUCE_PACKAGING_NAMES = {
  ROJA: [
    { name: 'plato de 8 onz', qty: 1 },
    { name: 'tapadera de 8 onz', qty: 1 },
  ],
  VERDE: [
    { name: 'plato de 8 onz', qty: 1 },
    { name: 'tapadera de 8 onz', qty: 1 },
  ],
  DIVORCIADOS: [
    { name: 'plato de 4 onz', qty: 2 },
    { name: 'tapadera de 4 onz', qty: 2 },
  ],
}

const getAutomaticPackagingRows = (sauce) => {
  const s = sauce || 'ROJA'
  return [
    ...FIXED_PACKAGING_NAMES.map((name) => ({ name, qty: INVENTORY_PRODUCT_MAP[name]?.usedPerPlate || 1 })),
    ...(SAUCE_PACKAGING_NAMES[s] || SAUCE_PACKAGING_NAMES.ROJA),
  ]
}

const getAutomaticPackagingLabel = (sauce) => {
  const s = sauce || 'ROJA'
  if (s === 'DIVORCIADOS') return 'Automático: 2 envases de 4 onz con 2 tapaderas'
  return 'Automático: 1 envase de 8 onz con 1 tapadera'
}

const mergeCostSources = (lastPurchases = {}, calculatorCosts = {}) => {
  const merged = { ...(lastPurchases || {}) }

  Object.entries(calculatorCosts || {}).forEach(([key, override]) => {
    if (!override || typeof override !== 'object') return
    const base = merged[key] || {}
    const next = { ...base }

    Object.entries(override).forEach(([field, value]) => {
      if (value === undefined || value === null || value === '') return
      next[field] = value
    })

    if (Object.keys(next).length > 0) {
      next.source = override.source || 'manual'
      merged[key] = next
    }
  })

  return merged
}

// Plates calculation and stock alert items functions moved inside AdminPage component to access portions config dynamically.


const resetPromoFormState = () => ({
  id: null,
  name: '',
  description: '',
  contentDescription: '',
  promoPrice: '',
  requestedCount: '2',
  isActive: true,
  startDate: '',
  endDate: '',
  imageUrl: '',
  constraints: {
    sauce: 'ALL',
    protein: 'ALL',
    complement: 'ALL',
  },
})

const getPromoConstraintValue = (promo, field) => {
  const raw = promo?.constraints?.[field] ?? promo?.[field] ?? 'ALL'
  if (field === 'complement') return normalizeComplementValue(raw) || 'ALL'
  return String(raw || 'ALL').trim().toUpperCase().replace(/\s+/g, '_') || 'ALL'
}

const getPromoConstraintLabel = (promo, field) => {
  const value = getPromoConstraintValue(promo, field)
  if (value === 'ALL') return 'Cualquiera'
  if (field === 'sauce') return getOptionLabel(value, OPTIONS_SAUCE)
  if (field === 'protein') return getOptionLabel(value, OPTIONS_PROTEIN)
  if (field === 'complement') return getOptionLabel(value, OPTIONS_COMPLEMENT)
  return value
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


const getPromoInfo = (order) => {
  const promo = order?.appliedPromo
  if (!promo) return null
  const name = promo.name || 'PROMO'
  const plates = promo.plates || promo.requestedCount || order?.items?.length || 0
  const price = promo.price ?? promo.promoPrice ?? order?.total
  const priceLabel = Number(price) > 0 ? `Q${Number(price).toFixed(0)}` : ''
  return { name, plates, priceLabel, manualCorrection: Boolean(promo.manualCorrection) }
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
          <div className="mt-2 flex flex-wrap gap-2">
            {order.sauceTemperature && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${order.sauceTemperature === 'FRIO' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                <span className="text-xs">{order.sauceTemperature === 'FRIO' ? '🧊' : '♨️'}</span> Salsa {order.sauceTemperature}
              </div>
            )}
            {getPromoInfo(order) && (
              <div className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider">
                <span>🎁 PROMO</span>
                <span>{getPromoInfo(order).name}</span>
                {getPromoInfo(order).priceLabel && <span>· {getPromoInfo(order).priceLabel}</span>}
                {getPromoInfo(order).plates ? <span>· {getPromoInfo(order).plates} platos</span> : null}
                {getPromoInfo(order).manualCorrection && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800">Corrección manual</span>}
              </div>
            )}
          </div>
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
              <div>{getOptionLabel(item.sauce, OPTIONS_SAUCE)}</div>
              <div>{getOptionLabel(item.protein, OPTIONS_PROTEIN)}</div>
              <div>{getOptionLabel(item.complement, OPTIONS_COMPLEMENT)}</div>
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
  const [zoomedImage, setZoomedImage] = useState(null)
  const [promoForm, setPromoForm] = useState(resetPromoFormState())
  const [simulatedCosts, setSimulatedCosts] = useState({})
  const defaultCalcPlateConfig = () => ({
    sauce: null,
    protein: null,
    complement: null,
    selectedBases: [],
  })
  const [calcPlates, setCalcPlates] = useState([defaultCalcPlateConfig(), defaultCalcPlateConfig()])
  const [activeCalcPlateIndex, setActiveCalcPlateIndex] = useState(0)
  const [calcPromoPrice, setCalcPromoPrice] = useState('55')
  const [platesCountInput, setPlatesCountInput] = useState('2')
  
  const [portions, setPortions] = useState([])
  const [packagingModalOpen, setPackagingModalOpen] = useState(false)

  const getDbNameFromValue = (value, category) => {
    if (!value) return null
    const normalized = value.trim().toUpperCase().replace(/\s+/g, '_')
    if (category === 'Proteínas') {
      if (normalized === 'STEAK') return 'steak'
      if (normalized === 'POLLO') return 'pollo'
      if (normalized === 'CHORIZO') return 'chorizo'
    } else if (category === 'Salsas') {
      if (normalized === 'ROJA') return 'salsa roja'
      if (normalized === 'VERDE') return 'salsa verde'
    } else if (category === 'Complementos') {
      if (normalized === 'AGUACATE') return 'aguacate'
      if (normalized === 'CEBOLLA_CARAMELIZADA') return 'cebolla caramelizada'
      if (normalized === 'QUESO_EXTRA') return 'queso extra'
    }

    const found = portions.find(p => {
      const product = inventory.find(i => i.name === p.name)
      const cat = product?.category || 'Otros'
      if (cat !== category) return false
      return p.name.toUpperCase().replace(/\s+/g, '_') === normalized
    })
    return found ? found.name : value.toLowerCase().replace(/_/g, ' ')
  }

  const dynamicSauceOptions = useMemo(() => {
    const allSauces = [...OPTIONS_SAUCE]
    const dynamicSauces = inventory.filter(item => item.category === 'Salsas')
    dynamicSauces.forEach(item => {
      if (item.name === 'salsa roja' || item.name === 'salsa verde') return
      const optionValue = item.name.toUpperCase().replace(/\s+/g, '_')
      if (!allSauces.some(opt => opt.value === optionValue)) {
        const capitalizedLabel = item.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        allSauces.push({
          id: optionValue,
          label: capitalizedLabel,
          value: optionValue,
          description: `Salsa ${item.name} para tus chilaquiles.`,
          illustration: React.createElement(IllustrationRoja),
          isDynamic: true,
          dbName: item.name
        })
      }
    })
    return allSauces
  }, [inventory])

  const dynamicProteinOptions = useMemo(() => {
    const allProteins = [...OPTIONS_PROTEIN]
    const dynamicProteins = inventory.filter(item => item.category === 'Proteínas')
    dynamicProteins.forEach(item => {
      const optionValue = item.name.toUpperCase().replace(/\s+/g, '_')
      if (!allProteins.some(opt => opt.value === optionValue)) {
        const capitalizedLabel = item.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        allProteins.push({
          id: optionValue,
          label: capitalizedLabel,
          value: optionValue,
          description: `Porción de ${item.name} seleccionada para tu plato.`,
          illustration: React.createElement(IllustrationSteak),
          isDynamic: true,
          dbName: item.name
        })
      }
    })
    return allProteins
  }, [inventory])

  const dynamicComplementOptions = useMemo(() => {
    const allComplements = [...OPTIONS_COMPLEMENT]
    const dynamicComplements = inventory.filter(item => item.category === 'Complementos')
    dynamicComplements.forEach(item => {
      const optionValue = item.name.toUpperCase().replace(/\s+/g, '_')
      if (!allComplements.some(opt => opt.value === optionValue)) {
        const capitalizedLabel = item.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        allComplements.push({
          id: optionValue,
          label: capitalizedLabel,
          value: optionValue,
          description: `Porción de ${item.name} para tu plato.`,
          illustration: React.createElement(IllustrationAguacate),
          isDynamic: true,
          dbName: item.name
        })
      }
    })
    return allComplements
  }, [inventory])
  const [newPackagingName, setNewPackagingName] = useState('')
  const [newPackagingCategory, setNewPackagingCategory] = useState('Empaque')
  const [newPackagingUnit, setNewPackagingUnit] = useState('und')
  const [newPackagingUsedPerPlate, setNewPackagingUsedPerPlate] = useState('1')
  const [isCreatingPackaging, setIsCreatingPackaging] = useState(false)
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState('ALL')
  const [coupons, setCoupons] = useState([])
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponDiscountPercent, setNewCouponDiscountPercent] = useState('10')
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('10')
  const [newCouponIsActive, setNewCouponIsActive] = useState(true)
  const [isSavingCoupon, setIsSavingCoupon] = useState(false)
  
  const calcPlate = calcPlates[activeCalcPlateIndex] || defaultCalcPlateConfig()
  const calcSelectedBases = calcPlate.selectedBases || []
  
  const setCalcPlate = (updater) => {
    setCalcPlates(prev => prev.map((p, i) => {
      if (i !== activeCalcPlateIndex) return p
      return typeof updater === 'function' ? updater(p) : { ...p, ...updater }
    }))
  }
  const setCalcSelectedBases = (updater) => {
    setCalcPlates(prev => prev.map((p, i) => {
      if (i !== activeCalcPlateIndex) return p
      const newBases = typeof updater === 'function' ? updater(p.selectedBases || []) : updater
      return { ...p, selectedBases: newBases }
    }))
  }
  const handlePromoPlatesChange = (countVal) => {
    const count = Math.max(0, Number(countVal) || 0)
    setCalcPlates(prev => {
      const next = [...prev]
      if (next.length < count) {
        while (next.length < count) {
          next.push(defaultCalcPlateConfig())
        }
      } else if (next.length > count) {
        next.splice(count)
      }
      return next
    })
    if (activeCalcPlateIndex >= count) {
      setActiveCalcPlateIndex(count > 0 ? count - 1 : 0)
    }
  }

  const resetPromoForm = () => {
    setPromoForm(resetPromoFormState())
    setCalcPlates([defaultCalcPlateConfig(), defaultCalcPlateConfig()])
    setActiveCalcPlateIndex(0)
    setCalcPromoPrice('55')
    setPlatesCountInput('2')
  }

  const getOptionCostAndPortion = (opt, type) => {
    let name = ''
    let isDivorciados = false
    
    if (type === 'sauce') {
      if (opt.value === 'ROJA') name = 'salsa roja'
      else if (opt.value === 'VERDE') name = 'salsa verde'
      else if (opt.value === 'DIVORCIADOS') isDivorciados = true
      else name = opt.dbName || opt.value.toLowerCase().replace(/_/g, ' ')
    } else if (type === 'protein') {
      if (opt.value === 'STEAK') name = 'steak'
      else if (opt.value === 'POLLO') name = 'pollo'
      else if (opt.value === 'CHORIZO') name = 'chorizo'
      else name = opt.dbName || opt.value.toLowerCase().replace(/_/g, ' ')
    } else if (type === 'complement') {
      if (opt.value === 'AGUACATE') name = 'aguacate'
      else if (opt.value === 'CEBOLLA_CARAMELIZADA') name = 'cebolla caramelizada'
      else if (opt.value === 'QUESO_EXTRA') name = 'queso extra'
      else name = opt.dbName || opt.value.toLowerCase().replace(/_/g, ' ')
    } else if (type === 'base') {
      const MAP = { cream: 'crema', onion: 'cebolla', cilantro: 'cilantro' }
      name = MAP[opt.id] || opt.id
    }

    let cost = 0
    let amount = 0
    let unit = ''

    if (isDivorciados) {
      const rojaProduct = getProductPortionConfig('salsa roja')
      const verdeProduct = getProductPortionConfig('salsa verde')
      if (rojaProduct && verdeProduct) {
        const rCost = getIngredientCost('salsa roja', rojaProduct.usedPerPlate / 2)
        const vCost = getIngredientCost('salsa verde', verdeProduct.usedPerPlate / 2)
        cost = rCost + vCost
        amount = rojaProduct.usedPerPlate
        unit = rojaProduct.unit
      }
    } else if (name) {
      const product = getProductPortionConfig(name)
      if (product) {
        cost = getIngredientCost(name)
        amount = product.usedPerPlate
        unit = product.unit
      }
    }

    const priceLabel = cost > 0 ? `Q${cost.toFixed(2)}` : 'Q0.00'
    const portionLabel = amount > 0 ? `${formatInventoryAmount(amount)}${unit}` : ''

    return { priceLabel, portionLabel }
  }

  const [inventoryLogs, setInventoryLogs] = useState([])
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
        const [inventoryResponse, logsResponse, portionsResponse] = await Promise.all([
          getInventory(),
          activeTab === 'entries' ? getInventoryLogs({ type: 'IN', limit: 100 }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          getPortions().catch(() => ({ data: [] }))
        ])
        setInventory(inventoryResponse.data)
        setPortions(portionsResponse.data || [])
        if (activeTab === 'entries') setInventoryLogs(Array.isArray(logsResponse.data) ? logsResponse.data : [])
      } else if (activeTab === 'promotions') {
        const [promotionsResponse, inventoryResponse, lastPurchasesResponse, portionsResponse, couponsResponse] = await Promise.all([
          getPromotions(),
          getInventory(),
          getLastPurchases().catch(() => ({ data: {} })),
          getPortions().catch(() => ({ data: [] })),
          getCoupons().catch(() => ({ data: [] }))
        ])
        setPromotions(promotionsResponse.data || [])
        setInventory(inventoryResponse.data || [])
        setPortions(portionsResponse.data || [])
        setSimulatedCosts(lastPurchasesResponse.data || {})
        setCoupons(couponsResponse.data || [])
      } else if (activeTab === 'recipe_book') {
        const [portionsResponse, inventoryResponse, lastPurchasesResponse] = await Promise.all([
          getPortions().catch(() => ({ data: [] })),
          getInventory(),
          getLastPurchases().catch(() => ({ data: {} }))
        ])
        setPortions(portionsResponse.data || [])
        setInventory(inventoryResponse.data || [])
        setSimulatedCosts(lastPurchasesResponse.data || {})
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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar a ${user.name || user.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
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
    if (!itemForm.price || Number(itemForm.price) <= 0) {
      return toast.error('Ingresa el costo total de compra para calcular precios correctamente')
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

  const dynamicInventoryOptions = inventory.map((item) => {
    const catalogItem = INVENTORY_PRODUCT_MAP[item.name]
    const label = catalogItem?.label || item.name.charAt(0).toUpperCase() + item.name.slice(1)
    return {
      value: item.name,
      label: label,
      category: item.category || 'Otros',
      unit: item.unit,
    }
  })

  const selectedInventoryProduct = inventory.find(i => i.name === itemForm.name) || INVENTORY_PRODUCT_MAP[itemForm.name]
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
    const meta = getProductPortionConfig(item.name)
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
    const meta = getProductPortionConfig(item.name)

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

  const getProductPortionConfig = (name) => {
    const normalized = String(name || '').trim().toLowerCase()
    const portion = portions.find(p => p.name === normalized)
    const product = inventory.find(i => i.name === normalized)
    const catalogItem = INVENTORY_PRODUCT_MAP[normalized]
    return {
      name: normalized,
      usedPerPlate: portion ? portion.usedPerPlate : (catalogItem?.usedPerPlate || 1),
      unit: product?.unit || portion?.unit || catalogItem?.unit || 'und',
      label: product?.label || catalogItem?.label || name,
      category: product?.category || catalogItem?.category || 'Otros',
      price: portion ? portion.price : (product?.lastPrice || 0)
    }
  }

  const getPlatesByIngredient = (item) => {
    const meta = getProductPortionConfig(item.name)
    const required = Number(meta?.usedPerPlate || 0)
    if (!required || required <= 0) return null
    return Math.floor(Number(item.stock || 0) / required)
  }

  const getStockAlertItems = (items = []) => {
    return items
      .map((item) => {
        const meta = getProductPortionConfig(item.name)
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

  const getDivorciadosPortion = () => {
    const configRoja = getProductPortionConfig('salsa roja')
    const configVerde = getProductPortionConfig('salsa verde')
    return {
      name: 'divorciados',
      usedPerPlate: (configRoja.usedPerPlate / 2) + (configVerde.usedPerPlate / 2),
      unit: 'ml',
      price: (configRoja.price / 2) + (configVerde.price / 2),
      isVirtual: true
    }
  }

  const getProductCost = (name) => {
    const config = getProductPortionConfig(name)
    return config.price
  }

  const getIngredientCostDetail = (name, usedAmountOverride = null) => {
    const sim = simulatedCosts[name] || {}
    const config = getProductPortionConfig(name)
    const usedAmount = Number(usedAmountOverride ?? config.usedPerPlate ?? 0)
    const qtyVal = sim?.qty !== undefined && sim?.qty !== '' ? Number(sim.qty) : 0
    const priceVal = sim?.price !== undefined && sim?.price !== '' ? Number(sim.price) : 0
    const unit = sim?.unit || config.unit || ''

    if (!config.usedPerPlate || usedAmount <= 0) {
      return {
        cost: 0,
        usedAmount: 0,
        unit,
        baseQty: 0,
        purchaseQty: qtyVal,
        purchasePrice: priceVal,
        source: sim?.source || '',
        hasPurchaseData: false,
      }
    }

    if (qtyVal > 0 && priceVal > 0) {
      const baseQty = convertInventoryAmountToBaseUnit(qtyVal, unit, config)
      if (baseQty > 0) {
        const costPerBaseUnit = priceVal / baseQty
        const portionInBaseUnit = convertInventoryAmountToBaseUnit(usedAmount, config.unit, config)
        return {
          cost: costPerBaseUnit * portionInBaseUnit,
          usedAmount,
          unit: config.unit,
          baseQty,
          purchaseQty: qtyVal,
          purchaseUnit: unit,
          purchasePrice: priceVal,
          source: sim?.source || 'manual',
          hasPurchaseData: true,
        }
      }
    }

    const fallbackPortionPrice = Number(config.price || 0)
    if (fallbackPortionPrice > 0) {
      const portionQty = Number(config.usedPerPlate || usedAmount || 1)
      const adjustedPortionPrice = portionQty > 0 ? fallbackPortionPrice * (usedAmount / portionQty) : fallbackPortionPrice
      return {
        cost: adjustedPortionPrice,
        usedAmount,
        unit: config.unit,
        baseQty: 0,
        purchaseQty: qtyVal,
        purchaseUnit: unit,
        purchasePrice: priceVal,
        source: sim?.source || 'inventory-price',
        hasPurchaseData: false,
      }
    }

    return {
      cost: 0,
      usedAmount,
      unit: config.unit,
      baseQty: 0,
      purchaseQty: qtyVal,
      purchaseUnit: unit,
      purchasePrice: priceVal,
      source: sim?.source || '',
      hasPurchaseData: false,
    }
  }

  const getIngredientCost = (name, usedAmountOverride = null) => getIngredientCostDetail(name, usedAmountOverride).cost

  const getSelectedRecipeRows = (plate = calcPlate) => {
    const rows = [...FIXED_RECIPE_INGREDIENT_NAMES.map((name) => ({ name, usedAmount: getProductPortionConfig(name).usedPerPlate }))]

    if (plate.sauce === 'ROJA') {
      rows.push({ name: 'salsa roja', usedAmount: getProductPortionConfig('salsa roja').usedPerPlate })
    } else if (plate.sauce === 'VERDE') {
      rows.push({ name: 'salsa verde', usedAmount: getProductPortionConfig('salsa verde').usedPerPlate })
    } else if (plate.sauce === 'DIVORCIADOS') {
      rows.push({ name: 'salsa roja', usedAmount: getProductPortionConfig('salsa roja').usedPerPlate / 2 })
      rows.push({ name: 'salsa verde', usedAmount: getProductPortionConfig('salsa verde').usedPerPlate / 2 })
    } else if (plate.sauce) {
      const dbSauceName = getDbNameFromValue(plate.sauce, 'Salsas')
      rows.push({ name: dbSauceName, usedAmount: getProductPortionConfig(dbSauceName).usedPerPlate })
    }

    if (plate.protein) {
      const dbProteinName = getDbNameFromValue(plate.protein, 'Proteínas')
      rows.push({ name: dbProteinName, usedAmount: getProductPortionConfig(dbProteinName).usedPerPlate })
    }

    if (plate.complement) {
      const dbComplementName = getDbNameFromValue(plate.complement, 'Complementos')
      rows.push({ name: dbComplementName, usedAmount: getProductPortionConfig(dbComplementName).usedPerPlate })
    }

    const selectedBasesForPlate = plate.selectedBases || []
    BASE_INGREDIENT_NAMES.forEach((name) => {
      if (selectedBasesForPlate.includes(name)) rows.push({ name, usedAmount: getProductPortionConfig(name).usedPerPlate })
    })

    return rows
  }

  const getPackagingRows = (plate) => {
    const allPackagingProducts = inventory.filter(item => item.category === 'Empaque')
    const sauce = plate.sauce || 'ROJA'
    const autoRows = getAutomaticPackagingRows(sauce)
    const autoQtyMap = Object.fromEntries(autoRows.map(item => [item.name, item.qty]))

    return allPackagingProducts.map((prod) => {
      const name = prod.name
      const override = plate.packagingOverrides?.[name]
      const defaultQty = autoQtyMap[name] !== undefined ? autoQtyMap[name] : 0
      return {
        name,
        qty: override !== undefined ? Number(override) : defaultQty
      }
    })
  }

  const calculatePackagingCost = (plate = calcPlate) => {
    return getPackagingRows(plate).reduce((total, item) => {
      return total + getIngredientCost(item.name, item.qty)
    }, 0)
  }

  const calculatePlateRecipeCost = (plate) => {
    const recipeCost = getSelectedRecipeRows(plate).reduce((total, item) => {
      return total + getIngredientCost(item.name, item.usedAmount)
    }, 0)

    return recipeCost + calculatePackagingCost(plate)
  }

  const getPromoTotalCost = () => {
    return calcPlates.reduce((total, plate) => total + calculatePlateRecipeCost(plate), 0)
  }
  const handlePromoImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen supera el límite de tamaño de 10MB. Por favor sube una más pequeña.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPromoForm(prev => ({ ...prev, imageUrl: reader.result }))
      toast.success('Imagen cargada con éxito')
    }
    reader.readAsDataURL(file)
  }

  const handleSavePromotion = async (e) => {
    if (e) e.preventDefault()
    if (!promoForm.name) {
      return toast.error('Ingresa el nombre de la promoción')
    }

    const requestedCount = calcPlates.length
    if (requestedCount <= 0) {
      return toast.error('La promoción debe incluir al menos 1 plato')
    }

    const incompletePlate = calcPlates.find((plate, idx) => {
      return !plate.sauce || !plate.protein || !plate.complement
    })
    if (incompletePlate) {
      const idx = calcPlates.indexOf(incompletePlate)
      return toast.error(`Por favor selecciona la salsa, proteína y complemento para el Plato ${idx + 1}`)
    }

    let priceNum = null
    const rawPrice = promoForm.promoPrice || calcPromoPrice
    if (rawPrice) {
      priceNum = Number(rawPrice)
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        return toast.error('Ingresa un precio de promoción válido')
      }
    }

    const totalPromoCost = getPromoTotalCost()
    const profit = priceNum ? priceNum - totalPromoCost : null
    const profitMargin = priceNum ? (profit / priceNum) * 100 : null

    const savedPlates = calcPlates.map(plate => {
      const selectedBases = plate.selectedBases || []
      return {
        sauce: plate.sauce,
        protein: plate.protein,
        complement: plate.complement,
        baseRecipe: {
          cream: selectedBases.includes('crema'),
          onion: selectedBases.includes('cebolla'),
          cilantro: selectedBases.includes('cilantro')
        }
      }
    })

    const normalizedPromo = {
      ...promoForm,
      requestedCount,
      promoPrice: priceNum,
      plates: savedPlates,
      // Fallback for older orders/clients querying recipe fields directly
      recipe: savedPlates[0] ? {
        sauce: savedPlates[0].sauce,
        protein: savedPlates[0].protein,
        complement: normalizeComplementValue(savedPlates[0].complement) || savedPlates[0].complement,
        baseRecipe: savedPlates[0].baseRecipe,
      } : undefined,
      estimatedUnitCost: Number((totalPromoCost / requestedCount).toFixed(2)),
      estimatedTotalCost: Number(totalPromoCost.toFixed(2)),
      estimatedProfit: profit === null ? null : Number(profit.toFixed(2)),
      estimatedMargin: profitMargin === null ? null : Number(profitMargin.toFixed(2)),
    }

    setIsSaving(true)
    try {
      let updatedPromos = []
      if (promoForm.id) {
        updatedPromos = promotions.map(p => p.id === promoForm.id ? { ...p, ...normalizedPromo } : p)
      } else {
        const newPromo = {
          ...normalizedPromo,
          id: Math.random().toString(36).slice(2, 11),
        }
        updatedPromos = [...promotions, newPromo]
      }

      await updatePromotions(updatedPromos)
      setPromotions(updatedPromos)
      toast.success(promoForm.id ? 'Promoción actualizada con éxito' : 'Promoción creada con éxito')
      resetPromoForm()
    } catch (err) {
      toast.error('No se pudo guardar la promoción')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditPromotion = (promo) => {
    const countVal = String(promo.requestedCount || promo.plates?.length || promo.platesCount || 2)
    setPromoForm({
      ...resetPromoFormState(),
      ...promo,
      requestedCount: countVal,
      promoPrice: promo.promoPrice === null || promo.promoPrice === undefined ? '' : String(promo.promoPrice),
    })
    setPlatesCountInput(countVal)

    if (Array.isArray(promo.plates) && promo.plates.length > 0) {
      const loadedPlates = promo.plates.map(p => {
        const bases = []
        if (p.baseRecipe?.cream !== false) bases.push('crema')
        if (p.baseRecipe?.onion !== false) bases.push('cebolla')
        if (p.baseRecipe?.cilantro !== false) bases.push('cilantro')
        return {
          sauce: p.sauce || 'ROJA',
          protein: p.protein || 'POLLO',
          complement: p.complement || 'CEBOLLA_CARAMELIZADA',
          selectedBases: bases
        }
      })
      setCalcPlates(loadedPlates)
      setActiveCalcPlateIndex(0)
    } else if (promo.recipe) {
      // Legacy fallback
      const bases = []
      if (promo.recipe.baseRecipe?.cream !== false) bases.push('crema')
      if (promo.recipe.baseRecipe?.onion !== false) bases.push('cebolla')
      if (promo.recipe.baseRecipe?.cilantro !== false) bases.push('cilantro')
      const count = Number(promo.requestedCount || promo.platesCount || 2)
      const single = {
        sauce: promo.recipe.sauce || 'ROJA',
        protein: promo.recipe.protein || 'POLLO',
        complement: promo.recipe.complement || 'CEBOLLA_CARAMELIZADA',
        selectedBases: bases
      }
      setCalcPlates(Array(count).fill(null).map(() => ({ ...single })))
      setActiveCalcPlateIndex(0)
    } else {
      setCalcPlates([defaultCalcPlateConfig(), defaultCalcPlateConfig()])
      setActiveCalcPlateIndex(0)
    }

    if (promo.promoPrice) setCalcPromoPrice(String(promo.promoPrice))
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const handleCreateCoupon = async (e) => {
    if (e) e.preventDefault()
    const code = String(newCouponCode || '').trim().toUpperCase()
    if (!code) {
      return toast.error('Ingresa el código del cupón')
    }
    const discount = Number(newCouponDiscountPercent)
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      return toast.error('Ingresa un porcentaje de descuento válido (0-100)')
    }
    const maxUses = Number(newCouponMaxUses)
    if (Number.isNaN(maxUses) || maxUses < 1) {
      return toast.error('La cantidad de usos debe ser al menos 1')
    }

    setIsSavingCoupon(true)
    try {
      if (coupons.some(c => c.code === code)) {
        setIsSavingCoupon(false)
        return toast.error('Este código de cupón ya existe')
      }

      const nextCoupons = [
        ...coupons,
        {
          code,
          discountPercent: discount,
          maxUses,
          usedCount: 0,
          isActive: newCouponIsActive
        }
      ]

      const res = await updateCoupons(nextCoupons)
      setCoupons(res.data || [])
      toast.success('Cupón creado exitosamente')
      setNewCouponCode('')
      setNewCouponDiscountPercent('10')
      setNewCouponMaxUses('10')
      setNewCouponIsActive(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el cupón')
    } finally {
      setIsSavingCoupon(false)
    }
  }

  const handleToggleCouponStatus = async (code, currentStatus) => {
    try {
      const nextCoupons = coupons.map(c => c.code === code ? { ...c, isActive: !currentStatus } : c)
      const res = await updateCoupons(nextCoupons)
      setCoupons(res.data || [])
      toast.success(`Cupón ${code} ${!currentStatus ? 'activado' : 'desactivado'}`)
    } catch (err) {
      toast.error('No se pudo cambiar el estado del cupón')
    }
  }

  const handleDeleteCoupon = async (code) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Seguro que deseas eliminar el cupón ${code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
    try {
      const nextCoupons = coupons.filter(c => c.code !== code)
      const res = await updateCoupons(nextCoupons)
      setCoupons(res.data || [])
      toast.success(`Cupón ${code} eliminado`)
    } catch (err) {
      toast.error('No se pudo eliminar el cupón')
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

  const handleCreatePackaging = async (e) => {
    if (e) e.preventDefault()
    if (!newPackagingName.trim()) {
      return toast.error('Ingresa el nombre del insumo o ingrediente')
    }

    const usedPerPlateNum = Number(newPackagingUsedPerPlate)
    if (Number.isNaN(usedPerPlateNum) || usedPerPlateNum < 0) {
      return toast.error('Ingresa una porción por plato válida (mayor o igual a 0)')
    }

    setIsCreatingPackaging(true)
    try {
      await createPackagingProduct({
        name: newPackagingName.trim(),
        category: newPackagingCategory,
        unit: newPackagingUnit,
        usedPerPlate: usedPerPlateNum,
        amount: 0,
        totalPrice: 0
      })
      toast.success('Insumo o ingrediente creado exitosamente')
      setNewPackagingName('')
      setNewPackagingCategory('Empaque')
      setNewPackagingUnit('und')
      setNewPackagingUsedPerPlate('1')
      setPackagingModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear el insumo o ingrediente')
    } finally {
      setIsCreatingPackaging(false)
    }
  }

  const handleCalculateAutoPortionPrice = (name, qty, unit) => {
    const sim = simulatedCosts[name] || {}
    const product = inventory.find(i => i.name === name)
    const qtyVal = sim?.qty !== undefined && sim?.qty !== '' ? Number(sim.qty) : 0
    const priceVal = sim?.price !== undefined && sim?.price !== '' ? Number(sim.price) : 0
    const purchaseUnit = sim?.unit || product?.unit || ''

    if (!product || qtyVal <= 0 || priceVal <= 0) {
      toast.error('No hay compras registradas para calcular costo de este producto en automático.')
      return null
    }

    try {
      const baseQty = convertInventoryAmountToBaseUnit(qtyVal, purchaseUnit, product)
      const costPerBaseUnit = priceVal / baseQty
      const portionInBaseUnit = convertInventoryAmountToBaseUnit(Number(qty), unit, product)
      const calculatedPrice = costPerBaseUnit * portionInBaseUnit
      return Number(calculatedPrice.toFixed(2))
    } catch (e) {
      toast.error('Error al realizar conversión de unidades.')
      return null
    }
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
        <div className="fixed inset-x-3 top-20 md:top-[88px] z-[70] mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[2rem] border border-orange-300 bg-white p-4 shadow-2xl shadow-orange-900/10 sm:p-5">
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

      <div className="pt-16 md:pt-[72px] flex flex-col min-h-screen">
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
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {[
                        { title: 'Hoy', data: financesSummary.daily, color: 'brand-blue', bg: 'brand-blue/5' },
                        { title: 'Esta Semana', data: financesSummary.weekly, color: 'brand-blue', bg: 'brand-blue/5' },
                        { title: 'Este Mes', data: financesSummary.monthly, color: 'brand-blue', bg: 'brand-blue/5' },
                        { title: 'Histórico Global', data: financesSummary.global, color: 'green-600', bg: 'green-500/5' }
                      ].map((period) => (
                        <div key={period.title} className="rounded-[2rem] border border-ui-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between border-b border-ui-border/60 pb-3 mb-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-ui-muted">{period.title}</h4>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                period.title.includes('Global') ? 'bg-green-500/10 text-green-700' : 'bg-brand-blue/10 text-brand-blue'
                              }`}>
                                {period.data?.orderCount || 0} pedidos
                              </span>
                            </div>
                            
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-ui-muted font-bold">Ventas:</span>
                                <span className="font-black text-brand-blue">Q{period.data?.revenue?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-ui-muted font-bold">Costos:</span>
                                <span className="font-black text-brand-orange">Q{period.data?.costs?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-ui-border/60 flex justify-between items-center text-xs font-bold">
                            <span className="text-ui-muted">Utilidad:</span>
                            <span className={`text-base font-black ${(period.data?.utilities || 0) >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                              Q{period.data?.utilities?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tabla de Historial por Mes */}
                    {financesSummary.byMonth && financesSummary.byMonth.length > 0 && (
                      <div className="space-y-5 mt-10">
                        <h3 className="text-xl font-black text-ui-text ml-2">Historial Mensual</h3>
                        <div className="rounded-[2.5rem] border border-ui-border bg-white overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-ui-bg/60 border-b border-ui-border text-[10px] font-black uppercase tracking-wider text-ui-muted">
                                  <th className="py-4 px-6">Mes</th>
                                  <th className="py-4 px-6 text-right">Ventas</th>
                                  <th className="py-4 px-6 text-right">Costos (Entradas)</th>
                                  <th className="py-4 px-6 text-right">Utilidades</th>
                                  <th className="py-4 px-6 text-right">Pedidos</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                                {financesSummary.byMonth.map((m) => (
                                  <tr key={m.month} className="hover:bg-ui-bg/10 transition-colors">
                                    <td className="py-4 px-6 font-black text-sm text-ui-text">{m.label}</td>
                                    <td className="py-4 px-6 text-right font-bold text-brand-blue">Q{m.revenue.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-right font-bold text-brand-orange">Q{m.costs.toFixed(2)}</td>
                                    <td className={`py-4 px-6 text-right font-black text-sm ${m.utilities >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                                      Q{m.utilities.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-right text-ui-muted">{m.orderCount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
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
            <div className="border-b border-ui-border pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-ui-text">Entrada de Inventario</h2>
                <p className="text-sm text-ui-muted mt-1">Selecciona el producto y registra la cantidad ingresada.</p>
              </div>
              <button
                type="button"
                onClick={() => setPackagingModalOpen(true)}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 transition-all shrink-0"
              >
                + Crear Producto
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Producto</label>
              <select
                className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                value={itemForm.name}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Selecciona un producto</option>
                {dynamicInventoryOptions.map((product) => (
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
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Costo Total de Compra (Q) <span className="text-red-500">*</span></label>
                <input
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={itemForm.price}
                  placeholder="Ej. 100.00"
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

          <div className="space-y-4 min-w-0">
            {/* ── Historial de Entradas ── */}
            <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
              <div className="border-b border-ui-border pb-4">
                <h3 className="text-xl font-black text-ui-text">Historial de Entradas</h3>
                <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Últimas entradas registradas al inventario</p>
              </div>

              <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                {inventoryLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-ui-muted font-bold text-sm">No hay entradas registradas aún.</p>
                    <p className="text-ui-muted text-xs mt-1">Las entradas que registres aparecerán aquí.</p>
                  </div>
                ) : (
                  inventoryLogs
                    .filter((log) => !!getProductPortionConfig(log.ingredientName).label)
                    .map((log) => {
                    const product = getProductPortionConfig(log.ingredientName)
                    const priceFromReason = log.reason?.match(new RegExp('Costo Total\\s*Q\\s*([\\d.]+)', 'i'))
                    const totalPrice = log.totalPrice !== undefined && log.totalPrice !== null
                      ? Number(log.totalPrice)
                      : priceFromReason
                        ? Number(priceFromReason[1])
                        : (log.price && log.price > 0 ? Number(log.price) : null)
                    const amtMatch = log.reason?.match(new RegExp('Entrada de inventario:\\s*([\\d.]+)\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)', 'i'))
                    const displayAmount = log.inputAmount !== undefined && log.inputAmount !== null
                      ? formatInventoryAmount(log.inputAmount)
                      : amtMatch
                        ? amtMatch[1]
                        : formatInventoryAmount(log.amount || log.storedAmount || 0)
                    const displayUnit = log.inputUnit || amtMatch?.[2] || product?.unit || log.storedUnit || ''
                    const entryAmt = displayAmount && displayAmount !== '0' ? `${displayAmount} ${displayUnit}`.trim() : ''
                    const stockAmount = log.storedAmount || log.amount || 0
                    const stockUnit = log.storedUnit || product?.unit || ''
                    const dateStr = log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : ''
                    return (
                      <div key={log._id} className="rounded-2xl border border-ui-border bg-white/70 px-4 py-3 flex items-start justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-black text-ui-text text-sm leading-tight truncate">
                            {product?.label || log.ingredientName}
                          </p>
                          <p className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-0.5">
                            {product?.category || ''} · {entryAmt}
                          </p>
                          <p className="text-[10px] text-ui-muted mt-0.5">{dateStr}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {totalPrice !== null ? (
                            <p className="text-sm font-black text-green-600">Q{totalPrice.toFixed(2)}</p>
                          ) : (
                            <p className="text-[10px] font-bold text-orange-400 italic">Sin costo registrado</p>
                          )}
                          <p className="text-[10px] font-bold text-brand-blue mt-0.5">
                            Stock: +{formatInventoryAmount(stockAmount)} {stockUnit}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* ── Consumo por Plato (referencia) ── */}
            <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
              <div className="border-b border-ui-border pb-4">
                <h3 className="text-xl font-black text-ui-text">Consumo por plato</h3>
              </div>

              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                {(() => {
                  const allProductNames = Array.from(new Set([
                    ...INVENTORY_PRODUCT_OPTIONS.map(p => p.value),
                    ...inventory.map(i => i.name)
                  ]))
                  const dynamicConsumoOptions = allProductNames.map(name => {
                    const config = getProductPortionConfig(name)
                    return {
                      value: config.name,
                      label: config.label,
                      category: config.category,
                      usedPerPlate: config.usedPerPlate,
                      unit: config.unit
                    }
                  })
                  const sortedConsumoOptions = dynamicConsumoOptions.sort((a, b) => {
                    if (a.category !== b.category) {
                      return a.category.localeCompare(b.category)
                    }
                    return a.label.localeCompare(b.label)
                  })
                  return sortedConsumoOptions.map((product) => {
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
                  })
                })()}
              </div>
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
                  <option value="Ingredientes fijos">Ingredientes fijos</option>
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
                const meta = getProductPortionConfig(item.name)
                return meta?.category === inventoryCategoryFilter
              })
              .map((item) => {
              const meta = getProductPortionConfig(item.name)
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
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-4 sm:gap-8 min-w-0">
          
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

              {/* Cantidad de Platos en Promoción */}
              <div className="bg-white rounded-2xl border border-ui-border p-4 space-y-1">
                <label className="text-[9px] font-black uppercase text-ui-muted tracking-widest ml-1">
                  Cantidad de Platos en Promoción
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full p-3 rounded-xl border border-ui-border bg-white outline-none font-bold text-xs"
                  placeholder="Ej. 2 para 2x1"
                  value={platesCountInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setPlatesCountInput(val)
                    if (val !== '') {
                      const count = Math.max(0, Number(val) || 0)
                      handlePromoPlatesChange(count)
                    } else {
                      handlePromoPlatesChange(0)
                    }
                  }}
                />
              </div>

              {calcPlates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-ui-border rounded-2xl bg-white text-center">
                  <p className="text-sm font-bold text-ui-muted mb-2">No hay platos en la promoción</p>
                  <p className="text-xs text-ui-muted">Ingresa la cantidad de platos arriba para comenzar a configurar.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border pb-4 mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {calcPlates.map((plate, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveCalcPlateIndex(idx)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shrink-0 ${
                            idx === activeCalcPlateIndex
                              ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                              : 'bg-white text-ui-text border-ui-border hover:bg-ui-bg'
                          }`}
                        >
                          Plato {idx + 1}
                        </button>
                      ))}
                    </div>
                    {activeCalcPlateIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const prevPlate = calcPlates[activeCalcPlateIndex - 1]
                          setCalcPlate({
                            sauce: prevPlate.sauce,
                            protein: prevPlate.protein,
                            complement: prevPlate.complement,
                            selectedBases: [...(prevPlate.selectedBases || [])]
                          })
                          toast.success(`Copiada la receta del Plato ${activeCalcPlateIndex}`)
                        }}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-brand-blue/10 text-brand-blue border-brand-blue/30 hover:bg-brand-blue/20 transition-all flex items-center gap-1.5"
                      >
                        📋 Copiar del Plato {activeCalcPlateIndex}
                      </button>
                    )}
                  </div>

                  {/* Grid of OptionCards for active plate */}
                  <div className="space-y-6">
                    {/* Sauce selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest ml-1">Salsa</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {dynamicSauceOptions.map((opt) => {
                          const { priceLabel, portionLabel } = getOptionCostAndPortion(opt, 'sauce')
                          return (
                            <OptionCard
                              key={opt.id}
                              title={opt.label}
                              price={priceLabel}
                              description={`${opt.description || ''} ${portionLabel ? `(${portionLabel})` : ''}`.trim()}
                              selected={calcPlate.sauce === opt.value}
                              illustration={opt.illustration}
                              badge={opt.badge}
                              onClick={() => setCalcPlate({ sauce: opt.value })}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Protein selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest ml-1">Proteína</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {dynamicProteinOptions.map((opt) => {
                          const { priceLabel, portionLabel } = getOptionCostAndPortion(opt, 'protein')
                          return (
                            <OptionCard
                              key={opt.id}
                              title={opt.label}
                              price={priceLabel}
                              description={`${opt.description || ''} ${portionLabel ? `(${portionLabel})` : ''}`.trim()}
                              selected={calcPlate.protein === opt.value}
                              illustration={opt.illustration}
                              onClick={() => setCalcPlate({ protein: opt.value })}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Complement selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest ml-1">Complemento</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {dynamicComplementOptions.map((opt) => {
                          const { priceLabel, portionLabel } = getOptionCostAndPortion(opt, 'complement')
                          return (
                            <OptionCard
                              key={opt.id}
                              title={opt.label}
                              price={priceLabel}
                              description={`${opt.description || ''} ${portionLabel ? `(${portionLabel})` : ''}`.trim()}
                              selected={calcPlate.complement === opt.value}
                              illustration={opt.illustration}
                              onClick={() => {
                                const nextComplement = opt.value
                                setCalcPlate({ complement: nextComplement })
                                if (nextComplement === 'CEBOLLA_CARAMELIZADA') {
                                  setCalcSelectedBases(prev => prev.filter(b => b !== 'cebolla'))
                                } else {
                                  setCalcSelectedBases(prev => prev.includes('cebolla') ? prev : [...prev, 'cebolla'])
                                }
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Bases selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest ml-1">Ingredientes Base</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {OPTIONS_BASE_RECIPE.map((opt) => {
                          const MAP_BASE_RECIPE_ID = {
                            cream: 'crema',
                            onion: 'cebolla',
                            cilantro: 'cilantro'
                          }
                          const name = MAP_BASE_RECIPE_ID[opt.id] || opt.id
                          if (name === 'cebolla' && calcPlate.complement === 'CEBOLLA_CARAMELIZADA') return null
                          
                          const isChecked = calcSelectedBases.includes(name)
                          const { priceLabel, portionLabel } = getOptionCostAndPortion(opt, 'base')
                          return (
                            <OptionCard
                              key={opt.id}
                              title={opt.label}
                              price={priceLabel}
                              description={`${opt.description || ''} ${portionLabel ? `(${portionLabel})` : ''}`.trim()}
                              selected={isChecked}
                              illustration={opt.illustration}
                              onClick={() => {
                                if (isChecked) {
                                  setCalcSelectedBases(calcSelectedBases.filter(b => b !== name))
                                } else {
                                  setCalcSelectedBases([...calcSelectedBases, name])
                                }
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Cost breakdown list for the active plate */}
                  <div className="bg-white rounded-2xl border border-ui-border p-4 mt-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-ui-border pb-2">
                      <h4 className="text-xs font-black uppercase text-brand-blue tracking-widest">
                        Desglose de Insumos - Plato {activeCalcPlateIndex + 1}
                      </h4>
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {getSelectedRecipeRows(calcPlate).map((item) => {
                        const config = getProductPortionConfig(item.name)
                        const detail = getIngredientCostDetail(item.name, item.usedAmount)
                        return (
                          <div key={item.name} className="flex justify-between items-center text-xs text-ui-text font-bold py-1 border-b border-dashed border-ui-border/40 last:border-b-0">
                            <span className="capitalize">{config.label}</span>
                            <span className="text-ui-muted font-medium">Q{detail.cost.toFixed(2)}</span>
                          </div>
                        )
                      })}
                      {getPackagingRows(calcPlate).map((item) => {
                        const config = getProductPortionConfig(item.name)
                        const isDeleted = item.qty === 0
                        const detail = getIngredientCostDetail(item.name, item.qty)
                        return (
                          <div key={item.name} className={`flex justify-between items-center text-xs font-bold py-1 border-b border-dashed border-ui-border/40 last:border-b-0 ${isDeleted ? 'opacity-40 line-through text-ui-muted' : 'text-ui-text'}`}>
                            <div className="flex flex-col">
                              <span className="capitalize">{config.label}</span>
                              {!isDeleted && (
                                <span className="text-[10px] text-ui-muted font-bold">Cantidad: {item.qty} {config.unit}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-ui-muted font-medium">Q{detail.cost.toFixed(2)}</span>
                              <div className="flex items-center gap-1 ml-2">
                                {!isDeleted ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedPlates = [...calcPlates]
                                        const currentPlate = { ...updatedPlates[activeCalcPlateIndex] }
                                        const nextQty = Math.max(0, item.qty - 1)
                                        currentPlate.packagingOverrides = {
                                          ...(currentPlate.packagingOverrides || {}),
                                          [item.name]: nextQty
                                        }
                                        updatedPlates[activeCalcPlateIndex] = currentPlate
                                        setCalcPlates(updatedPlates)
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-ui-bg border border-ui-border text-[10px] font-black text-ui-text hover:bg-ui-border transition-all"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.qty}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value) || 0)
                                        const updatedPlates = [...calcPlates]
                                        const currentPlate = { ...updatedPlates[activeCalcPlateIndex] }
                                        currentPlate.packagingOverrides = {
                                          ...(currentPlate.packagingOverrides || {}),
                                          [item.name]: val
                                        }
                                        updatedPlates[activeCalcPlateIndex] = currentPlate
                                        setCalcPlates(updatedPlates)
                                      }}
                                      className="w-8 text-center text-[10px] font-black border border-ui-border rounded py-0.5 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedPlates = [...calcPlates]
                                        const currentPlate = { ...updatedPlates[activeCalcPlateIndex] }
                                        const nextQty = item.qty + 1
                                        currentPlate.packagingOverrides = {
                                          ...(currentPlate.packagingOverrides || {}),
                                          [item.name]: nextQty
                                        }
                                        updatedPlates[activeCalcPlateIndex] = currentPlate
                                        setCalcPlates(updatedPlates)
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-ui-bg border border-ui-border text-[10px] font-black text-ui-text hover:bg-ui-border transition-all"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedPlates = [...calcPlates]
                                        const currentPlate = { ...updatedPlates[activeCalcPlateIndex] }
                                        currentPlate.packagingOverrides = {
                                          ...(currentPlate.packagingOverrides || {}),
                                          [item.name]: 0
                                        }
                                        updatedPlates[activeCalcPlateIndex] = currentPlate
                                        setCalcPlates(updatedPlates)
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-red-500 transition-all text-xs"
                                      title="Eliminar"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedPlates = [...calcPlates]
                                      const currentPlate = { ...updatedPlates[activeCalcPlateIndex] }
                                      currentPlate.packagingOverrides = {
                                        ...(currentPlate.packagingOverrides || {}),
                                        [item.name]: 1
                                      }
                                      updatedPlates[activeCalcPlateIndex] = currentPlate
                                      setCalcPlates(updatedPlates)
                                    }}
                                    className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-wider border border-brand-blue/20 hover:bg-brand-blue/20 transition-all"
                                  >
                                    Agregar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-ui-border/60 pt-3 mt-3 flex justify-between items-center text-xs font-black text-ui-text uppercase tracking-wider">
                      <span>Total Plato {activeCalcPlateIndex + 1}</span>
                      <span className="text-brand-blue text-lg">Q{calculatePlateRecipeCost(calcPlate).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Recipe Cost Result Summary */}
              {(() => {
                const totalPromoCost = getPromoTotalCost()
                const platesCount = calcPlates.length

                return (
                  <div className="p-4 rounded-2xl bg-white border border-ui-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div>
                      <p className="text-[9px] font-black uppercase text-ui-muted tracking-widest">TOTAL</p>
                      <p className="text-3xl font-black text-brand-blue mt-1">Q{totalPromoCost.toFixed(2)}</p>
                      <p className="text-[10px] text-ui-muted font-bold mt-1">
                        Suma de {platesCount} {platesCount === 1 ? 'plato configurado' : 'platos configurados'} en la promoción.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    onChange={(e) => {
                      setPromoForm({ ...promoForm, promoPrice: e.target.value })
                      setCalcPromoPrice(e.target.value)
                    }}
                    placeholder="Ej. 55"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Platos que incluye</label>
                  <input
                    className="w-full p-3.5 rounded-2xl border border-ui-border bg-ui-bg text-ui-muted outline-none font-bold cursor-not-allowed"
                    type="number"
                    readOnly
                    value={calcPlates.length}
                    placeholder="Ej. 2"
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
                  placeholder="Ej. Combo especial de chilaquiles con ingredientes predefinidos."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Contenido (lo que contiene la promo, se muestra al cliente)</label>
                <textarea
                  className="w-full p-3.5 rounded-2xl border border-ui-border bg-white outline-none font-bold resize-none"
                  rows={2}
                  value={promoForm.contentDescription || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, contentDescription: e.target.value })}
                  placeholder="Ej. El combo familiar contiene 4 platos con tales salsas..."
                />
              </div>

              <div className="space-y-2 bg-white p-4 rounded-2xl border border-ui-border">
                <label className="block text-[10px] font-black uppercase text-ui-muted tracking-widest">Banner / Imagen de Promoción (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePromoImageChange}
                  className="block w-full text-xs text-ui-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                />
                {promoForm.imageUrl && (
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-ui-border mt-2 group">
                    <img src={promoForm.imageUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPromoForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                      title="Eliminar imagen"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
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

              {/* Profit Indicator */}
              {(() => {
                const totalCost = getPromoTotalCost()
                const priceNum = Number(promoForm.promoPrice || calcPromoPrice) || 0
                const profit = priceNum - totalCost
                const profitMargin = priceNum > 0 ? (profit / priceNum * 100) : 0

                return priceNum > 0 ? (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-fade-in ${
                    profit >= 0
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    <span>Rentabilidad estimada de la promo:</span>
                    <span className="font-black text-xs sm:text-sm">
                      {profit >= 0
                        ? `✅ Utilidad: Q${profit.toFixed(2)} (${profitMargin.toFixed(0)}%)`
                        : `⚠️ Pérdida: Q${Math.abs(profit).toFixed(2)} (${profitMargin.toFixed(0)}%)`
                      }
                    </span>
                  </div>
                ) : null
              })()}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 !py-4 animate-slide-up" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : promoForm.id ? 'Actualizar Promoción' : 'Crear Promoción'}
                </Button>
                {promoForm.id && (
                  <button
                    type="button"
                    onClick={resetPromoForm}
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
                      <div className="flex justify-between items-start gap-4">
                        {promo.imageUrl && (
                          <div
                            onClick={() => setZoomedImage(promo.imageUrl)}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-ui-border bg-ui-bg overflow-hidden flex-shrink-0 cursor-zoom-in relative group"
                          >
                            <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-[10px] font-black uppercase tracking-wide">🔍</span>
                            </div>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-base text-ui-text leading-tight break-words">{promo.name}</h4>
                          {promo.description && (
                            <p className="text-xs text-ui-muted font-medium leading-normal mt-1 break-words">{promo.description}</p>
                          )}
                          {promo.contentDescription && (
                            <p className="text-[11px] text-[#2d3748] font-bold leading-normal mt-1 border-l-2 border-brand-orange pl-2 italic break-words">Contenido: {promo.contentDescription}</p>
                          )}
                          {(promo.startDate || promo.endDate) && (
                            <p className="text-[10px] text-ui-muted font-black uppercase tracking-wider mt-2 flex items-center gap-1.5">
                              <span>📅</span> {promo.startDate || 'Inicio'} al {promo.endDate || 'Fin'}
                            </p>
                          )}

                          {promo.plates && promo.plates.length > 0 ? (
                            <div className="mt-3 space-y-2 border-t border-ui-border/60 pt-2.5">
                              <p className="text-[9px] font-black uppercase text-ui-muted tracking-widest">Platos incluidos ({promo.requestedCount || promo.plates.length}):</p>
                              {promo.plates.map((plate, pIdx) => {
                                const sauceL = getOptionLabel(plate.sauce, OPTIONS_SAUCE)
                                const proteinL = getOptionLabel(plate.protein, OPTIONS_PROTEIN)
                                const complementL = getOptionLabel(plate.complement, OPTIONS_COMPLEMENT)
                                const basesL = formatBaseRecipe(plate.baseRecipe)
                                return (
                                  <div key={pIdx} className="text-[10px] font-bold text-ui-text bg-ui-bg/40 p-2.5 rounded-xl border border-ui-border/50 flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-brand-blue font-black shrink-0">Plato {pIdx + 1}:</span>
                                      <div className="flex -space-x-1 shrink-0">
                                        <div className="w-5 h-5 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-90 shrink-0" title={sauceL}>
                                          {getIngredientSvg(plate.sauce, 'Salsas')}
                                        </div>
                                        <div className="w-5 h-5 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-90 shrink-0" title={proteinL}>
                                          {getIngredientSvg(plate.protein, 'Proteínas')}
                                        </div>
                                        <div className="w-5 h-5 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-90 shrink-0" title={complementL}>
                                          {getIngredientSvg(plate.complement, 'Complementos')}
                                        </div>
                                      </div>
                                      <span className="text-ui-text font-bold uppercase">{sauceL} • {proteinL} • {complementL}</span>
                                    </div>
                                    {basesL && (
                                      <div className="flex items-center gap-1.5 border-t border-ui-border/40 pt-1.5 pl-1 text-[9px] text-ui-muted uppercase flex-wrap">
                                        <span className="font-black">Bases:</span>
                                        {plate.baseRecipe?.cream !== false && (
                                          <span className="flex items-center gap-0.5 font-bold">
                                            <span className="w-4 h-4 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-75 shrink-0">{getIngredientSvg('crema')}</span> Crema
                                          </span>
                                        )}
                                        {plate.baseRecipe?.onion !== false && (
                                          <span className="flex items-center gap-0.5 font-bold">
                                            <span className="w-4 h-4 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-75 shrink-0">{getIngredientSvg('cebolla')}</span> Cebolla
                                          </span>
                                        )}
                                        {plate.baseRecipe?.cilantro !== false && (
                                          <span className="flex items-center gap-0.5 font-bold">
                                            <span className="w-4 h-4 rounded-full border border-ui-border bg-white flex items-center justify-center overflow-hidden scale-75 shrink-0">{getIngredientSvg('cilantro')}</span> Cilantro
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider text-ui-muted">
                              <span className="rounded-xl bg-ui-bg border border-ui-border px-2.5 py-2">Platos: {promo.requestedCount || promo.platesCount || 2}</span>
                              <span className="rounded-xl bg-ui-bg border border-ui-border px-2.5 py-2">Salsa: {getPromoConstraintLabel(promo, 'sauce')}</span>
                              <span className="rounded-xl bg-ui-bg border border-ui-border px-2.5 py-2">Proteína: {getPromoConstraintLabel(promo, 'protein')}</span>
                              <span className="rounded-xl bg-ui-bg border border-ui-border px-2.5 py-2">Complemento: {getPromoConstraintLabel(promo, 'complement')}</span>
                            </div>
                          )}

                          {promo.estimatedTotalCost !== undefined && promo.estimatedTotalCost !== null && (
                            <div className="mt-3 rounded-xl border border-ui-border bg-ui-bg/60 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider">
                              <span className="text-ui-muted">Costo: <b className="text-ui-text">Q{Number(promo.estimatedTotalCost || 0).toFixed(2)}</b></span>
                              {promo.estimatedProfit !== null && promo.estimatedProfit !== undefined && (
                                <span className={Number(promo.estimatedProfit) >= 0 ? 'text-green-700' : 'text-brand-red'}>
                                  Ganancia: Q{Number(promo.estimatedProfit || 0).toFixed(2)}
                                </span>
                              )}
                              {promo.estimatedMargin !== null && promo.estimatedMargin !== undefined && (
                                <span className="text-ui-muted">Margen: <b className="text-ui-text">{Number(promo.estimatedMargin || 0).toFixed(1)}%</b></span>
                              )}
                            </div>
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
                          onClick={() => handleEditPromotion(promo)}
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
          
          {/* Coupon Management Panel */}
          <div className="rounded-[2.5rem] border border-ui-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-ui-border pb-4">
              <h3 className="text-xl font-black text-ui-text">Códigos de Descuento (Cupones)</h3>
              <p className="text-xs text-ui-muted font-bold mt-1 uppercase tracking-widest">Genera y administra los cupones que los clientes pueden ingresar en el resumen de su pedido</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr,1.2fr] gap-6 sm:gap-8 items-start">
              {/* Form to create coupon */}
              <form onSubmit={handleCreateCoupon} className="space-y-4 rounded-[2rem] bg-ui-bg/40 border border-ui-border p-4 sm:p-6">
                <div className="border-b border-ui-border pb-2 mb-4">
                  <h4 className="text-sm font-black text-ui-text uppercase tracking-wider">Crear Nuevo Cupón</h4>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Código del Cupón</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: IAN123TOP"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full p-4 rounded-2xl border border-ui-border bg-white outline-none font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">% Descuento</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      placeholder="10"
                      value={newCouponDiscountPercent}
                      onChange={(e) => setNewCouponDiscountPercent(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-ui-border bg-white outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Límite de Usos</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="10"
                      value={newCouponMaxUses}
                      onChange={(e) => setNewCouponMaxUses(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-ui-border bg-white outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 pl-1 select-none">
                  <input
                    type="checkbox"
                    id="isActiveCouponCheckbox"
                    checked={newCouponIsActive}
                    onChange={(e) => setNewCouponIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand-blue border-ui-border rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="isActiveCouponCheckbox" className="text-xs font-bold text-ui-text cursor-pointer">
                    Activar cupón inmediatamente
                  </label>
                </div>

                <Button type="submit" className="w-full !py-4 shadow-md active:scale-[0.98]" disabled={isSavingCoupon}>
                  {isSavingCoupon ? 'Creando...' : 'Crear Cupón'}
                </Button>
              </form>

              {/* Coupons List Table */}
              <div className="rounded-[2rem] border border-ui-border bg-ui-bg/20 p-4 sm:p-6 space-y-4">
                <div className="border-b border-ui-border pb-2">
                  <h4 className="text-sm font-black text-ui-text uppercase tracking-wider">Cupones Registrados</h4>
                </div>
                
                {coupons.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-ui-border bg-white/50 rounded-2xl">
                    <p className="text-xs font-black uppercase tracking-widest text-ui-muted">No hay cupones registrados</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-ui-border bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-ui-bg/60 border-b border-ui-border text-[9px] font-black uppercase tracking-wider text-ui-muted">
                            <th className="py-3 px-4">Código</th>
                            <th className="py-3 px-4 text-right">Descuento</th>
                            <th className="py-3 px-4 text-center">Usos</th>
                            <th className="py-3 px-4 text-center">Estado</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                          {coupons.map((c) => {
                            const isExpired = c.usedCount >= c.maxUses
                            return (
                              <tr key={c.code} className="hover:bg-ui-bg/10 transition-colors">
                                <td className="py-3.5 px-4">
                                  <span className="font-black text-sm uppercase text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-2 py-0.5 rounded-md">
                                    {c.code}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-green-600">{c.discountPercent}%</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`text-[10px] font-bold ${isExpired ? 'text-brand-red font-black' : 'text-ui-text'}`}>
                                    {c.usedCount} / {c.maxUses}
                                  </span>
                                  {isExpired && (
                                    <span className="block text-[8px] font-black uppercase text-brand-red tracking-wider mt-0.5">Agotado</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCouponStatus(c.code, c.isActive)}
                                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${
                                      c.isActive && !isExpired
                                        ? 'bg-green-500/10 text-green-700 border-green-500/30'
                                        : 'bg-ui-bg text-ui-muted border-ui-border'
                                    }`}
                                    disabled={isExpired}
                                  >
                                    {isExpired ? 'Invalido' : c.isActive ? 'Activo' : 'Inactivo'}
                                  </button>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCoupon(c.code)}
                                    className="text-brand-red hover:underline font-black text-xs uppercase"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
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

      {activeTab === 'recipe_book' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ui-border pb-6 gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ui-text">Recetario</h2>
              <p className="text-sm text-ui-muted mt-1 font-bold uppercase tracking-widest">Configura las porciones e insumos consumidos por plato y su costo.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={16} />
              <select 
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-ui-border bg-white font-black text-[10px] uppercase tracking-widest outline-none"
                value={recipeCategoryFilter}
                onChange={(e) => setRecipeCategoryFilter(e.target.value)}
              >
                <option value="ALL">Todas las categorías</option>
                <option value="Ingredientes fijos">Ingredientes fijos</option>
                <option value="Base">Bases</option>
                <option value="Salsas">Salsas</option>
                <option value="Proteínas">Proteínas</option>
                <option value="Complementos">Complementos</option>
                <option value="Empaque">Empaque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(() => {
              const list = [...portions]
              if (portions.length > 0 && !list.some(p => p.name === 'divorciados')) {
                list.push(getDivorciadosPortion())
              }
              return list
                .filter((portion) => {
                  if (recipeCategoryFilter === 'ALL') return true
                  const category = portion.isVirtual ? 'Salsas' : getProductPortionConfig(portion.name).category
                  return category === recipeCategoryFilter
                })
                .map((portion) => {
                  const config = getProductPortionConfig(portion.name)
                  const product = inventory.find(i => i.name === portion.name)
                  const label = portion.isVirtual ? 'Salsa Divorciados' : config.label
                  const category = portion.isVirtual ? 'Salsas' : config.category
                  
                  let lastPurchaseText = ''
                  if (portion.isVirtual) {
                    lastPurchaseText = 'Cálculo automático (50% Roja + 50% Verde)'
                  } else {
                    const sim = simulatedCosts[portion.name] || {}
                    lastPurchaseText = sim.qty ? `Última compra: ${sim.qty} ${sim.unit} por Q${Number(sim.price).toFixed(2)}` : 'Sin compras registradas'
                  }
                  
                  return (
                    <PortionRow
                      key={portion.name}
                      portion={portion}
                      label={label}
                      category={category}
                      lastPurchaseText={lastPurchaseText}
                      sim={simulatedCosts[portion.name] || {}}
                      product={product}
                      isReadOnly={portion.isVirtual}
                      onSave={async (qty, unit, price) => {
                        try {
                          await updatePortion(portion.name, { usedPerPlate: qty, unit, price })
                          toast.success(`Porción de ${label} actualizada exitosamente`)
                          loadData()
                        } catch (err) {
                          toast.error('No se pudo actualizar la porción')
                        }
                      }}
                      onCalculateAuto={(qty, unit) => handleCalculateAutoPortionPrice(portion.name, qty, unit)}
                    />
                  )
                })
            })()}
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

      {/* Modal de Creación de Insumo o Ingrediente */}
      {packagingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-ui-border bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-ui-border pb-4 mb-4">
              <h3 className="text-lg font-black text-ui-text">Crear Insumo o Ingrediente</h3>
              <button
                type="button"
                onClick={() => {
                  setNewPackagingName('')
                  setNewPackagingCategory('Empaque')
                  setNewPackagingUnit('und')
                  setNewPackagingUsedPerPlate('1')
                  setPackagingModalOpen(false)
                }}
                className="rounded-full bg-ui-bg p-1.5 text-ui-muted hover:text-ui-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePackaging} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Salsa Habanera, Chorizo Copetón"
                  value={newPackagingName}
                  onChange={(e) => setNewPackagingName(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">
                    Categoría
                  </label>
                  <select
                    value={newPackagingCategory}
                    onChange={(e) => setNewPackagingCategory(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-ui-border bg-white outline-none transition-all font-bold text-sm"
                  >
                    <option value="Empaque">Empaque</option>
                    <option value="Proteínas">Proteínas</option>
                    <option value="Salsas">Salsas</option>
                    <option value="Base">Base</option>
                    <option value="Complementos">Complementos</option>
                    <option value="Ingredientes fijos">Ingredientes fijos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">
                    Unidad de Medida
                  </label>
                  <select
                    value={newPackagingUnit}
                    onChange={(e) => setNewPackagingUnit(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-ui-border bg-white outline-none transition-all font-bold text-sm"
                  >
                    <option value="und">Unidad (und)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="oz">Onzas (oz)</option>
                    <option value="lb">Libras (lb)</option>
                    <option value="l">Litros (l)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">
                  Porción por Plato (Cantidad consumida)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Ej. 60 para 60g, o 1 para 1 unidad"
                  value={newPackagingUsedPerPlate}
                  onChange={(e) => setNewPackagingUsedPerPlate(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 !py-4 animate-slide-up" disabled={isCreatingPackaging}>
                  {isCreatingPackaging ? 'Creando...' : 'Crear Insumo/Ingrediente'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPackagingName('')
                    setNewPackagingCategory('Empaque')
                    setNewPackagingUnit('und')
                    setNewPackagingUsedPerPlate('1')
                    setPackagingModalOpen(false)
                  }}
                  className="rounded-2xl border border-ui-border bg-white px-5 text-xs font-black uppercase tracking-wider text-ui-muted transition-colors hover:bg-ui-bg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-zoom-out" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed Promo" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-ui-text rounded-full p-2.5 transition-all shadow-md font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="py-10 text-center">
        <p className="text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] opacity-40">
          Chilaquiles TOP · Sistema de Gestión Administrativa
        </p>
      </footer>
    </div>
  )
}

const getIngredientSvg = (name, category = '') => {
  const n = String(name || '').toLowerCase().trim()
  const c = String(category || '').toLowerCase().trim()

  if (n.includes('steak')) return <IllustrationSteak />
  if (n.includes('pollo')) return <IllustrationPollo />
  if (n.includes('chorizo')) return <IllustrationChorizo />
  if (n.includes('pulled pork') || n.includes('pulled_pork')) return <IllustrationPulledPork />
  if (n.includes('aguacate')) return <IllustrationAguacate />
  if (n.includes('cebolla caramelizada')) return <IllustrationCebollaCaramel />
  if (n.includes('totopo')) return <IllustrationTotopos />
  if (n.includes('queso extra')) return <IllustrationQuesoExtra />
  if (n.includes('queso')) return <IllustrationQueso />
  if (n.includes('cebolla')) return <IllustrationCebolla />
  if (n.includes('cilantro')) return <IllustrationCilantro />
  if (n.includes('crema')) return <IllustrationCrema />
  if (n.includes('divorciados')) return <IllustrationDivorciados />
  if (n.includes('roja')) return <IllustrationRoja />
  if (n.includes('verde')) return <IllustrationVerde />
  
  // Category-based fallbacks for dynamic items
  if (c.includes('prote') || n.includes('prote')) return <IllustrationSteak />
  if (c.includes('salsa') || n.includes('salsa')) return <IllustrationRoja />
  if (c.includes('comple') || n.includes('comple')) return <IllustrationAguacate />

  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <ellipse cx="100" cy="110" rx="65" ry="12" fill="#000000" fillOpacity="0.3" />
      <path d="M40 50 L40 90 Q40 115 65 120 L135 120 Q160 115 160 90 L160 50" fill="#E2E8F0" />
      <path d="M40 50 L65 35 L135 35 L160 50 L135 65 L65 65 L40 50 Z" fill="#CBD5E1" />
      <circle cx="100" cy="80" r="15" fill="#94A3B8" />
    </svg>
  )
}

const PortionRow = ({ portion, label, category, lastPurchaseText, sim, product, onSave, onCalculateAuto, isReadOnly }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editQty, setEditQty] = useState(portion.usedPerPlate)
  const [editUnit, setEditUnit] = useState(portion.unit)
  const [editPrice, setEditPrice] = useState(portion.price)

  useEffect(() => {
    setEditQty(portion.usedPerPlate)
    setEditUnit(portion.unit)
    setEditPrice(portion.price)
  }, [portion])

  const allowedUnits = getAllowedInputUnits(product)

  const handleSave = () => {
    if (editQty <= 0) {
      toast.error('La porción debe ser mayor a 0')
      return
    }
    if (editPrice < 0) {
      toast.error('El costo de la porción no puede ser negativo')
      return
    }
    onSave(editQty, editUnit, editPrice)
    setIsEditing(false)
  }

  const handleAuto = () => {
    const calculated = onCalculateAuto(editQty, editUnit)
    if (calculated !== null && calculated !== undefined) {
      setEditPrice(calculated)
      toast.success(`Costo autocalculado: Q${calculated}`)
    }
  }

  const getCategoryBadgeClass = (cat) => {
    const c = String(cat).toLowerCase()
    if (c.includes('fijo')) return 'bg-orange-50 text-orange-700 border-orange-200'
    if (c.includes('base')) return 'bg-purple-50 text-purple-700 border-purple-200'
    if (c.includes('prote')) return 'bg-red-50 text-red-700 border-red-200'
    if (c.includes('salsa')) return 'bg-green-50 text-green-700 border-green-200'
    if (c.includes('comple')) return 'bg-amber-50 text-amber-700 border-amber-200'
    if (c.includes('empaque')) return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  return (
    <div className="bg-white rounded-3xl border border-ui-border shadow-sm p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 flex-1">
          <div className="w-20 h-20 rounded-2xl bg-ui-bg overflow-hidden flex items-center justify-center shrink-0 border border-ui-border/50">
            {getIngredientSvg(portion.name, category)}
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-ui-text capitalize leading-none">
                {label.toLowerCase()}
              </h3>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(category)}`}>
                {category}
              </span>
            </div>
            
            <p className="text-xs text-ui-muted font-bold truncate">
              {lastPurchaseText}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-8 bg-ui-bg/30 border border-ui-border/40 rounded-2xl p-4 md:p-5 shrink-0">
          {isEditing ? (
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 w-24">
                <label className="text-[9px] font-black uppercase text-ui-muted tracking-wider block ml-1">Porción</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-ui-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="space-y-1.5 w-20">
                <label className="text-[9px] font-black uppercase text-ui-muted tracking-wider block ml-1">Unidad</label>
                <select
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-ui-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  {allowedUnits.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 w-32 relative">
                <label className="text-[9px] font-black uppercase text-ui-muted tracking-wider block ml-1">Costo Porción</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ui-muted font-bold">Q</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-white border border-ui-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              {sim.qty && (
                <button
                  type="button"
                  onClick={handleAuto}
                  className="px-3 py-2 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-wider border border-brand-orange/25 transition-colors h-[38px] active:scale-95"
                  title="Calcular a partir de última compra"
                >
                  💡 Autocalcular
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-6 md:gap-8 select-none">
              <div>
                <span className="text-[9px] text-ui-muted uppercase tracking-wider font-bold block">Porción del Plato</span>
                <span className="text-sm font-black text-ui-text">{portion.usedPerPlate} {portion.unit}</span>
              </div>
              <div className="border-l border-ui-border/50 h-8 self-center" />
              <div>
                <span className="text-[9px] text-ui-muted uppercase tracking-wider font-bold block">Costo Porción</span>
                <span className="text-sm font-black text-brand-blue">Q{Number(portion.price || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 md:self-center">
          {isReadOnly ? (
            <span className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
              Autocalculado
            </span>
          ) : isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditQty(portion.usedPerPlate)
                  setEditUnit(portion.unit)
                  setEditPrice(portion.price)
                  setIsEditing(false)
                }}
                className="px-4 py-2 border border-ui-border bg-white text-ui-muted hover:text-ui-text text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-ui-bg hover:bg-ui-bg/80 text-ui-text border border-ui-border text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95"
            >
              Editar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminPage
