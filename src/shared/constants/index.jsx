

import React from 'react'
import { IllustrationMedia, IllustrationCompleta } from '../../components/illustrations/SizeIllustrations.jsx'
import { IllustrationRoja, IllustrationVerde, IllustrationDivorciados } from '../../components/illustrations/SauceIllustrations.jsx'
import {
  IllustrationSteak,
  IllustrationPollo,
  IllustrationChorizo,
  IllustrationAguacate,
  IllustrationCebollaCaramel,
  IllustrationQuesoExtra,
  IllustrationCebolla,
  IllustrationCilantro,
  IllustrationCrema,
} from '../../components/illustrations/IngredientIllustrations.jsx'

export const calculateTotal = (platesCount) => {
  if (platesCount === 0) return 0
  const groupsOfThree = Math.floor(platesCount / 3)
  const remainder = platesCount % 3
  let total = groupsOfThree * 120
  if (remainder === 1) total += 50
  if (remainder === 2) total += 90
  return total
}

export const getMarginalPrice = (idx) => {
  const count = idx + 1
  return calculateTotal(count) - calculateTotal(count - 1)
}

export const getBaseRecipeParts = (base) => {
  if (!base) return []
  const parts = []
  if (base.cream) parts.push('Crema')
  if (base.onion) parts.push('Cebolla')
  if (base.cilantro) parts.push('Cilantro')
  return parts
}

export const formatBaseRecipe = (base, separator = ' • ') => getBaseRecipeParts(base).join(separator)

const OZ_TO_ML = 29.5735295625
const SAUCE_FULL_PORTION_OZ = 8
const SAUCE_HALF_PORTION_OZ = 4

export const SAUCE_PORTIONS = {
  fullOz: SAUCE_FULL_PORTION_OZ,
  halfOz: SAUCE_HALF_PORTION_OZ,
  fullMl: Math.round(SAUCE_FULL_PORTION_OZ * OZ_TO_ML * 1000) / 1000,
  halfMl: Math.round(SAUCE_HALF_PORTION_OZ * OZ_TO_ML * 1000) / 1000,
}

