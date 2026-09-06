import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { INVENTORY_PRODUCT_MAP, getAllowedInputUnits, convertInventoryAmountToBaseUnit } from '../../shared/constants/index.jsx'

const emptyForm = { name: '', unit: '', amount: '', price: '' }

/**
 * Modal para "Registrar entrada". Antes era un formulario siempre visible
 * que ocupaba la mitad de la pantalla; ahora se abre bajo demanda para dejar
 * la pestaña de Entradas enfocada en mostrar los datos (historial + consumo).
 */
const EntryFormModal = ({ isOpen, onClose, inventory, isSaving, onSubmit }) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) setForm(emptyForm)
  }, [isOpen])

  const dynamicInventoryOptions = useMemo(() => (
    inventory
      .map((item) => {
        const catalogItem = INVENTORY_PRODUCT_MAP[item.name]
        const label = catalogItem?.label || item.name.charAt(0).toUpperCase() + item.name.slice(1)
        return { value: item.name, label, category: item.category || 'Otros', unit: item.unit }
      })
      .sort((a, b) => (a.category !== b.category ? a.category.localeCompare(b.category) : a.label.localeCompare(b.label)))
  ), [inventory])

  const selectedProduct = useMemo(
    () => inventory.find((i) => i.name === form.name) || INVENTORY_PRODUCT_MAP[form.name],
    [inventory, form.name]
  )
  const storedAmount = convertInventoryAmountToBaseUnit(form.amount, form.unit, selectedProduct)
  const totalPrice = form.price === '' ? null : Number(form.price)

  const handleProductChange = (value) => {
    const product = INVENTORY_PRODUCT_MAP[value]
    const allowedUnits = getAllowedInputUnits(product)
    setForm((prev) => ({ ...prev, name: value, unit: allowedUnits[0]?.value || product?.unit || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onSubmit(form)
    if (ok) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entrada de Inventario"
      subtitle="Selecciona el producto y registra la cantidad ingresada."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Producto</label>
          <select
            className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
            value={form.name}
            onChange={(e) => handleProductChange(e.target.value)}
            autoFocus
          >
            <option value="">Selecciona un producto</option>
            {dynamicInventoryOptions.map((product) => (
              <option key={product.value} value={product.value}>{product.category} · {product.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad de entrada</label>
            <select
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              disabled={!form.name}
            >
              {getAllowedInputUnits(selectedProduct).map((unit) => (
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
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Ej. 10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">
              Costo Total de Compra (Q) <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg outline-none transition-all font-bold"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.price}
              placeholder="Ej. 100.00"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        {selectedProduct && storedAmount > 0 && (
          <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-4 py-3 text-sm font-bold text-ui-muted space-y-1">
            <div>
              Se guardará como <span className="text-brand-blue font-black">{storedAmount.toFixed(2)} {selectedProduct.unit}</span> en stock.
            </div>
            {totalPrice !== null && !Number.isNaN(totalPrice) && (
              <div className="text-xs">
                Costo de porción calculado: <span className="text-brand-blue font-black">
                  Q{((totalPrice / storedAmount) * (selectedProduct.usedPerPlate || 1)).toFixed(2)}
                </span> por plato (usando {selectedProduct.usedPerPlate} {selectedProduct.unit}).
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full !py-5" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Registrar entrada'}
        </Button>
      </form>
    </Modal>
  )
}

export default EntryFormModal
