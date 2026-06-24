import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { generateContentDraft, getContentDrafts, getPromotions, approveContentDraft, scheduleContentDraft, deleteContentDraft } from '../shared/config/api.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState('generador');
  const [topic, setTopic] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('instagram_feed');
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDraftId, setDeleteDraftId] = useState(null);

  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState(null);

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
      toast.error('Selecciona una promoción para empezar');
      return;
    }
    setLoading(true);
    setGeneratedDraft(null);
    try {
      const promoData = promotions.find(p => p.id === selectedPromo);
      const res = await generateContentDraft({
        topic: topic || '', // Ya no forzamos nada si está vacío
        objective: 'sales',
        platforms: ['instagram', 'facebook', 'whatsapp'],
        formats: [selectedFormat],
        promotionData: promoData ? { id: promoData.id, name: promoData.name, description: promoData.contentDescription, price: promoData.promoPrice, imageUrl: promoData.imageUrl } : null
      });
      
      toast.success('Borrador visual generado exitosamente.');
      setTopic('');
      setSelectedPromo('');
      
      // Muestra la imagen directamente
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

  const handleDeleteClick = (id) => {
    setDeleteDraftId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if(!deleteDraftId) return;
    try {
      await deleteContentDraft(deleteDraftId);
      toast.success('Borrador eliminado');
      if(generatedDraft?._id === deleteDraftId) setGeneratedDraft(null);
      fetchData();
    } catch(e) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteModalOpen(false);
      setDeleteDraftId(null);
    }
  };

  const openScheduleModal = (id) => {
    setScheduleDraftId(id);
    const now = new Date();
    // Default to current date and next hour
    setScheduleDate(now.toISOString().split('T')[0]);
    setScheduleTime(`${String((now.getHours() + 1) % 24).padStart(2, '0')}:00`);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Completa la fecha y hora');
      return;
    }
    try {
      const isoDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
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
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">Paso 2: Formato del Arte</label>
                <select 
                  className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 font-medium outline-none text-ui-text shadow-sm focus:border-brand-blue"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <option value="instagram_feed">Post de Instagram / Facebook (Cuadrado 1080x1080)</option>
                  <option value="instagram_story">Historia de Instagram / Reels (Vertical 1080x1920)</option>
                  <option value="whatsapp_image">Imagen para WhatsApp (Especial con CTA grande)</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">Paso 3: Instrucciones Adicionales (Opcional)</label>
                <textarea 
                  className="w-full rounded-2xl border border-ui-border bg-white px-4 py-4 font-medium outline-none shadow-sm focus:border-brand-blue resize-none"
                  rows={4}
                  placeholder="Ej: Destaca que es una promo de fin de mes, usa un tono súper enérgico. (Si lo dejas en blanco, la IA hará todo el diseño y los textos por ti)."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <Button size="lg" className="w-full text-lg shadow-xl hover:scale-[1.02] transition-transform" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generando e Ilustrando Arte...' : 'Generar Arte con IA'}
              </Button>
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="flex flex-col items-center justify-center bg-ui-bg rounded-3xl border border-ui-border/30 p-8 min-h-[500px] relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="w-16 h-16 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-lg text-brand-blue animate-pulse">Ensamblando diseño y generando imagen...</p>
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
                    <div className="flex gap-2">
                      <StatusBadge value={generatedDraft.status} />
                      <button onClick={() => handleDeleteClick(generatedDraft._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold hover:bg-red-200 transition-colors">BORRAR</button>
                    </div>
                  </div>
                  
                  {generatedDraft.visual?.imageUrl ? (
                    <div
                      className="relative group w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white mb-6 flex items-center justify-center cursor-zoom-in"
                      onClick={() => setLightboxUrl(generatedDraft.visual.imageUrl)}
                      title="Clic para ampliar"
                    >
                      <img src={generatedDraft.visual.imageUrl} alt="Arte Generado" className="max-w-full max-h-[400px] object-contain" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">🔍 Ver en grande</span>
                      </div>
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
                        <Button variant="danger" onClick={() => setGeneratedDraft(null)}>Descartar Vista</Button>
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
                  <div key={draft._id} className="group rounded-3xl border border-ui-border bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                    {/* Header flotante */}
                    <div className="absolute z-10 m-3 flex justify-between w-full pr-6">
                      <StatusBadge value={draft.status} />
                      <button onClick={() => handleDeleteClick(draft._id)} className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg hover:bg-red-600 hover:scale-110 transition-transform cursor-pointer">✕</button>
                    </div>

                    {/* Imagen principal */}
                    <div
                      className="relative w-full aspect-square bg-gray-100 overflow-hidden border-b border-ui-border cursor-zoom-in"
                      onClick={() => draft.visual?.imageUrl && setLightboxUrl(draft.visual.imageUrl)}
                    >
                      {draft.visual?.imageUrl ? (
                        <img src={draft.visual.imageUrl} alt="Draft Art" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gradient-to-br from-gray-100 to-gray-200">Sin imagen</div>
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
      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-text/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative text-center">
            <h3 className="text-2xl font-black mb-2 text-red-600">¿Eliminar Borrador?</h3>
            <p className="text-sm text-ui-muted mb-6">Esta acción no se puede deshacer y el diseño se perderá para siempre.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => { setDeleteModalOpen(false); setDeleteDraftId(null); }}>Cancelar</Button>
              <Button variant="danger" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-light hover:text-gray-300 transition-colors leading-none"
            >×</button>
            <img
              src={lightboxUrl}
              alt="Arte en grande"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white/60 text-sm mt-4 font-medium">Clic fuera para cerrar</p>
          </div>
        </div>
      )}
    </div>
  );
}
