import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import SelectOrNewField from './SelectOrNewField.jsx'
import { getCompatibleUnits } from '../../shared/constants/units.js'

const emptyForm = { rawQuantityUsed: '', stockItemName: '', producedQuantity: '', producedUnit: '', notes: '' }

/**
 * Modal para transformar (Asignar) una porcion de una Compra en bruto
 * hacia un producto de Stock ya transformado (ej. 5 lb cebolla -> 3 lb
 * cebolla caramelizada). El costo se calcula UNA sola vez aqui y queda
 * congelado (inheritedCost / costPerProducedUnit), igual que el precio
 * de una Porcion en Entradas.
 *
 * `inventoryItems`: catalogo de productos de Stock ya existentes — se
 * seleccionan de ahi para trazabilidad (en vez de escribir el nombre cada
 * vez, lo que generaria duplicados por typos).
 */
const PurchaseAllocationModal = ({ isOpen, onClose, purchase, inventoryItems = [], isSaving, onSave }) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm)
    }
  }, [isOpen, purchase])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const stockItemNames = useMemo(() => inventoryItems.map((i) => i.name).sort(), [inventoryItems])

  const matchedInventoryItem = useMemo(
    () => inventoryItems.find((i) => i.name === form.stockItemName) || null,
    [inventoryItems, form.stockItemName]
  )
  const compatibleUnits = getCompatibleUnits(matchedInventoryItem?.unit || null)

  // Si el producto de Stock elegido cambia y la unidad ya no es compatible
  // con su unidad catalogo, la limpiamos para evitar guardar un costeo FIFO
  // que despues no se pueda convertir.
  useEffect(() => {
    if (form.producedUnit && !compatibleUnits.includes(form.producedUnit)) {
      setForm((prev) => ({ ...prev, producedUnit: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedInventoryItem])

  const remaining = purchase ? Number(purchase.remainingQuantity) : 0
  const rawQty = Number(form.rawQuantityUsed)
  const exceedsRemaining = rawQty > remaining

  const canSave = purchase && rawQty > 0 && !exceedsRemaining && form.stockItemName.trim() && Number(form.producedQuantity) > 0 && form.producedUnit.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    const ok = await onSave(purchase._id, {
      rawQuantityUsed: rawQty,
      stockItemName: form.stockItemName.trim(),
      producedQuantity: Number(form.producedQuantity),
      producedUnit: form.producedUnit.trim(),
      notes: form.notes.trim()
    })
    if (ok) onClose()
  }

  if (!purchase) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transformar Compra" subtitle={`${purchase.ingredientName} — quedan ${remaining} ${purchase.unit} de este lote`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-ui-bg border border-ui-border px-4 py-3 text-xs font-bold text-ui-muted">
          Costo del lote: Q{Number(purchase.totalCost).toFixed(2)} por {purchase.quantity} {purchase.unit}
          {' '}(Q{(Number(purchase.totalCost) / Number(purchase.quantity || 1)).toFixed(4)} / {purchase.unit})
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Cantidad cruda usada ({purchase.unit})</label>
          <input
            type="number"
            step="any"
            min="0"
            max={remaining}
            value={form.rawQuantityUsed}
            onChange={handleChange('rawQuantityUsed')}
            placeholder={`Max ${remaining}`}
            required
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
          />
          {exceedsRemaining && (
            <p className="text-[10px] font-bold text-red-500 ml-1">No puede exceder lo que queda en el lote ({remaining} {purchase.unit}).</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Producto de Stock resultante</label>
          <SelectOrNewField
            value={form.stockItemName}
            onChange={(val) => setForm((prev) => ({ ...prev, stockItemName: val }))}
            options={stockItemNames}
            placeholder="Selecciona un producto de Stock..."
            newLabel="+ Nuevo producto de Stock"
            inputPlaceholder="Ej. cebolla caramelizada"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Cantidad producida</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.producedQuantity}
              onChange={handleChange('producedQuantity')}
              placeholder="3"
              required
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad producida</label>
            <select
              value={form.producedUnit}
              onChange={handleChange('producedUnit')}
              required
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            >
              <option value="" disabled>Selecciona...</option>
              {compatibleUnits.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        {matchedInventoryItem && (
          <p className="text-[10px] font-bold text-ui-muted -mt-2 ml-1">
            "{matchedInventoryItem.name}" se mide en {matchedInventoryItem.unit} en Stock — solo se muestran unidades convertibles.
          </p>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Notas</label>
          <textarea
            value={form.notes}
            onChange={handleChange('notes')}
            rows={2}
            placeholder="Opcional"
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ui-border bg-ui-bg px-4 py-3 text-[10px] font-black uppercase tracking-widest text-ui-muted transition-all hover:bg-white">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving || !canSave} className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60">
            {isSaving ? 'Guardando...' : 'Registrar transformacion'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PurchaseAllocationModal
