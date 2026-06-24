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
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

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
    setGeneratedDraft(null);
    try {
      const promoData = promotions.find(p => p.id === selectedPromo);
      const res = await generateContentDraft({
        topic: topic || (promoData ? `Promoción: ${promoData.name}` : ''),
        objective: 'sales',
        platforms: ['instagram', 'facebook'],
        formats: ['feed'],
        promotionData: promoData ? { id: promoData.id, name: promoData.name, description: promoData.contentDescription, price: promoData.promoPrice, imageUrl: promoData.imageUrl } : null
      });
      
      toast.success('Borrador visual generado exitosamente.');
      setTopic('');
      setSelectedPromo('');
      
      // Muestra la imagen directamente
      // Simulamos buscar el último borrador si la API no lo devuelve completo
      if (res.data?.draft) {
        setGeneratedDraft(res.data.draft);
      } else {
        const draftsRes = await getContentDrafts();
        if (draftsRes.data.drafts?.length > 0) {
          setGeneratedDraft(draftsRes.data.drafts[0]);
        }
      }

    } catch (e) {
      console.error(e);
      toast.error('Error al generar arte');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isFromGenerator = false) => {
    try {
      await approveContentDraft(id);
      toast.success('Arte aprobado exitosamente');
      if (isFromGenerator) {
        setGeneratedDraft(prev => ({...prev, status: 'approved'}));
      } else {
        fetchData();
      }
    } catch (e) {
      toast.error('Error al aprobar');
    }
  };

  const openScheduleModal = (id) => {
    setScheduleDraftId(id);
    const now = new Date();
    // Default to current date and next hour
    setScheduleDate(now.toISOString().split('T')[0]);
    setScheduleTime(\`\${String((now.getHours() + 1) % 24).padStart(2, '0')}:00\`);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Completa la fecha y hora');
      return;
    }
    try {
      const isoDateTime = new Date(\`\${scheduleDate}T\${scheduleTime}:00\`).toISOString();
      await scheduleContentDraft(scheduleDraftId, {
        scheduledAt: isoDateTime,
        platforms: ['instagram', 'facebook']
      });
      toast.success('Publicación programada exitosamente');
      setScheduleModalOpen(false);
      
      if (generatedDraft && generatedDraft._id === scheduleDraftId) {
        setGeneratedDraft(null); // Clear preview after scheduling
      }
      if (activeTab === 'borradores') fetchData();
      
    } catch (e) {
      toast.error('Error al programar publicación');
    }
  };

  return (
    <div className="p-6 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-ui-text">Estudio de Contenido</h2>
        <div className="flex gap-2">
          <Button variant={activeTab === 'generador' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('generador'); setGeneratedDraft(null); }}>Generador</Button>
          <Button variant={activeTab === 'borradores' ? 'primary' : 'secondary'} onClick={() => setActiveTab('borradores')}>Galería de Borradores</Button>
          <Button variant={activeTab === 'calendario' ? 'primary' : 'secondary'} onClick={() => setActiveTab('calendario')}>Calendario</Button>
        </div>
      </div>

      <div className="bg-ui-card rounded-3xl border border-ui-border p-8 shadow-sm min-h-[70vh]">
        
        {/* TAB GENERADOR */}
        {activeTab === 'generador' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Columna Izquierda: Formulario */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-black mb-6">Diseñar Nueva Promoción</h3>
              
              <div className="mb-6 p-6 bg-ui-bg rounded-2xl border border-ui-border/50">
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">Paso 1: Selecciona una promoción base</label>
                <select 
                  className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 font-medium outline-none text-ui-text shadow-sm focus:border-brand-blue"
                  value={selectedPromo}
                  onChange={(e) => setSelectedPromo(e.target.value)}
                >
                  <option value="">(Crear diseño desde cero)</option>
                  {promotions.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - Q{p.promoPrice}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">Paso 2: Describe el arte (Instrucciones para IA)</label>
                <textarea 
                  className="w-full rounded-2xl border border-ui-border bg-white px-4 py-4 font-medium outline-none shadow-sm focus:border-brand-blue resize-none"
                  rows={4}
                  placeholder="Ej: Haz un diseño vibrante anunciando 2x1 en desayunos. Usa un tono alegre y resalta el precio..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <Button size="lg" className="w-full text-lg shadow-xl hover:scale-[1.02] transition-transform" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Renderizando Arte Visual...' : 'Generar Arte con IA'}
              </Button>
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="flex flex-col items-center justify-center bg-ui-bg rounded-3xl border border-ui-border/30 p-8 min-h-[500px] relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="w-16 h-16 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-lg text-brand-blue animate-pulse">Ensamblando diseño con Puppeteer...</p>
                </div>
              )}

              {!generatedDraft && !loading && (
                <div className="text-center opacity-50">
                  <div className="w-32 h-32 bg-gray-200 rounded-2xl mx-auto mb-4 border-2 border-dashed border-gray-400"></div>
                  <p className="font-bold text-lg">El arte generado aparecerá aquí</p>
                </div>
              )}

              {generatedDraft && !loading && (
                <div className="w-full flex flex-col h-full animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-brand-blue text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resultado Exitoso</span>
                    <StatusBadge value={generatedDraft.status} />
                  </div>
                  
                  {generatedDraft.visual?.imageUrl ? (
                    <div className="relative group w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white mb-6">
                      <img src={generatedDraft.visual.imageUrl} alt="Arte Generado" className="w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-200">
                      <p className="text-gray-400 font-bold">Sin imagen visual</p>
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-xl border border-ui-border mb-6">
                    <p className="text-sm font-medium text-ui-text line-clamp-3 italic">
                      "{generatedDraft.copy?.main || generatedDraft.copy?.caption}"
                    </p>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4">
                    {generatedDraft.status === 'draft' ? (
                      <>
                        <Button variant="danger" onClick={() => setGeneratedDraft(null)}>Descartar</Button>
                        <Button variant="primary" onClick={() => handleApprove(generatedDraft._id, true)}>Aprobar Arte</Button>
                      </>
                    ) : (
                      <Button variant="primary" className="col-span-2" onClick={() => openScheduleModal(generatedDraft._id)}>Programar Publicación</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* TAB BORRADORES (GALERIA) */}
        {activeTab === 'borradores' && (
          <div>
            <h3 className="text-2xl font-black mb-8">Galería de Artes Generados</h3>
            {drafts.length === 0 ? (
              <div className="text-center py-20 text-ui-muted font-medium bg-ui-bg rounded-3xl border border-dashed border-ui-border">
                No hay artes pendientes en tu galería.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {drafts.map(draft => (
                  <div key={draft._id} className="group rounded-3xl border border-ui-border bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                    {/* Header flotante */}
                    <div className="absolute z-10 m-3 flex gap-2">
                      <StatusBadge value={draft.status} />
                    </div>

                    {/* Imagen principal */}
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden border-b border-ui-border">
                      {draft.visual?.imageUrl ? (
                        <img src={draft.visual.imageUrl} alt="Draft Art" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gradient-to-br from-gray-100 to-gray-200">Solo Texto</div>
                      )}
                    </div>
                    
                    {/* Detalles */}
                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-bold text-md mb-2 truncate" title={draft.title}>{draft.title}</h4>
                      <p className="text-xs text-ui-muted mb-4 line-clamp-2">
                        {draft.copy?.main || draft.copy?.caption}
                      </p>
                      <div className="mt-auto pt-4 flex gap-2">
                        {draft.status === 'draft' && (
                          <Button size="sm" className="w-full py-2" onClick={() => handleApprove(draft._id)}>Aprobar</Button>
                        )}
                        {draft.status === 'approved' && (
                          <Button size="sm" variant="secondary" className="w-full py-2 bg-brand-orange text-white hover:bg-brand-orange/90" onClick={() => openScheduleModal(draft._id)}>Programar</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* TAB CALENDARIO */}
        {activeTab === 'calendario' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-2xl font-black mb-4">Calendario de Publicaciones</h3>
            <div className="bg-ui-bg px-8 py-12 rounded-3xl border border-ui-border text-center max-w-lg">
              <span className="text-4xl mb-4 block">📅</span>
              <p className="text-ui-muted font-medium text-lg">La vista interactiva del calendario está en construcción. Mientras tanto, puedes programar desde la pestaña de Borradores.</p>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-text/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setScheduleModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors font-bold text-xl"
            >×</button>
            
            <h3 className="text-2xl font-black mb-2">Programar Publicación</h3>
            <p className="text-sm text-ui-muted mb-6">Selecciona el momento exacto en que la automatización publicará este arte en tus redes.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2">Día de publicación</label>
                <input 
                  type="date" 
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:border-brand-blue"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2">Hora (Formato 24h)</label>
                <input 
                  type="time" 
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:border-brand-blue"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => setScheduleModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" className="w-full" onClick={handleSchedule}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
