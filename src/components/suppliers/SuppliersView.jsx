import { useMemo, useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Phone, Mail, Search } from 'lucide-react'
import SupplierFormModal from './SupplierFormModal.jsx'

/**
 * Pestaña "Proveedores" (dentro de Gestión). Lista simple con
 * crear/editar/eliminar. La eliminación queda bloqueada por el backend si el
 * proveedor sigue asignado a algún ingrediente en Stock.
 */
// Compatibilidad: proveedores creados antes de contactos multiples solo
// tienen contactName/phone/email sueltos. Los mostramos igual como si fueran
// "un contacto".
const getContacts = (s) => {
  if (Array.isArray(s.contacts) && s.contacts.length > 0) return s.contacts
  if (s.contactName || s.phone || s.email) {
    return [{ name: s.contactName || '', phone: s.phone || '', email: s.email || '' }]
  }
  return []
}

const SuppliersView = ({ suppliers, isSaving, onCreate, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers
    const q = search.trim().toLowerCase()
    return suppliers.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.contactName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [suppliers, search])

  const openCreate = () => {
    setEditingSupplier(null)
    setFormOpen(true)
  }

  const openEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }

  const handleSave = async (payload) => {
    if (editingSupplier) return onUpdate(editingSupplier._id, payload)
    return onCreate(payload)
  }

  const handleConfirmDelete = async (id) => {
    const ok = await onDelete(id)
    if (ok) setPendingDeleteId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ui-border pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-ui-text">Proveedores</h2>
          <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Asígnalos a tus ingredientes en Stock</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ui-muted" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ui-border bg-white text-xs font-bold outline-none"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            Nuevo proveedor
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-[2rem] border border-dashed border-ui-border">
          <Building2 className="mx-auto text-ui-muted mb-3" size={28} />
          <p className="text-ui-muted font-bold text-sm">
            {suppliers.length === 0 ? 'Aún no has registrado proveedores.' : 'Ningún proveedor coincide con tu búsqueda.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla — laptop */}
          <div className="hidden xl:block rounded-2xl border border-ui-border bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ui-bg/80 border-b border-ui-border text-[10px] font-black uppercase tracking-wider text-ui-muted">
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Contactos</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-ui-bg/10 transition-colors">
                    <td className="py-3 px-4 font-black">{s.name}</td>
                    <td className="py-3 px-4 text-ui-muted">
                      {getContacts(s).length === 0 ? (
                        '—'
                      ) : (
                        <div className="space-y-0.5">
                          {getContacts(s).map((c, i) => (
                            <div key={i}>
                              <span className="font-bold text-ui-text">{c.name || 'Sin nombre'}</span>
                              {c.phone ? ` · ${c.phone}` : ''}
                              {c.email ? ` · ${c.email}` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {pendingDeleteId === s._id ? (
                          <>
                            <span className="text-[10px] text-brand-red font-black uppercase">¿Eliminar?</span>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleConfirmDelete(s._id)}
                              className="rounded-lg bg-brand-red px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="rounded-lg border border-ui-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ui-muted"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(s._id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-red transition-all hover:bg-brand-red hover:text-white"
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas — iPad / móvil */}
          <div className="xl:hidden space-y-3">
            {filtered.map((s) => (
              <div key={s._id} className="rounded-2xl border border-ui-border bg-white p-4 space-y-3 min-w-0">
                <div>
                  <p className="font-black text-ui-text text-sm leading-tight">{s.name}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {getContacts(s).length === 0 ? (
                    <p className="text-xs font-bold text-ui-muted">Sin contactos registrados</p>
                  ) : (
                    getContacts(s).map((c, i) => (
                      <div key={i} className="text-xs font-bold text-ui-muted">
                        {c.name && <p className="text-ui-text font-black">{c.name}</p>}
                        {c.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} /> {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} /> {c.email}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-ui-border pt-3 flex items-center justify-end gap-2">
                  {pendingDeleteId === s._id ? (
                    <>
                      <span className="text-[10px] text-brand-red font-black uppercase mr-auto">¿Eliminar?</span>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleConfirmDelete(s._id)}
                        className="rounded-lg bg-brand-red px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-lg border border-ui-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ui-muted"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-blue"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(s._id)}
                        className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-red"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SupplierFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        supplier={editingSupplier}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  )
}

export default SuppliersView
