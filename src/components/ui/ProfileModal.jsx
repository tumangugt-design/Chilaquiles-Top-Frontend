import { useEffect, useState } from 'react'
import Button from './Button.jsx'
import toast from 'react-hot-toast'
import { updateProfile } from '../../shared/config/api.js'

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        photoUrl: user?.photoUrl || ''
      })
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await updateProfile(formData)
      toast.success('Perfil actualizado correctamente')
      onUpdate(response.data.user)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-4 pt-24 sm:pt-4 bg-ui-bg/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-ui-card rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 animate-slide-up relative border border-ui-border max-h-[calc(100vh-7rem)] sm:max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-0 ml-auto -mr-1 -mt-1 z-10 w-10 h-10 rounded-full bg-ui-bg border border-ui-border text-ui-muted hover:text-ui-text transition-colors flex items-center justify-center shadow-sm"
          aria-label="Cerrar perfil"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6 -mt-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full border-4 border-brand-blue/20 overflow-hidden mb-3 bg-ui-bg">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-blue">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-2xl font-black text-ui-text tracking-tighter">Mi Perfil</h3>
          <p className="text-ui-muted font-medium text-sm">Gestiona tus datos personales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-3 tracking-widest">Email / usuario</label>
            <input className="w-full p-3.5 rounded-2xl border border-ui-border bg-ui-bg/50 text-ui-muted font-bold cursor-not-allowed" value={user?.email || user?.username || ''} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-3 tracking-widest">Nombre completo</label>
            <input className="w-full p-3.5 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tu nombre" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-3 tracking-widest">Teléfono</label>
            <input className="w-full p-3.5 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+502..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-3 tracking-widest">URL de foto de perfil</label>
            <input className="w-full p-3.5 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://..." />
          </div>

          <Button type="submit" className="w-full !py-4 text-base shadow-xl shadow-brand-blue/20" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