export const INVENTORY_PRODUCT_OPTIONS = [
  { value: 'plato rectangular', label: 'Plato rectangular 32 oz con tapa', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'tenedor', label: 'Tenedor', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'servilleta', label: 'Servilleta', unit: 'und', category: 'Empaque', usedPerPlate: 2 },
  { value: 'sticker', label: 'Sticker', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'totopos', label: 'Totopos', unit: 'g', category: 'Ingredientes fijos', usedPerPlate: 80 },
  { value: 'queso', label: 'Queso', unit: 'g', category: 'Ingredientes fijos', usedPerPlate: 60 },
  { value: 'crema', label: 'Crema', unit: 'ml', category: 'Base', usedPerPlate: 25 },
  { value: 'cebolla', label: 'Cebolla', unit: 'g', category: 'Base', usedPerPlate: 15 },
  { value: 'cilantro', label: 'Cilantro', unit: 'g', category: 'Base', usedPerPlate: 10 },
  { value: 'salsa roja', label: 'Salsa Roja', unit: 'ml', category: 'Salsas', usedPerPlate: 200, displayUsedPerPlate: 200, displayUnit: 'ml' },
  { value: 'salsa verde', label: 'Salsa Verde', unit: 'ml', category: 'Salsas', usedPerPlate: 200, displayUsedPerPlate: 200, displayUnit: 'ml' },
  { value: 'steak', label: 'Steak', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'pollo', label: 'Pollo', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'chorizo', label: 'Chorizo', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'aguacate', label: 'Aguacate', unit: 'und', category: 'Complementos', usedPerPlate: 0.5 },
  { value: 'cebolla caramelizada', label: 'Cebolla caramelizada', unit: 'g', category: 'Complementos', usedPerPlate: 30 },
  { value: 'queso extra', label: 'Queso extra', unit: 'g', category: 'Complementos', usedPerPlate: 30 },
  { value: 'plato de 8 onz', label: 'Plato de 8 onz', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'tapadera de 8 onz', label: 'Tapadera de 8 onz', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'plato de 4 onz', label: 'Plato de 4 onz', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'tapadera de 4 onz', label: 'Tapadera de 4 onz', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
]

export const INVENTORY_PRODUCT_MAP = Object.fromEntries(
  INVENTORY_PRODUCT_OPTIONS.map((item) => [item.value, item])
)

export const INVENTORY_INPUT_UNITS = [
  { value: 'lb', label: 'Lbs' },
  { value: 'g', label: 'Gramos' },
  { value: 'und', label: 'Unidad' },
  { value: 'oz', label: 'Oz' },
  { value: 'ml', label: 'Ml' },
  { value: 'l', label: 'Ltrs' },
]

const UNIT_OPTIONS_BY_BASE_UNIT = {
  g: ['g', 'lb', 'oz'],
  ml: ['ml', 'l', 'oz'],
  und: ['und'],
}

export const getAllowedInputUnits = (product) => {
  if (!product) return INVENTORY_INPUT_UNITS
  if (product.category === 'Empaque') return INVENTORY_INPUT_UNITS.filter((unit) => unit.value === 'und')
  const allowed = UNIT_OPTIONS_BY_BASE_UNIT[product.unit] || [product.unit]
  return INVENTORY_INPUT_UNITS.filter((unit) => allowed.includes(unit.value))
}

export const convertInventoryAmountToBaseUnit = (amount, inputUnit, product) => {
  const numericAmount = Number(amount)
  if (!product || Number.isNaN(numericAmount) || numericAmount <= 0) return 0

  const conversions = {
    g: { g: 1, lb: 453.59237, oz: 28.349523125 },
    ml: { ml: 1, l: 1000, oz: 29.5735295625 },
    und: { und: 1 },
  }

  const baseUnit = String(product.unit || 'und').toLowerCase()
  const inUnit = String(inputUnit || '').toLowerCase()

  const factor = conversions[baseUnit]?.[inUnit]
  if (!factor) {
    if (baseUnit === inUnit) return numericAmount
    return 0
  }
  return Math.round(numericAmount * factor * 1000) / 1000
}

export const STEPS_ORDER = [
  'LOCATION',
  'SIZE',
  'SAUCE',
  'PROTEIN',
  'COMPLEMENT',
  'BASE_RECIPE',
  'SUMMARY',
  'TEMPERATURE',
  'CUSTOMER',
  'CONFIRMATION',
]

export const STEP_LABELS = {
  LOCATION: 'Ubicación',
  SIZE: 'Tamaño',
  SAUCE: 'Salsa',
  PROTEIN: 'Proteína',
  COMPLEMENT: 'Complemento',
  BASE_RECIPE: 'Receta Base',
  SUMMARY: 'Resumen',
  TEMPERATURE: 'Temperatura',
  CUSTOMER: 'Datos',
  CONFIRMATION: 'Confirmación',
}

export const OPTIONS_COUNT = [
  {
    id: '1',
    label: '1 Plato',
    value: 1,
    description: 'Perfecto para una persona.',
    price: 50,
    illustration: React.createElement(IllustrationMedia),
    badge: 'Individual',
  },
  {
    id: '2',
    label: '2 Platos',
    value: 2,
    description: 'Ideal para compartir en pareja.',
    price: 90,
    illustration: React.createElement(IllustrationCompleta),
    badge: 'Popular',
  },
  {
    id: '3',
    label: '3 Platos',
    value: 3,
    description: 'Para los que tienen mucha hambre.',
    price: 120,
    illustration: React.createElement(IllustrationCompleta),
    badge: 'Ahorro TOP',
  },
  {
    id: 'PROMO',
    label: '🎁 Promociones',
    value: 'PROMO',
    description: 'Combos y ofertas especiales.',
    price: null,
    illustration: React.createElement(IllustrationCompleta),
    badge: 'Especiales',
  },
]

export const OPTIONS_SAUCE = [
  {
    id: 'ROJA',
    label: 'Salsa Roja',
    value: 'ROJA',
    description: 'A base de tomates y especias. No pica.',
    illustration: React.createElement(IllustrationRoja),
  },
  {
    id: 'VERDE',
    label: 'Salsa Verde',
    value: 'VERDE',
    description: 'A base de miltomate y especias. No pica.',
    illustration: React.createElement(IllustrationVerde),
  },
  {
    id: 'DIVORCIADOS',
    label: 'Divorciados',
    value: 'DIVORCIADOS',
    description: '¿Indeciso? Disfruta mitad roja y mitad verde.',
    illustration: React.createElement(IllustrationDivorciados),
    badge: 'Best Seller',
  },
]

export const OPTIONS_PROTEIN = [
  {
    id: 'STEAK',
    label: 'Steak',
    value: 'STEAK',
    description: 'Tiras de res asadas a la perfección.',
    illustration: React.createElement(IllustrationSteak),
  },
  {
    id: 'POLLO',
    label: 'Pollo Cocido',
    value: 'POLLO',
    description: 'Pechuga de pollo desmenuzada jugosa.',
    illustration: React.createElement(IllustrationPollo),
  },
  {
    id: 'CHORIZO',
    label: 'Chorizo Argentino',
    value: 'CHORIZO',
    description: 'Sabor intenso y ahumado. Ligeramente picante',
    illustration: React.createElement(IllustrationChorizo),
    spicyLevel: 'MILD',
  },
]

export const OPTIONS_COMPLEMENT = [
  {
    id: 'AGUACATE',
    label: 'Aguacate',
    value: 'AGUACATE',
    description: 'Cubos de aguacate hass fresco.',
    illustration: React.createElement(IllustrationAguacate),
  },
  {
    id: 'CEBOLLA_CARAMELIZADA',
    label: 'Cebolla Caramelizada',
    value: 'CEBOLLA_CARAMELIZADA',
    description: 'Cocinada por un siglo, sabor único.',
    illustration: React.createElement(IllustrationCebollaCaramel),
  },
  {
    id: 'QUESO_EXTRA',
    label: 'Queso Extra',
    value: 'QUESO_EXTRA',
    description: 'Queso mozzarella adicional. Tu plato ya incluye queso como ingrediente fijo.',
    illustration: React.createElement(IllustrationQuesoExtra),
  },
]



export const normalizeComplementValue = (value = '') => {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, '_')
  if (normalized === 'CEBOLLA_CARAMELIZADA') return 'CEBOLLA_CARAMELIZADA'
  if (normalized === 'QUESO_EXTRA') return 'QUESO_EXTRA'
  if (normalized === 'AGUACATE') return 'AGUACATE'
  return normalized || null
}

