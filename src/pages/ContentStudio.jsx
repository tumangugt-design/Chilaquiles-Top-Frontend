import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { generateContentDraft, getContentDrafts, getPromotions, approveContentDraft, scheduleContentDraft, deleteContentDraft } from '../shared/config/api.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// Tipos de publicación disponibles
const PUBLICATION_TYPES = [
  { value: 'promocion', label: 'Promoción' },
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'educativo', label: 'Educativo — Cómo funciona' },
  { value: 'como_pedir', label: 'Cómo pedir' },
  { value: 'como_calentar', label: 'Cómo calentar los chilaquiles' },
  { value: 'frescura', label: 'Frescura de ingredientes' },
  { value: 'entrega_en_frio', label: 'Entrega en frío' },
  { value: 'recordatorio', label: 'Recordatorio de pedido' },
  { value: 'topia', label: 'Contenido con TopIA' },
  { value: 'marca', label: 'Branding / Identidad' },
  { value: 'venta_general', label: 'Venta general' },
  { value: 'idea_libre', label: 'Idea libre (describe abajo)' },
];

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState('generador');

  // ---- Estado del Generador ----
  const [publicationType, setPublicationType] = useState('promocion'); // tipo de publicación
  const [freeIdea, setFreeIdea] = useState(''); // instrucción adicional libre
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('post');
  const [includePlate, setIncludePlate] = useState(false);
  const [includeTopIA, setIncludeTopIA] = useState(false);

  // ---- Datos ----
  const [promotions, setPromotions] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // ---- Modales ----
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDraftId, setDeleteDraftId] = useState(null);
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
    // Validación: si es promoción, debe haber una promo seleccionada
    if (publicationType === 'promocion' && !selectedPromo) {
      toast.error('Selecciona una promoción de la lista para continuar');
      return;
    }

    setLoading(true);
    setGeneratedDraft(null);

    try {
      const promoData = promotions.find(p => p.id === selectedPromo);

      // El "topic" que se manda al backend es el tipo de publicación + la idea libre
      const topicText = freeIdea
        ? `${publicationType}: ${freeIdea}`
        : publicationType;

      const payload = {
        topic: topicText,
        format: selectedFormat,
        formats: [selectedFormat],
        objective: 'sales',
        platforms: ['instagram', 'facebook', 'whatsapp'],
        includePlate,
        includeTopIA,
        promotionData: promoData ? {
          id: promoData.id,
          name: promoData.name,
          description: promoData.contentDescription || promoData.description || '',
          price: promoData.promoPrice || promoData.price || '',
          imageUrl: promoData.imageUrl || ''
        } : null
      };

      const res = await generateContentDraft(payload);

      toast.success('¡Arte generado exitosamente!');

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
      toast.error('Error al generar el arte. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isFromGenerator = false) => {
    try {
      await approveContentDraft(id);
      toast.success('Arte aprobado exitosamente');
      if (isFromGenerator) {
        setGeneratedDraft(prev => ({ ...prev, status: 'approved' }));
      } else {
        fetchData();
      }
    } catch (e) {
      toast.error('Error al aprobar');
    }
  };

  const openScheduleModal = (draftId) => {
    setScheduleDraftId(draftId);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Selecciona fecha y hora');
      return;
    }
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      await scheduleContentDraft(scheduleDraftId, { scheduledAt });
      toast.success('Publicación programada');
      setScheduleModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Error al programar publicación');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDraftId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteContentDraft(deleteDraftId);
      toast.success('Borrador eliminado');
      setDeleteModalOpen(false);
      setDeleteDraftId(null);
      if (generatedDraft?._id === deleteDraftId) setGeneratedDraft(null);
      fetchData();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const isPromo = publicationType === 'promocion';

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

        {/* ======== TAB GENERADOR ======== */}
        {activeTab === 'generador' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Columna Izquierda: Formulario */}
            <div className="flex flex-col gap-5">
              <h3 className="text-2xl font-black">Diseñar Nueva Publicación</h3>

              {/* PASO 1: Tipo de publicación */}
              <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border/50">
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">
                  Paso 1 — Tipo de Publicación
                </label>
                <select
                  className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 font-medium outline-none text-ui-text shadow-sm focus:border-brand-blue"
                  value={publicationType}
                  onChange={(e) => {
                    setPublicationType(e.target.value);
                    setSelectedPromo('');
                  }}
                >
                  {PUBLICATION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* PASO 2 (condicional): Seleccionar promoción */}
              {isPromo && (
                <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border/50">
                  <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">
                    Paso 2 — Selecciona la Promoción
                  </label>
                  <select
                    className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 font-medium outline-none text-ui-text shadow-sm focus:border-brand-blue"
                    value={selectedPromo}
                    onChange={(e) => setSelectedPromo(e.target.value)}
                  >
                    <option value="">(Seleccionar una promoción)</option>
                    {promotions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — Q{p.promoPrice}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Instrucción adicional */}
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">
                  {isPromo ? 'Instrucción adicional (Opcional)' : 'Describe tu idea (Opcional)'}
                </label>
                <textarea
                  className="w-full rounded-2xl border border-ui-border bg-white px-4 py-4 font-medium outline-none shadow-sm focus:border-brand-blue resize-none"
                  rows={3}
                  placeholder={isPromo
                    ? 'Ej: Destaca que es fin de mes, usa tono urgente...'
                    : 'Ej: Habla sobre cómo los chilaquiles se mantienen calientes hasta 2 horas...'
                  }
                  value={freeIdea}
                  onChange={(e) => setFreeIdea(e.target.value)}
                />
              </div>

              {/* Elementos visuales opcionales */}
              <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border/50">
                <label className="block text-sm font-bold text-ui-text mb-3 tracking-wide">
                  Elementos de Marca (Opcionales)
                </label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      checked={includePlate}
                      onChange={(e) => setIncludePlate(e.target.checked)}
                    />
                    <div>
                      <span className="font-semibold block">Foto real de plato</span>
                      <span className="text-xs text-ui-muted">Incluye una foto real de chilaquiles sin fondo</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      checked={includeTopIA}
                      onChange={(e) => setIncludeTopIA(e.target.checked)}
                    />
                    <div>
                      <span className="font-semibold block">Mascota TopIA</span>
                      <span className="text-xs text-ui-muted">Incluye el avatar oficial de TopIA</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2 tracking-wide">
                  Formato del Arte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'post', label: 'Post', desc: '1080 × 1080 px', icon: '⬛' },
                    { val: 'historia', label: 'Historia', desc: '1080 × 1920 px', icon: '📱' },
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setSelectedFormat(f.val)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selectedFormat === f.val
                        ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                        : 'border-ui-border bg-white text-ui-text hover:border-brand-blue/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{f.icon}</div>
                      <div className="font-bold">{f.label}</div>
                      <div className="text-xs opacity-70">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-lg shadow-xl hover:scale-[1.02] transition-transform"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generando Arte...
                  </span>
                ) : '✨ Generar Arte con IA'}
              </Button>
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="flex flex-col items-center justify-center bg-ui-bg rounded-3xl border border-ui-border/30 p-8 min-h-[500px] relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 gap-4">
                  <div className="w-16 h-16 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                  <p className="font-bold text-lg text-brand-blue animate-pulse text-center px-4">
                    La IA está diseñando tu arte...
                    <br />
                    <span className="text-sm font-normal text-ui-muted">Esto puede tardar 20–40 segundos</span>
                  </p>
                </div>
              )}

              {!generatedDraft && !loading && (
                <div className="text-center opacity-50">
                  <div className="w-40 h-40 bg-gray-200 rounded-3xl mx-auto mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center text-5xl">🎨</div>
                  <p className="font-bold text-lg">El arte aparecerá aquí</p>
                  <p className="text-sm text-ui-muted mt-1">Completa el formulario y genera tu arte</p>
                </div>
              )}

              {generatedDraft && !loading && (
                <div className="w-full flex flex-col h-full animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">✓ Arte Generado</span>
                    <div className="flex gap-2">
                      <StatusBadge value={generatedDraft.status} />
                      <button onClick={() => handleDeleteClick(generatedDraft._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold hover:bg-red-200 transition-colors">Borrar</button>
                    </div>
                  </div>

                  {generatedDraft.visual?.imageUrl ? (
                    <div
                      className="relative group w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white mb-4 flex items-center justify-center cursor-zoom-in"
                      onClick={() => setLightboxUrl(generatedDraft.visual.imageUrl)}
                      title="Clic para ampliar"
                    >
                      <img src={generatedDraft.visual.imageUrl} alt="Arte Generado" className="max-w-full max-h-[420px] object-contain" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">🔍 Ver en grande</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-amber-50 rounded-2xl flex flex-col items-center justify-center mb-4 border border-amber-200">
                      <span className="text-2xl mb-2">⚠️</span>
                      <p className="text-amber-700 font-bold text-sm">Imagen no generada</p>
                      <p className="text-amber-600 text-xs mt-1">El contenido se guardó pero la imagen falló</p>
                    </div>
                  )}

                  {/* Botón descargar */}
                  {generatedDraft.visual?.imageUrl && (
                    <a
                      href={generatedDraft.visual.imageUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-center bg-brand-blue/10 text-brand-blue font-bold py-2 px-4 rounded-xl hover:bg-brand-blue/20 transition-colors text-sm mb-3"
                    >
                      ⬇ Descargar imagen
                    </a>
                  )}

                  {generatedDraft.copy?.caption && (
                    <div className="bg-white p-3 rounded-xl border border-ui-border mb-4 text-sm text-ui-muted italic line-clamp-3">
                      "{generatedDraft.copy.caption}"
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-3">
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

        {/* ======== TAB BORRADORES ======== */}
        {activeTab === 'borradores' && (
          <div>
            <h3 className="text-2xl font-black mb-8">Galería de Artes Generados</h3>
            {drafts.length === 0 ? (
              <div className="text-center py-20 text-ui-muted font-medium bg-ui-bg rounded-3xl border border-dashed border-ui-border">
                No hay artes en tu galería.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {drafts.map(draft => (
                  <div key={draft._id} className="group rounded-3xl border border-ui-border bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                    <div className="absolute z-10 m-3 flex justify-between w-full pr-6">
                      <StatusBadge value={draft.status} />
                      <button onClick={() => handleDeleteClick(draft._id)} className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg hover:bg-red-600 hover:scale-110 transition-transform cursor-pointer">✕</button>
                    </div>

                    <div
                      className="relative w-full aspect-square bg-gray-100 overflow-hidden border-b border-ui-border cursor-zoom-in"
                      onClick={() => draft.visual?.imageUrl && setLightboxUrl(draft.visual.imageUrl)}
                    >
                      {draft.visual?.imageUrl ? (
                        <img src={draft.visual.imageUrl} alt="Arte" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gradient-to-br from-gray-100 to-gray-200">Sin imagen</div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-bold text-md mb-1 truncate" title={draft.title}>{draft.title}</h4>
                      <p className="text-xs text-ui-muted mb-3 line-clamp-2">{draft.copy?.caption || draft.copy?.main}</p>

                      {draft.visual?.imageUrl && (
                        <a
                          href={draft.visual.imageUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="text-center text-xs font-bold text-brand-blue bg-brand-blue/5 py-1.5 px-3 rounded-lg mb-3 hover:bg-brand-blue/10 transition-colors"
                        >
                          ⬇ Descargar
                        </a>
                      )}

                      <div className="mt-auto pt-2 flex gap-2">
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

        {/* ======== TAB CALENDARIO ======== */}
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

      {/* ======== MODAL PROGRAMAR ======== */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-text/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setScheduleModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors font-bold text-xl">×</button>
            <h3 className="text-2xl font-black mb-2">Programar Publicación</h3>
            <p className="text-sm text-ui-muted mb-6">Selecciona el momento exacto para publicar este arte.</p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2">Día de publicación</label>
                <input type="date" className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:border-brand-blue" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-ui-text mb-2">Hora (Formato 24h)</label>
                <input type="time" className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:border-brand-blue" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => setScheduleModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" className="w-full" onClick={handleSchedule}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* ======== MODAL ELIMINAR ======== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-text/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative text-center">
            <h3 className="text-2xl font-black mb-2 text-red-600">¿Eliminar Borrador?</h3>
            <p className="text-sm text-ui-muted mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => { setDeleteModalOpen(false); setDeleteDraftId(null); }}>Cancelar</Button>
              <Button variant="danger" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {/* ======== LIGHTBOX ======== */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxUrl(null)} className="absolute -top-12 right-0 text-white text-4xl font-light hover:text-gray-300 transition-colors leading-none">×</button>
            <img src={lightboxUrl} alt="Arte en grande" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            <div className="flex gap-4 mt-4">
              <a href={lightboxUrl} download target="_blank" rel="noreferrer" className="bg-white text-brand-blue font-bold px-6 py-2 rounded-full hover:bg-blue-50 transition-colors text-sm">⬇ Descargar imagen</a>
              <p className="text-white/60 text-sm flex items-center">Clic fuera para cerrar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
