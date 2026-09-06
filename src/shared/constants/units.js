// Unidades estandarizadas para Compras/Lotes (Fase 2-3). Deben coincidir con
// las unidades que el backend sabe convertir (ver UNIT_ALIASES/conversions en
// inventory.service.js) para que el costeo FIFO funcione.
export const STANDARD_UNITS = ['lb', 'kg', 'oz', 'g', 'l', 'ml', 'und']

// Unidades "producidas" compatibles segun la unidad catalogo real del
// producto de Stock (g / ml / und, definidas en Inventory). Si el producto
// de Stock resultante ya existe en Inventario, solo tiene sentido ofrecer
// las unidades que el backend puede convertir hacia esa unidad catalogo.
const COMPATIBLE_BY_CATALOG_UNIT = {
  g: ['g', 'kg', 'lb', 'oz'],
  ml: ['ml', 'l', 'oz'],
  und: ['und']
}

// `catalogUnit`: la unidad real del producto de Stock en Inventario (si ya
// existe). Si es null/desconocida (producto nuevo que aun no esta en
// Inventario), se ofrece la lista completa.
export const getCompatibleUnits = (catalogUnit) => {
  if (!catalogUnit) return STANDARD_UNITS
  return COMPATIBLE_BY_CATALOG_UNIT[catalogUnit] || STANDARD_UNITS
}
