import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import SelectOrNewField from './SelectOrNewField.jsx'
import { STANDARD_UNITS, getCompatibleUnits } from '../../shared/constants/units.js'

const emptyInput = () => ({ ingredientName: '', quantity: '', unit: '' })
const emptyForm = () => ({ stockItemName: '', producedQuantity: '', producedUnit: '', notes: '' })

/**
 * "Producir lote": transforma uno o mas ingredientes en bruto (cada uno
 * consumido FIFO de sus propios lotes de Compra) en un producto de Stock.
 *
 * Cubre tanto el caso simple (un solo ingrediente, ej. cebolla ->
 * cebolla caramelizada) como el compuesto (varios ingredientes que se
 * combinan y ya no se pueden medir por separado, ej. salsa = tomate +
 * cebolla + chile -> litros de salsa; ahí solo importa cuánto entró de cada
 * uno y cuánto salió en total).
 *
 * `knownIngredients`: ingredientes en bruto con Compras registradas (de ahí
 * se puede consumir). `inventoryItems`: catálogo de Stock existente, para
 * seleccionar el resultado y filtrar unidades compatibles.
 */
const ProductionBatchModal = ({ isOpen, onClose, knownIngredients = [], inventoryItems = [], isSaving, onSave }) => {
  const [form, setForm] = useState(emptyForm)
  const [inputs, setInputs] = useState([emptyInput()])

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm())
      setInputs([emptyInput()])
    }
  }, [isOpen])

  const matchedInventoryItem = useMemo(
    () => inventoryItems.find((i) => i.name === form.stockItemName) || null,
    [inventoryItems, form.stockItemName]
  )
  const compatibleUnits = getCompatibleUnits(matchedInventoryItem?.unit || null)

  useEffect(() => {
    if (form.producedUnit && !compatibleUnits.includes(form.producedUnit)) {
      setForm((prev) => ({ ...prev, producedUnit: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedInventoryItem])

  const updateInput = (index, field, value) => {
    setInputs((prev) => prev.map((inp, i) => (i === index ? { ...inp, [field]: value } : inp)))
  }
  const addInput = () => setInputs((prev) => [...prev, emptyInput()])
  const removeInput = (index) => setInputs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const inputsValid = inputs.length > 0 && inputs.every((inp) => inp.ingredientName.trim() && Number(inp.quantity) > 0 && inp.unit.trim())
  const canSave = form.stockItemName.trim() && Number(form.producedQuantity) > 0 && form.producedUnit.trim() && inputsValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    const ok = await onSave({
      stockItemName: form.stockItemName.trim(),
      producedQuantity: Number(form.producedQuantity),
      producedUnit: form.producedUnit.trim(),
      inputs: inputs.map((inp) => ({
        ingredientName: inp.ingredientName.trim(),
        quantity: Number(inp.quantity),
        unit: inp.unit.trim()
      })),
      notes: form.notes.trim()
    })
    if (ok) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Producir Lote"
      subtitle="Combina uno o más ingredientes en bruto (de tus Compras) en un producto de Stock. El costo se reparte según lo que realmente costó cada ingrediente."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Ingredientes en bruto usados</label>
            <button
              type="button"
              onClick={addInput}
              disabled={knownIngredients.length === 0}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-blue disabled:opacity-40"
            >
              <Plus size={12} /> Agregar ingrediente
            </button>
          </div>

          {knownIngredients.length === 0 && (
            <p className="text-[10px] font-bold text-ui-muted ml-1">
              Todavía no tienes Compras registradas. Registra al menos una antes de producir un lote.
            </p>
          )}

          {inputs.map((inp, index) => (
            <div key={index} className="rounded-xl border border-ui-border p-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-start relative">
              <SelectOrNewField
                value={inp.ingredientName}
                onChange={(val) => updateInput(index, 'ingredientName', val)}
                options={knownIngredients}
                placeholder="Ingrediente..."
                allowNew={false}
              />
              <input
                type="number"
                step="any"
                min="0"
                value={inp.quantity}
                onChange={(e) => updateInput(index, 'quantity', e.target.value)}
                placeholder="Cantidad"
                className="w-full sm:w-28 rounded-xl border border-ui-border bg-white px-3 py-3 text-sm font-bold text-ui-text outline-none"
              />
              <select
                value={inp.unit}
                onChange={(e) => updateInput(index, 'unit', e.target.value)}
                className="w-full sm:w-24 rounded-xl border border-ui-border bg-white px-3 py-3 text-sm font-bold text-ui-text outline-none"
              >
                <option value="" disabled>Unidad</option>
                {STANDARD_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {inputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInput(index)}
                  className="text-ui-muted hover:text-brand-red transition-colors self-center"
                  aria-label="Quitar ingrediente"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-ui-border pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Producto de Stock resultante</label>
            <SelectOrNewField
              value={form.stockItemName}
              onChange={(val) => setForm((prev) => ({ ...prev, stockItemName: val }))}
              options={inventoryItems.map((i) => i.name).sort()}
              placeholder="Selecciona un producto de Stock..."
              newLabel="+ Nuevo producto de Stock"
              inputPlaceholder="Ej. salsa roja"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Cantidad producida (total)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.producedQuantity}
                onChange={(e) => setForm((prev) => ({ ...prev, producedQuantity: e.target.value }))}
                placeholder="6"
                required
                className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad producida</label>
              <select
                value={form.producedUnit}
                onChange={(e) => setForm((prev) => ({ ...prev, producedUnit: e.target.value }))}
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
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
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
            {isSaving ? 'Guardando...' : 'Producir lote'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductionBatchModal
