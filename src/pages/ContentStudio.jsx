import React, { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState('generador');
  const [topic, setTopic] = useState('');

  const handleGenerate = async () => {
    toast.success('Generación simulada (En desarrollo)');
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

      <div className="bg-ui-card rounded-2xl border border-ui-border p-6 shadow-sm">
        {activeTab === 'generador' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Generar Contenido</h3>
            <textarea 
              className="w-full rounded-2xl border border-ui-border bg-ui-bg px-4 py-3 font-medium outline-none mb-4"
              rows={4}
              placeholder="Ej: Genera un post sobre nuestra nueva promoción de verano..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button onClick={handleGenerate}>Generar con IA</Button>
          </div>
        )}
        {activeTab === 'borradores' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Tus Borradores</h3>
            <p className="text-ui-muted font-medium">Aún no hay borradores.</p>
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
