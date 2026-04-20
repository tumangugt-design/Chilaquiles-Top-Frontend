// ============================================
// CONSTANTES Y DATOS DEL MENÚ
// Chilaquiles TOP - Shared Constants
// ============================================

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

// Lógica de Precios
export const calculateTotal = (platesCount) => {
  if (platesCount === 0) return 0;
  const groupsOfThree = Math.floor(platesCount / 3);
  const remainder = platesCount % 3;
  let total = groupsOfThree * 120;
  if (remainder === 1) total += 50;
  if (remainder === 2) total += 90;
  return total;
};

export const getMarginalPrice = (idx) => {
  const count = idx + 1;
  return calculateTotal(count) - calculateTotal(count - 1);
};

// Orden de los pasos del wizard
export const STEPS_ORDER = [
  'SAUCE',
  'PROTEIN',
  'COMPLEMENT',
  'BASE_RECIPE',
  'SUMMARY',
  'CUSTOMER',
  'CONFIRMATION',
]

// Etiquetas de los pasos
export const STEP_LABELS = {
  LOCATION: 'Ubicación',
  SAUCE: 'Salsa',
  PROTEIN: 'Proteína',
  COMPLEMENT: 'Complemento',
  BASE_RECIPE: 'Receta Base',
  SUMMARY: 'Resumen',
  CUSTOMER: 'Datos',
  CONFIRMATION: 'Confirmación',
}



// Opciones de salsa
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

// Opciones de proteína
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

// Opciones de complemento
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
    description: 'Queso mozzarella adicional. Tu plato ya incluye queso en la base.',
    illustration: React.createElement(IllustrationQuesoExtra),
  },
]

// Opciones de receta base
export const OPTIONS_BASE_RECIPE = [
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
  {
    id: 'cream',
    label: 'Crema Light',
    description: 'Para el balance perfecto',
    illustration: React.createElement(IllustrationCrema),
  },
]
