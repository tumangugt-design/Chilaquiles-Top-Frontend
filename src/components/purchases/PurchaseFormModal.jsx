import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import SelectOrNewField from './SelectOrNewField.jsx'
import { STANDARD_UNITS } from '../../shared/constants/units.js'

const emptyForm = { ingredientName: '', quantity: '', unit: '', totalCost: '', supplier: '', contactName: '', purchaseDate: '', notes: '' }

const toDateInputValue = (d) => {
  const date = d ? new Date(d) : new Date()
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date - tzOffset).toISOString().slice(0, 10)
}

/**
 * Modal para registrar una Compra en bruto (Fase 1-2 de Compras/Lotes).
 * Esto NO es una Entrada de Stock — es el ingreso del ingrediente crudo,
 * antes de cualquier transformación (ver PurchaseAllocationModal).
 *
 * `knownIngredients`: nombres de ingredientes en bruto ya usados antes (se
 * repiten casi siempre, salvo que se agregue algo nuevo al menú) — se
 * ofrecen para seleccionar en vez de escribir cada vez.
 */
const PurchaseFormModal = ({ isOpen, onClose, suppliers = [], knownIngredients = [], isSaving, onSave }) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, purchaseDate: toDateInputValue() })
    }
  }, [isOpen])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s._id === form.supplier) || null,
    [suppliers, form.supplier]
  )
  const supplierContacts = selectedSupplier?.contacts || []

  const handleSupplierChange = (e) => {
    setForm((prev) => ({ ...prev, supplier: e.target.value, contactName: '' }))
  }

  const canSave = form.ingredientName.trim() && Number(form.quantity) > 0 && form.unit.trim() && form.totalCost !== '' && Number(form.totalCost) >= 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    const ok = await onSave({
      ingredientName: form.ingredientName.trim(),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      totalCost: Number(form.totalCost),
      supplier: form.supplier || null,
      contactName: form.contactName.trim(),
      purchaseDate: form.purchaseDate || undefined,
      notes: form.notes.trim()
    })
    if (ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Compra" subtitle="Ingreso del ingrediente EN BRUTO — su costo real, sin importar cómo se transforme después." maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Ingrediente en bruto</label>
          <SelectOrNewField
            value={form.ingredientName}
            onChange={(val) => setForm((prev) => ({ ...prev, ingredientName: val }))}
            options={knownIngredients}
            placeholder="Selecciona un ingrediente..."
            newLabel="+ Nuevo ingrediente"
            inputPlaceholder="Ej. cebolla"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Cantidad comprada</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.quantity}
              onChange={handleChange('quantity')}
              placeholder="20"
              required
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad</label>
            <select
              value={form.unit}
              onChange={handleChange('unit')}
              required
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            >
              <option value="" disabled>Selecciona...</option>
              {STANDARD_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Costo total (Q)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.totalCost}
              onChange={handleChange('totalCost')}
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Fecha</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={handleChange('purchaseDate')}
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Proveedor</label>
            <select
              value={form.supplier}
              onChange={handleSupplierChange}
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            >
              <option value="">Sin especificar</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Contacto</label>
            <select
              value={form.contactName}
              onChange={handleChange('contactName')}
              disabled={supplierContacts.length === 0}
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none disabled:opacity-50"
            >
              <option value="">{supplierContacts.length === 0 ? 'Sin contactos' : 'Sin especificar'}</option>
              {supplierContacts.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}{c.phone ? ` · ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            {isSaving ? 'Guardando...' : 'Registrar compra'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PurchaseFormModal
