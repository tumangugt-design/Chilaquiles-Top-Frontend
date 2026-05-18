import { INVENTORY_PRODUCT_MAP } from '../constants/index.jsx'

const normalizeName = (value = '') => String(value || '').trim().toLowerCase()

const formatAmount = (value) => {
  const numeric = Number(value || 0)
  if (Number.isNaN(numeric)) return '0'
  if (Number.isInteger(numeric)) return String(numeric)
  return numeric.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

export const buildInventoryStatusMap = (items = []) => {
  return new Map(
    items.map((item) => [normalizeName(item.name), { ...item, name: normalizeName(item.name) }])
  )
}

export const getProductAvailability = (statusMap, productName, customRequired = null, requiredDisplay = null) => {
  const normalizedName = normalizeName(productName)
  const meta = INVENTORY_PRODUCT_MAP[normalizedName]
  const item = statusMap.get(normalizedName)
  const required = Number(customRequired ?? item?.required ?? meta?.usedPerPlate ?? 1)
  const unit = item?.unit || meta?.unit || ''
  const displayRequired = requiredDisplay || { amount: required, unit }
  const formatDisplay = (display) => `${formatAmount(display.amount)} ${display.unit || unit}`.trim()

  if (!item) {
    return {
      name: normalizedName,
      available: false,
      availabilityStatus: 'insufficient',
      availabilityLabel: 'Stock insuficiente',
      availabilityDetail: 'No existe en inventario.',
      required,
      stock: 0,
      unit,
    }
  }

  const stock = Number(item.stock || 0)
  const isActive = item.isActive !== false

  if (!isActive) {
    return {
      name: normalizedName,
      available: false,
      availabilityStatus: 'inactive',
      availabilityLabel: 'Desactivado',
      availabilityDetail: 'Producto desactivado desde inventario.',
      required,
      requiredDisplay: displayRequired,
      stock,
      unit,
    }
  }

  if (stock < required) {
    return {
      name: normalizedName,
      available: false,
      availabilityStatus: 'insufficient',
      availabilityLabel: 'Stock insuficiente',
      availabilityDetail: `Disponible ${formatAmount(stock)} ${unit}. Requiere ${formatDisplay(displayRequired)}.`,
      required,
      requiredDisplay: displayRequired,
      stock,
      unit,
    }
  }

  return {
    name: normalizedName,
    available: true,
    availabilityStatus: 'available',
    availabilityLabel: '',
    availabilityDetail: '',
    required,
    requiredDisplay: displayRequired,
    stock,
    unit,
  }
}

export const combineAvailabilities = (availabilities = [], detail = '') => {
  const inactive = availabilities.find((item) => item.availabilityStatus === 'inactive')
  if (inactive) {
    return {
      ...inactive,
      availabilityDetail: detail || inactive.availabilityDetail,
    }
  }

  const insufficient = availabilities.find((item) => item.availabilityStatus === 'insufficient')
  if (insufficient) {
    return {
      ...insufficient,
      availabilityDetail: detail || insufficient.availabilityDetail,
    }
  }

  return {
    available: true,
    availabilityStatus: 'available',
    availabilityLabel: '',
    availabilityDetail: '',
  }
}
