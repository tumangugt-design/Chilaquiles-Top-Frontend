import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAuthSession } from '../shared/hooks/useAuthSession.jsx';
import { getOrders, updateOrderStatus } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const RepartidorPage = () => {
  const { session, loading, error, loginWithGoogle, logout } = useAuthSession('REPARTIDOR');
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudieron cargar pedidos.');
    }
  };

  useEffect(() => {
    if (session?.role === 'REPARTIDOR' && session?.status === 'approved') {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const advance = async (order) => {
    const nextStatus = order.status === 'listo_para_despacho' ? 'en_camino' : 'entregado';
    try {
      await updateOrderStatus(order._id, nextStatus);
      toast.success(nextStatus === 'en_camino' ? '¡Ruta Iniciada!' : '¡Pedido Entregado!');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  if (!session) {
    return (
      <PanelShell title="Logística de Entrega" subtitle="Gestión de Rutas y Despacho" actions={<Button onClick={loginWithGoogle}>{loading ? 'Cargando...' : 'Acceder como Repartidor'}</Button>}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso a Reparto</h3>
          <p className="text-ui-muted max-w-sm">Inicia sesión para gestionar tus rutas y confirmar las entregas a nuestros clientes.</p>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Panel de Reparto" subtitle="Optimiza tu tiempo: Gestiona tus entregas pendientes." actions={<div className="flex items-center space-x-4"><StatusBadge value={session.status} /><Button variant="secondary" onClick={logout}>Salir</Button></div>}>
      <div className="grid md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order._id} className="glass-card rounded-[2.5rem] p-6 animate-fade-in border-l-8 border-l-brand-blue overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-black text-ui-muted uppercase tracking-widest mb-1">Destino Final</p>
                <p className="font-black text-2xl text-ui-text leading-tight">{order.name}</p>
                <a href={`tel:${order.phone}`} className="text-sm font-bold text-brand-blue hover:underline">{order.phone}</a>
              </div>
              <StatusBadge value={order.status} />
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-ui-bg/50 rounded-2xl border border-ui-border">
                <p className="text-[10px] font-black text-ui-muted uppercase mb-1">Dirección de Entrega</p>
                <p className="text-sm font-bold text-ui-text leading-relaxed">{order.address}</p>
              </div>

              {/* Botones de Navegación PRO */}
              <div className="grid grid-cols-2 gap-3">
                {order.navigationLinks?.googleMaps && (
                  <a 
                    href={order.navigationLinks.googleMaps} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-black text-xs hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>Google Maps</span>
                  </a>
                )}
                {order.navigationLinks?.waze && (
                  <a 
                    href={order.navigationLinks.waze} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#33ccff] text-white font-black text-xs hover:opacity-90 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.4 12.2c-.3-.3-.7-.3-1 0s-.3.7 0 1c.3.3.7.3 1 0s.3-.7 0-1zm-4.4.4c-.3-.3-.7-.3-1 0s-.3.7 0 1c.3.3.7.3 1 0s.3-.7 0-1zm5.2 6.1c-.2-.6-.8-1.1-1.4-1.1h-8.4c-.7 0-1.2.4-1.4 1.1-.1.3 0 .6.3.8.1.1.2.1.3.1.2 0 .4-.1.5-.2.1-.1.2-.2.4-.2h8.4c.2 0 .3.1.4.2.1.1.3.2.5.2.1 0 .2 0 .3-.1.3-.2.4-.5.3-.8zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>
                    <span>Waze</span>
                  </a>
                )}
              </div>
            </div>

            {['listo_para_despacho', 'en_camino'].includes(order.status) && (
              <Button 
                onClick={() => advance(order)}
                className={`w-full !py-5 text-lg shadow-xl ${order.status === 'en_camino' ? '!bg-green-600 shadow-green-500/20' : 'shadow-brand-blue/20'}`}
              >
                {order.status === 'listo_para_despacho' ? 'Iniciar Entrega' : 'Confirmar Entrega'}
              </Button>
            )}
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed">
            <p className="text-ui-muted font-bold italic">No hay entregas asignadas. ¡Buen momento para descansar!</p>
          </div>
        )}
      </div>
    </PanelShell>
  );
};

export default RepartidorPage;
