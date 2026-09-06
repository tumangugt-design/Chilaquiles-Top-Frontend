import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'

const emptyForm = { name: '', notes: '' }
const emptyContact = () => ({ name: '', phone: '', email: '' })

/**
 * Modal de creación/edición de proveedores. Cuando `supplier` viene definido
 * el formulario opera en modo edición; si es null, crea uno nuevo.
 *
 * Un proveedor puede tener varios contactos (ej. Cenma vende varias cosas,
 * cada una via un contacto distinto) — se manejan como lista para que cada
 * Compra pueda referenciar con cuál se hizo (trazabilidad).
 */
const SupplierFormModal = ({ isOpen, onClose, supplier, isSaving, onSave }) => {
  const [form, setForm] = useState(emptyForm)
  const [contacts, setContacts] = useState([emptyContact()])
  const isEditing = !!supplier

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setForm({ name: supplier.name || '', notes: supplier.notes || '' })
        const existingContacts = Array.isArray(supplier.contacts) ? supplier.contacts : []
        if (existingContacts.length > 0) {
          setContacts(existingContacts.map((c) => ({ name: c.name || '', phone: c.phone || '', email: c.email || '' })))
        } else if (supplier.contactName || supplier.phone || supplier.email) {
          // Proveedor antiguo (pre-contactos multiples): migra su contacto unico a la lista.
          setContacts([{ name: supplier.contactName || '', phone: supplier.phone || '', email: supplier.email || '' }])
        } else {
          setContacts([emptyContact()])
        }
      } else {
        setForm(emptyForm)
        setContacts([emptyContact()])
      }
    }
  }, [isOpen, supplier])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleContactChange = (index, field) => (e) => {
    const value = e.target.value
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  const addContact = () => setContacts((prev) => [...prev, emptyContact()])
  const removeContact = (index) => setContacts((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const cleanContacts = contacts
      .map((c) => ({ name: c.name.trim(), phone: c.phone.trim(), email: c.email.trim() }))
      .filter((c) => c.name || c.phone || c.email)

    const ok = await onSave({
      name: form.name.trim(),
      notes: form.notes.trim(),
      contacts: cleanContacts,
      // Se mantienen sincronizados con el primer contacto para compatibilidad
      // con datos/pantallas que aun leen los campos legados.
      contactName: cleanContacts[0]?.name || '',
      phone: cleanContacts[0]?.phone || '',
      email: cleanContacts[0]?.email || ''
    })
    if (ok) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      subtitle={isEditing ? supplier?.name : 'Regístralo para poder asignarlo a tus Compras.'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-ui-muted ml-1 tracking-widest">Nombre del proveedor</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Ej. Cenma - Central de Mayoreo"
            required
            className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Contactos</label>
            <button
              type="button"
              onClick={addContact}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-blue"
            >
              <Plus size={12} /> Agregar contacto
            </button>
          </div>
          <p className="text-[10px] text-ui-muted font-medium ml-1 -mt-2">
            Un proveedor puede tener varios (ej. distintos productos, distinta persona).
          </p>

          {contacts.map((contact, index) => (
            <div key={index} className="rounded-xl border border-ui-border p-3 space-y-2 relative">
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="absolute top-2 right-2 text-ui-muted hover:text-brand-red transition-colors"
                  aria-label="Eliminar contacto"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <input
                type="text"
                value={contact.name}
                onChange={handleContactChange(index, 'name')}
                placeholder="Nombre del contacto"
                className="w-full rounded-lg border border-ui-border bg-white px-3 py-2 text-sm font-bold text-ui-text outline-none pr-8"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contact.phone}
                  onChange={handleContactChange(index, 'phone')}
                  placeholder="Teléfono"
                  className="w-full rounded-lg border border-ui-border bg-white px-3 py-2 text-sm font-bold text-ui-text outline-none"
                />
                <input
                  type="email"
                  value={contact.email}
                  onChange={handleContactChange(index, 'email')}
                  placeholder="Correo"
                  className="w-full rounded-lg border border-ui-border bg-white px-3 py-2 text-sm font-bold text-ui-text outline-none"
                />
              </div>
            </div>
          ))}
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
