import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { generateContentDraft, getContentDrafts, getPromotions, approveContentDraft, scheduleContentDraft } from '../shared/config/api.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState('generador');
  const [topic, setTopic] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'generador') {
        const res = await getPromotions();
        setPromotions(res.data || []);
      } else if (activeTab === 'borradores') {
        const res = await getContentDrafts();
        setDrafts(res.data.drafts || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos');
    }
  };

  const handleGenerate = async () => {
    if (!topic && !selectedPromo) {
      toast.error('Ingresa un tema o selecciona una promoción');
      return;
    }
    setLoading(true);
    try {
      const promoData = promotions.find(p => p.id === selectedPromo);
      await generateContentDraft({
        topic: topic || (promoData ? `Promoción: ${promoData.name}` : ''),
        objective: 'sales',
        platforms: ['instagram', 'facebook'],
        formats: ['feed'],
        promotionData: promoData ? { id: promoData.id, name: promoData.name, description: promoData.contentDescription, price: promoData.promoPrice } : null
      });
      toast.success('Borrador generado con éxito. Revisa la pestaña de Borradores.');
      setTopic('');
      setSelectedPromo('');
    } catch (e) {
      console.error(e);
      toast.error('Error al generar contenido');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContentDraft(id);
      toast.success('Borrador aprobado');
      fetchData();
    } catch (e) {
      toast.error('Error al aprobar');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-ui-text">Estudio de Contenido</h2>
        <div className="flex gap-2">
          <Button variant={activeTab === 'generador' ? 'primary' : 'secondary'} onClick={() => setActiveTab('generador')}>Generador</Button>
          <Button variant={activeTab === 'borradores' ? 'primary' : 'secondary'} onClick={() => setActiveTab('borradores')}>Borradores</Button>
          <Button variant={activeTab === 'calendario' ? 'primary' : 'secondary'} onClick={() => setActiveTab('calendario')}>Calendario</Button>
        </div>
      </div>

      <div className="bg-ui-card rounded-2xl border border-ui-border p-6 shadow-sm min-h-[60vh]">
        {activeTab === 'generador' && (
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Generar Contenido</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-ui-muted mb-2 uppercase tracking-wider">O selecciona una promoción base:</label>
              <select 
                className="w-full rounded-2xl border border-ui-border bg-ui-bg px-4 py-3 font-medium outline-none"
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
              >
                <option value="">(Sin promoción específica)</option>
                {promotions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - Q{p.promoPrice}</option>
                ))}
              </select>
            </div>

            <textarea 
              className="w-full rounded-2xl border border-ui-border bg-ui-bg px-4 py-3 font-medium outline-none mb-4"
              rows={4}
              placeholder="Ej: Genera un post sobre nuestra nueva promoción de verano..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generando...' : 'Generar con IA'}
            </Button>
          </div>
        )}
        
        {activeTab === 'borradores' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Tus Borradores</h3>
            {drafts.length === 0 ? (
              <p className="text-ui-muted font-medium">Aún no hay borradores.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map(draft => (
                  <div key={draft._id} className="rounded-[2rem] border border-ui-border p-5 bg-white shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-full">{draft.objective}</span>
                      <StatusBadge value={draft.status} />
                    </div>
                    <h4 className="font-black text-lg mb-2">{draft.title}</h4>
                    <p className="text-sm text-ui-muted mb-4 line-clamp-4 bg-ui-bg p-3 rounded-xl border border-ui-border/50 font-medium">
                      {draft.copy?.main || draft.copy?.caption}
                    </p>
                    <div className="mt-auto pt-4 border-t border-ui-border/60">
                      {draft.status === 'draft' && (
                        <Button className="w-full" onClick={() => handleApprove(draft._id)}>Aprobar Borrador</Button>
                      )}
                      {draft.status === 'approved' && (
                        <Button variant="secondary" className="w-full" onClick={() => toast('Programar en desarrollo')}>Programar</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'calendario' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Calendario de Publicaciones</h3>
            <p className="text-ui-muted font-medium">Aún no hay publicaciones programadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
