import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'

const emptyForm = { name: '', contactName: '', phone: '', email: '', notes: '' }

/**
 * Modal de creación/edición de proveedores. Cuando `supplier` viene definido
 * el formulario opera en modo edición; si es null, crea uno nuevo.
 */
const SupplierFormModal = ({ isOpen, onClose, supplier, isSaving, onSave }) => {
  const [form, setForm] = useState(emptyForm)
  const isEditing = !!supplier

  useEffect(() => {
    if (isOpen) {
      setForm(
        supplier
          ? {
              name: supplier.name || '',
              contactName: supplier.contactName || '',
              phone: supplier.phone || '',
              email: supplier.email || '',
              notes: supplier.notes || '',
            }
          : emptyForm
      )
    }
  }, [isOpen, supplier])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const ok = await onSave({
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    })
    if (ok) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      subtitle={isEditing ? supplier?.name : 'Regístralo para poder asignarlo a tus ingredientes en Stock.'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Nombre del proveedor</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Ej. Distribuidora El Trigal"
            required
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Contacto</label>
            <input
              type="text"
              value={form.contactName}
              onChange={handleChange('contactName')}
              placeholder="Nombre"
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Teléfono</label>
            <input
              type="text"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="0000-0000"
              className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Correo</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="proveedor@correo.com"
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Notas</label>
          <textarea
            value={form.notes}
            onChange={handleChange('notes')}
            rows={2}
            placeholder="Condiciones, días de entrega, etc."
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none resize-none"
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
            disabled={isSaving || !form.name.trim()}
            className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SupplierFormModal
