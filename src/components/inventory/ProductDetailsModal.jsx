import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'

/**
 * Modal para editar los "metadatos" de un producto: proveedor u origen
 * (comprado vs. preparación interna), umbral de bajo stock, y su nombre o
 * etiqueta de visualización. Todo cambio requiere un motivo.
 *
 * Los productos del catálogo base (los ~20 ingredientes fijos del sistema)
 * no se pueden renombrar internamente porque el nombre es usado por toda la
 * lógica de pedidos/promociones — en su lugar se les puede poner una
 * "etiqueta de visualización". Los productos creados manualmente sí se
 * pueden renombrar libremente.
 */
const ProductDetailsModal = ({ isOpen, onClose, item, meta, suppliers, isCatalogItem, isSaving, onSave, onRename }) => {
  const [sourceType, setSourceType] = useState('comprado')
  const [supplierId, setSupplierId] = useState('')
  const [minimumStock, setMinimumStock] = useState('0')
  const [displayLabel, setDisplayLabel] = useState('')
  const [newName, setNewName] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen && item) {
      setSourceType(item.sourceType || 'comprado')
      setSupplierId(item.supplierId || '')
      setMinimumStock(String(Number(item.minimumStock || 0)))
      setDisplayLabel(item.displayLabel || '')
      setNewName(item.name || '')
      setReason('')
    }
  }, [isOpen, item])

  if (!item) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return

    const min = Number(minimumStock)
    if (Number.isNaN(min) || min < 0) return

    let ok = await onSave(item.name, {
      sourceType,
      supplierId: sourceType === 'preparado_interno' ? null : (supplierId || null),
      minimumStock: min,
      displayLabel: isCatalogItem ? displayLabel.trim() : '',
      reason: reason.trim(),
    })

    if (ok && !isCatalogItem && newName.trim() && newName.trim().toLowerCase() !== item.name) {
      ok = await onRename(item.name, newName.trim(), reason.trim())
    }

    if (ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar detalles" subtitle={meta?.label || item.name} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Origen</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSourceType('comprado')}
              className={`rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                sourceType === 'comprado' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-ui-border bg-white text-ui-muted'
              }`}
            >
              Comprado
            </button>
            <button
              type="button"
              onClick={() => setSourceType('preparado_interno')}
              className={`rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                sourceType === 'preparado_interno' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-ui-border bg-white text-ui-muted'
              }`}
            >
              Preparación interna
            </button>
          </div>
        </div>

        {sourceType === 'comprado' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Proveedor</label>
            <select
              className="w-full p-3.5 rounded-xl border border-ui-border bg-white outline-none font-bold text-sm"
              value={supplierId || ''}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Sin proveedor asignado</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Umbral de bajo stock</label>
          <input
            className="w-full p-3.5 rounded-xl border border-ui-border bg-white outline-none font-bold text-sm"
            type="number"
            min="0"
            step="0.01"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
          />
          <p className="text-[10px] text-ui-muted">Cuando el stock llegue o baje de este número, se marca como "bajo stock" en la vista de Inventario.</p>
        </div>

        {isCatalogItem ? (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Etiqueta de visualización (opcional)</label>
            <input
              className="w-full p-3.5 rounded-xl border border-ui-border bg-white outline-none font-bold text-sm"
              type="text"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder={meta?.label || item.name}
            />
            <p className="text-[10px] text-ui-muted">Este es un producto del catálogo base: su nombre interno no se puede cambiar, pero puedes personalizar cómo se muestra.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Nombre del producto</label>
            <input
              className="w-full p-3.5 rounded-xl border border-ui-border bg-white outline-none font-bold text-sm"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Motivo del cambio (requerido)</label>
          <textarea
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none resize-none"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. actualización de datos del proveedor"
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

export default ProductDetailsModal
