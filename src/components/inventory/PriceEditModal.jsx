import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'

/**
 * Modal para editar el precio fijo de un producto (panel "Consumo por plato").
 */
const PriceEditModal = ({ isOpen, onClose, product, currentPrice, isSaving, onSave }) => {
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (isOpen) setPrice(String(Number(currentPrice || 0)))
  }, [isOpen, currentPrice])

  if (!product) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onSave(product, price)
    if (ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar precio fijo" subtitle={product.label} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Precio fijo del producto (Q)</label>
          <input
            className="w-full rounded-xl border border-brand-blue bg-white px-4 py-3 text-sm font-black text-ui-text outline-none"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
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
            disabled={isSaving}
            className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PriceEditModal
