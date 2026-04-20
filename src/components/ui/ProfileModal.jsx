import { useState } from 'react';
import Button from './Button.jsx';
import toast from 'react-hot-toast';
import { updateProfile } from '../../shared/config/api.js';

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      toast.success('Perfil actualizado correctamente');
      onUpdate(response.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ui-bg/60 backdrop-blur-md animate-fade-in">
      <div className="bg-ui-card rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 sm:p-12 animate-slide-up relative border border-ui-border">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-ui-muted hover:text-ui-text transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-brand-blue/20 overflow-hidden mb-4 bg-ui-bg">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-blue">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-2xl font-black text-ui-text tracking-tighter">Mi Perfil</h3>
          <p className="text-ui-muted font-medium text-sm">Gestiona tus datos personales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Email (No editable)</label>
            <input 
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg/50 text-ui-muted font-bold cursor-not-allowed" 
              value={user?.email || ''} 
              disabled 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Nombre Completo</label>
            <input 
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Teléfono de Contacto</label>
            <input 
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+502..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">URL de Foto de Perfil</label>
            <input 
              className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full !py-5 text-base shadow-xl shadow-brand-blue/20" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
