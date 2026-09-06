import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'

/**
 * Modal genérico para acciones que requieren un motivo obligatorio antes de
 * confirmarse (ajustes de inventario, eliminaciones, renombrados, etc.).
 */
const ConfirmReasonModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  confirmLabel = 'Confirmar',
  danger = false,
  reasonPlaceholder = 'Ej. conteo físico, merma, corrección de error...',
  isSaving,
  onConfirm,
}) => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) setReason('')
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    const ok = await onConfirm(reason.trim())
    if (ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Motivo (requerido)</label>
          <textarea
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none resize-none"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            autoFocus
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
            className={`flex-1 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60 ${
              danger ? 'bg-brand-red' : 'bg-brand-blue'
            }`}
          >
            {isSaving ? 'Guardando...' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmReasonModal
