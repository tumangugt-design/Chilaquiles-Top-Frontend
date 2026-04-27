

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

export const formatBaseRecipe = (base, separator = ' ') => getBaseRecipeParts(base).join(separator)

export const INVENTORY_PRODUCT_OPTIONS = [
  { value: 'plato rectangular', label: 'Plato rectangular 32 oz con tapa', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'tenedor', label: 'Tenedor', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'servilleta', label: 'Servilleta', unit: 'und', category: 'Empaque', usedPerPlate: 2 },
  { value: 'sticker', label: 'Sticker', unit: 'und', category: 'Empaque', usedPerPlate: 1 },
  { value: 'totopos', label: 'Totopos', unit: 'g', category: 'Base', usedPerPlate: 80 },
  { value: 'queso', label: 'Queso', unit: 'g', category: 'Base', usedPerPlate: 60 },
  { value: 'crema', label: 'Crema', unit: 'ml', category: 'Base', usedPerPlate: 25 },
  { value: 'cebolla', label: 'Cebolla', unit: 'g', category: 'Base', usedPerPlate: 15 },
  { value: 'cilantro', label: 'Cilantro', unit: 'g', category: 'Base', usedPerPlate: 10 },
  { value: 'salsa roja', label: 'Salsa Roja', unit: 'ml', category: 'Salsas', usedPerPlate: 236 },
  { value: 'salsa verde', label: 'Salsa Verde', unit: 'ml', category: 'Salsas', usedPerPlate: 236 },
  { value: 'steak', label: 'Steak', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'pollo', label: 'Pollo', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'chorizo', label: 'Chorizo', unit: 'g', category: 'Proteínas', usedPerPlate: 60 },
  { value: 'aguacate', label: 'Aguacate', unit: 'und', category: 'Complementos', usedPerPlate: 0.5 },
  { value: 'cebolla caramelizada', label: 'Cebolla caramelizada', unit: 'g', category: 'Complementos', usedPerPlate: 20 },
  { value: 'queso extra', label: 'Queso extra', unit: 'g', category: 'Complementos', usedPerPlate: 30 },
]

export const INVENTORY_PRODUCT_MAP = Object.fromEntries(
  INVENTORY_PRODUCT_OPTIONS.map((item) => [item.value, item])
)

export const STEPS_ORDER = [
  'LOCATION',
  'PHONE_AUTH',
  'SIZE',
  'SAUCE',
  'PROTEIN',
  'COMPLEMENT',
  'BASE_RECIPE',
  'SUMMARY',
  'CUSTOMER',
  'CONFIRMATION',
]

export const STEP_LABELS = {
  LOCATION: 'Ubicación',
  PHONE_AUTH: 'Verificación',
  SIZE: 'Tamaño',
  SAUCE: 'Salsa',
  PROTEIN: 'Proteína',
  COMPLEMENT: 'Complemento',
  BASE_RECIPE: 'Receta Base',
  SUMMARY: 'Resumen',
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
    value: 'CEBOLLA CARAMELIZADA',
    description: 'Cocinada por un siglo, sabor único.',
    illustration: React.createElement(IllustrationCebollaCaramel),
  },
  {
    id: 'QUESO_EXTRA',
    label: 'Queso Extra',
    value: 'QUESO EXTRA',
    description: 'Queso mozzarella adicional. Tu plato ya incluye queso en la base.',
    illustration: React.createElement(IllustrationQuesoExtra),
  },
]

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
