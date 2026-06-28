import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { generateContentDraft, getContentDrafts, getPromotions, approveContentDraft, scheduleContentDraft, deleteContentDraft, publishContentDraft, createManualDraft, updateContentDraft } from '../shared/config/api.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// Platos disponibles
const PLATE_ASSETS = [
  { id: 'chilaquiles_1', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%201.png', name: 'Plato 1 (Clásico)' },
  { id: 'chilaquiles_2', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%202.png', name: 'Plato 2 (Aguacate)' },
  { id: 'chilaquiles_3', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%203.png', name: 'Plato 3' },
  { id: 'chilaquiles_4', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%204.png', name: 'Plato 4' },
  { id: 'chilaquiles_5', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%205.png', name: 'Plato 5' },
  { id: 'chilaquiles_6', url: 'https://raw.githubusercontent.com/tumangugt-design/Imagenes-chilaquiles/main/Fotos%20de%20Platos%20Reales%20Sin%20Fondo/Plato%206.png', name: 'Plato 6' }
];

export default function ContentStudio({ initialPromoId, onSendWhatsAppCampaign }) {
  const [activeTab, setActiveTab] = useState('generador');

  // ---- Estado del Generador ----
  const [publicationType, setPublicationType] = useState('promocion'); // 'promocion' | 'otro'
  const [freeIdea, setFreeIdea] = useState(''); // instrucción adicional libre
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('post');
  
  // Platos
  const [includePlate, setIncludePlate] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState('aleatorio');

  // ---- Publicación Manual ----
  const [manualFile, setManualFile] = useState(null);
  const [manualPreviewUrl, setManualPreviewUrl] = useState(null);
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualFormat, setManualFormat] = useState('post');

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

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishDraftId, setPublishDraftId] = useState(null);
  const [publishPlatforms, setPublishPlatforms] = useState({ facebook: true, instagram: true });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDraftId, setDeleteDraftId] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (initialPromoId) {
      setPublicationType('promocion');
      setSelectedPromo(initialPromoId);
    }
  }, [initialPromoId]);

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
    // Validación
    if (publicationType === 'promocion' && !selectedPromo) {
      toast.error('Selecciona una promoción de la lista para continuar');
      return;
    }
    if (publicationType === 'otro' && !freeIdea.trim()) {
      toast.error('Escribe de qué tratará la publicación');
      return;
    }

    setLoading(true);
    setGeneratedDraft(null);

    try {
      const promoData = publicationType === 'promocion' ? promotions.find(p => p.id === selectedPromo) : null;

      const topicText = publicationType === 'promocion' ? 'Promoción de ventas' : freeIdea;

      const payload = {
        topic: topicText,
        format: selectedFormat,
        formats: [selectedFormat],
        objective: 'sales',
        platforms: ['instagram', 'facebook', 'whatsapp'],
        includePlate,
        selectedPlate, // enviamos el plato específico si está seleccionado
        promotionData: promoData ? {
          id: promoData.id,
          name: promoData.name,
          description: promoData.contentDescription || promoData.description || '',
          price: promoData.promoPrice || promoData.price || '',
          imageUrl: promoData.imageUrl || '',
          endDate: promoData.endDate || promoData.validUntil || promoData.expiresAt || null
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

  const handleManualImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setManualFile(file);
      setManualPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleManualGenerate = async () => {
    if (!manualFile) {
      toast.error('Sube una imagen primero');
      return;
    }

    setLoading(true);
    setGeneratedDraft(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(manualFile);
      reader.onload = async () => {
        const base64 = reader.result;
        try {
          const res = await createManualDraft({ imageBase64: base64, promptText: manualPrompt, format: manualFormat });
          setGeneratedDraft(res.draft);
          toast.success('¡Análisis completado! Revisa el copy propuesto.');
        } catch (e) {
          toast.error('Error al generar contenido manual');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Error al leer el archivo');
        setLoading(false);
      };
    } catch (e) {
      console.error(e);
      toast.error('Error en el proceso manual');
      setLoading(false);
    }
  };

  const handleCaptionBlur = async (e) => {
    const newCaption = e.target.value;
    if (newCaption === generatedDraft?.copy?.caption) return;

    try {
      await updateContentDraft(generatedDraft._id, newCaption);
      setGeneratedDraft(prev => ({ ...prev, copy: { ...prev.copy, caption: newCaption } }));
      toast.success('Texto guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar el texto');
    }
  };

  const handleDraftCaptionBlur = async (id, newCaption, oldCaption) => {
    if (newCaption === oldCaption) return;
    try {
      await updateContentDraft(id, newCaption);
      setDrafts(prev => prev.map(d => {
        if (d._id === id) {
          return { ...d, copy: { ...d.copy, caption: newCaption, main: newCaption } };
        }
        return d;
      }));
      toast.success('Texto del borrador guardado');
    } catch (error) {
      toast.error('Error al guardar el texto');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContentDraft(id);
      toast.success('Arte Aprobado');
      setDrafts(prev => prev.map(d => d._id === id ? { ...d, status: 'approved' } : d));
      if (generatedDraft?._id === id) setGeneratedDraft(prev => ({ ...prev, status: 'approved' }));
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
      setDrafts(prev => prev.filter(d => d._id !== deleteDraftId));
      if (generatedDraft?._id === deleteDraftId) setGeneratedDraft(null);
      setDeleteModalOpen(false);
      setDeleteDraftId(null);
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const openPublishModal = (id) => {
    const draft = drafts.find(d => d._id === id) || (generatedDraft?._id === id ? generatedDraft : null);
    const isStory = draft?.formats?.includes('historia');
    
    setPublishDraftId(id);
    setPublishPlatforms({ facebook: !isStory, instagram: true });
    setPublishModalOpen(true);
  };

  const handlePublishNow = async () => {
    const selected = Object.keys(publishPlatforms).filter(k => publishPlatforms[k]);
    if (selected.length === 0) {
      toast.error('Selecciona al menos una plataforma');
      return;
    }

    setPublishModalOpen(false);
    let toastId;
    try {
      toastId = toast.loading('Publicando en Redes...');
      await publishContentDraft(publishDraftId, { platforms: selected });
      toast.success('¡Publicado con éxito en redes!', { id: toastId });
      
      setDrafts(prev => prev.map(d => d._id === publishDraftId ? { ...d, status: 'published' } : d));
      if (generatedDraft?._id === publishDraftId) {
        setGeneratedDraft({ ...generatedDraft, status: 'published' });
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al publicar', { id: toastId });
    }
  };

  const isPromo = publicationType === 'promocion';
  const activePlate = PLATE_ASSETS.find(p => p.id === selectedPlate);

  return (
    <div className="p-6 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-ui-text">Estudio de Contenido</h2>
        <div className="flex gap-2">
          <Button variant={activeTab === 'generador' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('generador'); setGeneratedDraft(null); }}>Generador</Button>
          <Button variant={activeTab === 'manual' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('manual'); setGeneratedDraft(null); }}>📸 Pub. Manual</Button>
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
                <label className="block text-sm font-bold text-ui-text mb-3 tracking-wide">
                  Paso 1 — ¿De qué tratará el arte?
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => { setPublicationType('promocion'); setFreeIdea(''); }}
                    className={`p-3 rounded-xl border-2 transition-all font-bold ${publicationType === 'promocion'
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-ui-border bg-white text-ui-text'
                    }`}
                  >
                    🚀 Promoción
                  </button>
                  <button
                    onClick={() => { setPublicationType('otro'); setSelectedPromo(''); }}
                    className={`p-3 rounded-xl border-2 transition-all font-bold ${publicationType === 'otro'
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-ui-border bg-white text-ui-text'
                    }`}
                  >
                    ✍️ Otro tema
                  </button>
                </div>

                {isPromo ? (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-ui-text mb-2">Selecciona la Promoción</label>
                    <select
                      className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 font-medium outline-none text-ui-text shadow-sm focus:border-brand-blue"
                      value={selectedPromo}
                      onChange={(e) => setSelectedPromo(e.target.value)}
                    >
                      <option value="">(Seleccionar promoción)</option>
                      {promotions.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — Q{p.promoPrice}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-ui-text mb-2">Descripción del tema</label>
                    <textarea
                      className="w-full rounded-2xl border border-ui-border bg-white px-4 py-4 font-medium outline-none shadow-sm focus:border-brand-blue resize-none"
                      rows={3}
                      placeholder="Ej: Hablar de nuestra entrega en frío..."
                      value={freeIdea}
                      onChange={(e) => setFreeIdea(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* PASO 2: Elementos visuales opcionales */}
              <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border/50">
                <label className="block text-sm font-bold text-ui-text mb-3 tracking-wide">
                  Paso 2 — Elementos Opcionales
                </label>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="font-semibold text-ui-text flex items-center gap-2">🍽️ Incluir foto real de plato</span>
                    <span className="text-xs text-ui-muted">Se añade encima del arte generado</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={includePlate}
                      onChange={(e) => setIncludePlate(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {includePlate && (
                  <div className="animate-fade-in mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Aleatorio */}
                      <button
                        onClick={() => setSelectedPlate('aleatorio')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          selectedPlate === 'aleatorio'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        style={{ height: '120px' }}
                      >
                        Aleatorio
                      </button>

                      {/* Platos */}
                      {PLATE_ASSETS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlate(p.id)}
                          className={`flex flex-col items-center rounded-xl border-2 overflow-hidden transition-all bg-white ${
                            selectedPlate === p.id
                              ? 'border-blue-600'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          style={{ height: '120px' }}
                        >
                          <div className="h-[85px] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover scale-[1.3]" />
                          </div>
                          <div className="h-[35px] flex items-center justify-center text-xs font-semibold text-gray-700 w-full bg-white border-t border-gray-100">
                            {p.name.replace(/ \(.*\)/, '')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PASO 3: Formato */}
              <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border/50">
                <label className="block text-sm font-bold text-ui-text mb-3 tracking-wide">
                  Paso 3 — Formato del Arte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'post', label: 'Post', desc: 'Cuadrado 1080x1080', icon: '⬛' },
                    { val: 'historia', label: 'Historia', desc: 'Vertical 1080x1920', icon: '📱' },
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
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Caption Propuesto (Puedes editarlo)</label>
                      <textarea
                        className="w-full bg-white p-3 rounded-xl border border-ui-border text-sm text-gray-800 focus:border-brand-blue outline-none resize-none h-32"
                        defaultValue={generatedDraft.copy.caption}
                        onBlur={handleCaptionBlur}
                      />
                      <p className="text-xs text-gray-400 mt-1">El texto se guardará automáticamente al salir de la caja.</p>
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    {generatedDraft.status === 'draft' ? (
                      <>
                        <Button variant="danger" onClick={() => setGeneratedDraft(null)}>Descartar</Button>
                        <Button variant="primary" onClick={() => handleApprove(generatedDraft._id, true)}>Aprobar Arte</Button>
                      </>
                    ) : (
                      <div className="col-span-2 flex gap-2">
                        <button className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors" onClick={() => openScheduleModal(generatedDraft._id)}>Programar</button>
                        <button className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-brand-blue text-white hover:bg-blue-700 shadow-md transition-colors" onClick={() => openPublishModal(generatedDraft._id)}>🚀 Publicar Ahora</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======== TAB PUBLICACION MANUAL ======== */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in relative max-w-6xl mx-auto">
            {/* Columna Izquierda: Formulario Manual */}
            <div className="flex flex-col gap-6">
              <h3 className="text-2xl font-black mb-2 text-ui-text">Publicación Manual</h3>
              <p className="text-ui-muted text-sm -mt-4 mb-4">Sube tu propia foto. Claude analizará la imagen y te propondrá un caption ideal.</p>

              {/* Subida de Imagen */}
              <div className="bg-white p-6 border-2 border-dashed border-ui-border rounded-[2rem]">
                <label className="block text-sm font-bold text-ui-text mb-4">1. Sube tu imagen</label>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleManualImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20" />
                {manualPreviewUrl && (
                  <div className="mt-4">
                    <img src={manualPreviewUrl} alt="Preview" className="max-h-48 rounded-xl object-contain mx-auto shadow-sm" />
                  </div>
                )}
              </div>

              <div className="bg-white p-6 border border-ui-border rounded-[2rem] shadow-sm">
                <label className="block text-sm font-bold text-ui-text mb-2">2. Formato</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { val: 'post', label: 'Post', icon: '⬛' },
                    { val: 'historia', label: 'Historia', icon: '📱' },
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setManualFormat(f.val)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${manualFormat === f.val
                        ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                        : 'border-ui-border bg-white text-ui-text hover:border-brand-blue/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{f.icon}</div>
                      <div className="font-bold text-sm">{f.label}</div>
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-bold text-ui-text mb-2">3. Instrucciones para la IA (Opcional)</label>
                <textarea
                  placeholder="Ej. Haz énfasis en que es promoción del mes..."
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 font-medium text-gray-700 outline-none focus:border-brand-blue resize-none h-24"
                  value={manualPrompt}
                  onChange={e => setManualPrompt(e.target.value)}
                />
              </div>

              <Button
                size="lg"
                className="w-full text-lg shadow-xl hover:scale-[1.02] transition-transform"
                onClick={handleManualGenerate}
                disabled={loading || !manualFile}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analizando Imagen...
                  </span>
                ) : '✨ Analizar y Generar Copy'}
              </Button>
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="flex flex-col items-center justify-center bg-ui-bg rounded-3xl border border-ui-border/30 p-8 min-h-[500px] relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 gap-4">
                  <div className="w-16 h-16 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                  <p className="font-bold text-lg text-brand-blue animate-pulse text-center px-4">
                    Subiendo imagen y generando texto...
                  </p>
                </div>
              )}

              {!generatedDraft && !loading && (
                <div className="text-center opacity-50">
                  <div className="w-40 h-40 bg-gray-200 rounded-3xl mx-auto mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center text-5xl">📸</div>
                  <p className="font-bold text-lg">Sube una foto para empezar</p>
                </div>
              )}

              {generatedDraft && !loading && (
                <div className="w-full flex flex-col h-full animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">✓ Listo</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteClick(generatedDraft._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold hover:bg-red-200 transition-colors">Descartar</button>
                    </div>
                  </div>

                  {generatedDraft.visual?.imageUrl && (
                    <div
                      className="relative group w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white mb-4 flex items-center justify-center cursor-zoom-in"
                      onClick={() => setLightboxUrl(generatedDraft.visual.imageUrl)}
                    >
                      <img src={generatedDraft.visual.imageUrl} alt="Upload" className="max-w-full max-h-[420px] object-contain" />
                    </div>
                  )}

                  {generatedDraft.copy?.caption && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Caption Propuesto (Puedes editarlo)</label>
                      <textarea
                        className="w-full bg-white p-3 rounded-xl border border-ui-border text-sm text-gray-800 focus:border-brand-blue outline-none resize-none h-32"
                        defaultValue={generatedDraft.copy.caption}
                        onBlur={handleCaptionBlur}
                      />
                      <p className="text-xs text-gray-400 mt-1">El texto se guardará automáticamente al salir de la caja.</p>
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <div className="col-span-2 flex gap-2">
                      <button className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors" onClick={() => openScheduleModal(generatedDraft._id)}>Programar</button>
                      <button className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-brand-blue text-white hover:bg-blue-700 shadow-md transition-colors" onClick={() => openPublishModal(generatedDraft._id)}>🚀 Publicar Ahora</button>
                    </div>
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
                      
                      {draft.status === 'draft' ? (
                        <div className="flex-1 flex flex-col mb-3">
                          <textarea
                            className="w-full flex-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-2 resize-none focus:border-brand-blue outline-none"
                            style={{ minHeight: '100px' }}
                            defaultValue={draft.copy?.caption || draft.copy?.main || ''}
                            onBlur={(e) => handleDraftCaptionBlur(draft._id, e.target.value, draft.copy?.caption || draft.copy?.main)}
                            placeholder="Texto de la publicación..."
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-ui-muted mb-3 line-clamp-3" title={draft.copy?.caption || draft.copy?.main}>
                          {draft.copy?.caption || draft.copy?.main}
                        </p>
                      )}

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

                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        {draft.status === 'draft' && (
                          <Button size="sm" className="w-full py-2" onClick={() => handleApprove(draft._id)}>Aprobar</Button>
                        )}
                        {draft.status === 'approved' && (
                          <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2.5 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors" onClick={() => openScheduleModal(draft._id)}>Programar</button>
                            <button className="flex-1 py-2.5 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-brand-blue text-white hover:bg-blue-700 shadow-sm transition-colors" onClick={() => openPublishModal(draft._id)}>Publicar</button>
                          </div>
                        )}
                        {draft.status === 'published' && (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="w-full text-center py-1.5 text-green-600 font-bold bg-green-50 rounded-xl text-xs mb-1">
                              ✓ Publicado en Redes
                            </div>
                            <div className="flex gap-2 w-full">
                              <button className="flex-1 py-2 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors" onClick={() => openScheduleModal(draft._id)}>Programar</button>
                              <button className="flex-1 py-2 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white shadow-sm transition-colors" onClick={() => openPublishModal(draft._id)}>Re-Publicar</button>
                            </div>
                          </div>
                        )}
                        {draft.status === 'scheduled' && (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="w-full text-center py-1.5 text-orange-600 font-bold bg-orange-50 rounded-xl text-xs mb-1">
                              🕒 Programado
                            </div>
                            <div className="flex gap-2 w-full">
                              <button className="flex-1 py-2 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors" onClick={() => openScheduleModal(draft._id)}>Re-Programar</button>
                              <button className="flex-1 py-2 rounded-full font-bold text-[10px] sm:text-xs tracking-wider uppercase border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white shadow-sm transition-colors" onClick={() => openPublishModal(draft._id)}>Publicar</button>
                            </div>
                          </div>
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

      {/* ======== MODAL PUBLICAR ======== */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-text/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative text-center">
            <button onClick={() => setPublishModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors font-bold text-xl">×</button>
            <h3 className="text-2xl font-black mb-2">Publicar en Redes</h3>
            <p className="text-sm text-ui-muted mb-6">Selecciona en dónde deseas publicar este arte.</p>
            
            <div className="flex flex-col gap-4 mb-8 text-left">
              {(() => {
                const draft = drafts.find(d => d._id === publishDraftId) || (generatedDraft?._id === publishDraftId ? generatedDraft : null);
                const isStory = draft?.formats?.includes('historia');
                return (
                  <>
                    {!isStory && (
                      <label className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" className="w-5 h-5 accent-brand-blue" checked={publishPlatforms.facebook} onChange={e => setPublishPlatforms(p => ({ ...p, facebook: e.target.checked }))} />
                        <span className="font-bold text-gray-700 flex-1">Facebook Page</span>
                        <span className="text-2xl">📘</span>
                      </label>
                    )}
                    <label className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 accent-brand-blue" checked={publishPlatforms.instagram} onChange={e => setPublishPlatforms(p => ({ ...p, instagram: e.target.checked }))} />
                      <span className="font-bold text-gray-700 flex-1">Instagram</span>
                      <span className="text-2xl">📸</span>
                    </label>
                  </>
                );
              })()}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => setPublishModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" className="w-full bg-brand-blue hover:bg-blue-700 shadow-md border-none" onClick={handlePublishNow}>Confirmar</Button>
            </div>
            <div className="mt-3">
              <Button 
                variant="secondary" 
                className="w-full border-none shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: '#25D366', color: 'white' }}
                onClick={() => {
                  setPublishModalOpen(false);
                  if (onSendWhatsAppCampaign) {
                    const draft = drafts.find(d => d._id === publishDraftId) || (generatedDraft?._id === publishDraftId ? generatedDraft : null);
                    onSendWhatsAppCampaign(draft);
                  }
                }}
              >
                <span>💬</span> Enviar por WhatsApp
              </Button>
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