export const getOptionLabel = (value, options = []) => {
  if (!value) return null
  const normalizedValue = String(value || '').trim().toUpperCase().replace(/\s+/g, '_')
  const option = options.find((item) => {
    const itemValue = String(item.value || item.id || '').trim().toUpperCase().replace(/\s+/g, '_')
    return itemValue === normalizedValue
  })
  return option ? option.label : value
}

export const getPromoConstraint = (promo, field) => {
  const raw = promo?.constraints?.[field] ?? promo?.[field] ?? 'ALL'
  const normalized = String(raw || 'ALL').trim().toUpperCase().replace(/\s+/g, '_')
  return normalized || 'ALL'
}

export const normalizePromotionForOrder = (promo = {}) => {
  const requestedCount = Number(promo.requestedCount || promo.platesCount || promo.quantity || promo.itemsCount || 2)
  const promoPrice = Number(promo.promoPrice ?? promo.price ?? 0)
  return {
    id: promo.id,
    name: promo.name || 'Promoción',
    description: promo.description || '',
    requestedCount: Number.isNaN(requestedCount) || requestedCount < 1 ? 2 : requestedCount,
    promoPrice: Number.isNaN(promoPrice) || promoPrice <= 0 ? null : promoPrice,
    constraints: {
      sauce: getPromoConstraint(promo, 'sauce'),
      protein: getPromoConstraint(promo, 'protein'),
      complement: getPromoConstraint(promo, 'complement'),
    },
    recipe: promo.recipe || null,
  }
}

export const OPTIONS_BASE_RECIPE = [
  {
    id: 'cream',
    label: 'Crema',
    description: 'Para el balance perfecto',
    illustration: React.createElement(IllustrationCrema),
  },
  {
    id: 'onion',
    label: 'Cebolla',
    description: 'Cebolla blanca picada',
    illustration: React.createElement(IllustrationCebolla),
  },
  {
    id: 'cilantro',
    label: 'Cilantro',
    description: 'Aromático y fresco',
    illustration: React.createElement(IllustrationCilantro),
  },
]
