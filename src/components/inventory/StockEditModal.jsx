import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { getAllowedInputUnits, convertInventoryAmountToBaseUnit } from '../../shared/constants/index.jsx'

/**
 * Modal para editar el stock de un producto. Cada ajuste requiere un motivo
 * (conteo físico, merma, corrección de error, etc.) que queda en el historial.
 */
const StockEditModal = ({ isOpen, onClose, item, meta, isSaving, onSave }) => {
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen && item) {
      const allowedUnits = getAllowedInputUnits(meta)
      setStock(String(Number(item.stock || 0)))
      setUnit(allowedUnits[0]?.value || meta?.unit || item.unit || '')
      setReason('')
    }
  }, [isOpen, item, meta])

  if (!item) return null

  const storedPreview = convertInventoryAmountToBaseUnit(stock, unit, meta)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    const ok = await onSave(item, stock, unit, reason.trim())
    if (ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar stock" subtitle={meta?.label || item.name} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Nuevo stock</label>
            <input
              className="w-full rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
              type="number"
              min="0"
              step="0.01"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Cantidad"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Unidad</label>
            <select
              className="w-full rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {getAllowedInputUnits(meta).map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {storedPreview > 0 && (
          <p className="text-xs font-bold text-ui-muted">
            Se guardará como <span className="font-black text-brand-blue">{storedPreview.toFixed(2)} {meta?.unit || item.unit}</span>.
          </p>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Motivo del ajuste (requerido)</label>
          <textarea
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none resize-none"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. conteo físico, merma, corrección de error..."
            required
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-ui-border bg-ui-bg px-4 py-3 text-[10px] font-black uppercase tracking-widest text-ui-muted transition-all hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !reason.trim()}
            className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default StockEditModal
