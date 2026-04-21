import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getOrders, updateOrderStatus } from '../shared/config/api.js';
import { playNotificationSound } from '../shared/utils/notifications.js';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const RepartidorPage = ({ authSession }) => {
  const { session, loading, error, loginWithGoogle, logout } = authSession;
  const [ordersCache, setOrdersCache] = useState({ active: [], delivered: [] });
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'delivered'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const knownOrderIds = useRef(new Set());

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const response = await getOrders(activeTab === 'delivered' ? 'delivered' : null);
      const orders = response.data;

      // Sound notification logic
      if (activeTab === 'active') {
        let hasNewOrder = false;
        orders.forEach(o => {
          if (!knownOrderIds.current.has(o._id)) {
            if (knownOrderIds.current.size > 0) hasNewOrder = true;
            knownOrderIds.current.add(o._id);
          }
        });
        if (hasNewOrder) playNotificationSound();
      }

      setOrdersCache(prev => ({ ...prev, [activeTab]: orders }));
    } catch (err) {
      toast.error('Error al cargar entregas');
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentOrders = ordersCache[activeTab] || [];

  useEffect(() => {
    if (session?.role === 'REPARTIDOR' && session?.status === 'approved') {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [session, activeTab]);

  const advance = async (order) => {
    let nextStatus = '';
    if (order.status === 'listo_para_despacho') nextStatus = 'recolectado';
    else if (order.status === 'recolectado') nextStatus = 'en_camino';
    else if (order.status === 'en_camino') nextStatus = 'entregado';

    if (!nextStatus) return;

    try {
      await updateOrderStatus(order._id, nextStatus);
      const messages = {
        recolectado: '¡Pedido Recolectado!',
        en_camino: '¡Ruta Iniciada!',
        entregado: '¡Pedido Entregado!'
      };
      toast.success(messages[nextStatus]);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  if (session && session.status === 'pending') {
    return (
      <PanelShell title="Registro de Reparto" subtitle="Validando credenciales de logística">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-ui-text mb-4">Esperando Aprobación</h3>
          <p className="text-ui-muted max-w-sm mb-10 leading-relaxed font-medium">
            ¡Ya casi estás listo para repartir! El administrador debe aprobar tu cuenta antes de que puedas ver las rutas.
          </p>
          <Button variant="secondary" onClick={logout} className="!px-10">Cerrar Sesión</Button>
        </div>
      </PanelShell>
    );
  }

  if (!session || session.role !== 'REPARTIDOR') {
    return (
      <PanelShell title="Logística de Entrega" subtitle="Gestión de Rutas y Despacho">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso a Reparto</h3>
          <p className="text-ui-muted max-w-sm mb-8">Inicia sesión para gestionar tus rutas y confirmar las entregas a nuestros clientes.</p>
          
          <Button 
            onClick={loginWithGoogle} 
            className="flex items-center space-x-3 !py-4 !px-8 shadow-xl shadow-brand-blue/20"
            disabled={loading}
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-black">Entrar con Google</span>
              </>
            )}
          </Button>

          {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-brand-red text-sm font-bold">{error}</div>}
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell
      title="Logística de Entrega"
      subtitle="Gestión de Rutas y Despacho"
      actions={
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full bg-brand-orange ${isRefreshing ? 'animate-ping' : ''}`} />
          <StatusBadge value={session.status} />
          <Button variant="secondary" onClick={logout}>Salir</Button>
        </div>
      }
    >
      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-8 p-1 bg-ui-bg/50 rounded-2xl border border-ui-border w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-brand-blue text-white shadow-lg' : 'text-ui-muted hover:text-ui-text'}`}
        >
          En Ruta
        </button>
        <button 
          onClick={() => setActiveTab('delivered')}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'delivered' ? 'bg-brand-blue text-white shadow-lg' : 'text-ui-muted hover:text-ui-text'}`}
        >
          Entregadas
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
        {currentOrders.map((order) => (
          <div key={order._id} className={`glass-card rounded-[2.5rem] p-8 border-t-8 transition-all ${order.repartidorId ? 'border-brand-orange' : 'border-ui-border opacity-70'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Guía #{order._id.slice(-4)}</p>
                <h3 className="text-xl font-black text-ui-text">{order.name}</h3>
                {order.repartidorId && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-brand-orange/10 flex items-center justify-center overflow-hidden">
                       {order.repartidorId.photoUrl ? (
                         <img src={order.repartidorId.photoUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[8px] font-bold text-brand-orange">{order.repartidorId.name?.charAt(0)}</span>
                       )}
                    </div>
                    <span className="text-[10px] font-black text-brand-orange uppercase">Asignado a {order.repartidorId.name}</span>
                  </div>
                )}
              </div>
              <StatusBadge value={order.status} />
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-ui-bg/50 rounded-2xl border border-ui-border">
                <p className="text-[10px] font-black text-ui-muted uppercase mb-1">Dirección de Entrega</p>
                <p className="text-sm font-bold text-ui-text leading-relaxed">{order.address}</p>
              </div>

              <div className="p-4 bg-ui-bg/50 rounded-2xl border border-ui-border">
                <p className="text-[10px] font-black text-ui-muted uppercase mb-2">Resumen de Platos ({order.items.length})</p>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col bg-ui-bg p-3 rounded-2xl border border-ui-border space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black text-brand-orange uppercase">Plato {idx + 1}</p>
                        <span className="text-[10px] font-black text-brand-orange">x1</span>
                      </div>
                      <p className="text-xs font-black text-ui-text uppercase">
                        {item.sauce} + {item.protein} + {item.complement}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                         <span className="text-[8px] font-bold text-ui-muted bg-ui-card px-1.5 py-0.5 rounded border border-ui-border">
                            Base: {item.baseRecipe?.onion ? 'Cebolla' : ''} {item.baseRecipe?.cilantro ? 'Cilantro' : ''} {item.baseRecipe?.cream ? 'Crema' : ''}
                         </span>
                         {!item.baseRecipe?.onion && <span className="text-[8px] font-black text-red-500 uppercase">SIN CEBOLLA</span>}
                         {!item.baseRecipe?.cilantro && <span className="text-[8px] font-black text-red-500 uppercase">SIN CILANTRO</span>}
                         {!item.baseRecipe?.cream && <span className="text-[8px] font-black text-red-500 uppercase">SIN CREMA</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logística: Botón Waze Exclusivo */}
              {order.navigationLinks?.waze && (
                <a 
                  href={order.navigationLinks.waze} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] bg-[#33ccff] text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-[#33ccff]/20 mb-4"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.4 12.2c-.3-.3-.7-.3-1 0s-.3.7 0 1c.3.3.7.3 1 0s.3-.7 0-1zm-4.4.4c-.3-.3-.7-.3-1 0s-.3.7 0 1c.3.3.7.3 1 0s.3-.7 0-1zm5.2 6.1c-.2-.6-.8-1.1-1.4-1.1h-8.4c-.7 0-1.2.4-1.4 1.1-.1.3 0 .6.3.8.1.1.2.1.3.1.2 0 .4-.1.5-.2.1-.1.2-.2.4-.2h8.4c.2 0 .3.1.4.2.1.1.3.2.5.2.1 0 .2 0 .3-.1.3-.2.4-.5.3-.8zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>
                  <span>ABRIR LOCALIZACIÓN (WAZE)</span>
                </a>
              )}
            </div>

            {['listo_para_despacho', 'recolectado', 'en_camino'].includes(order.status) && (
              <Button 
                onClick={() => (!order.repartidorId || order.repartidorId._id === session._id) && advance(order)}
                disabled={order.repartidorId && order.repartidorId._id !== session.id}
                className={`w-full !py-5 text-lg shadow-xl ${(!order.repartidorId || order.repartidorId._id === session.id) ? (order.status === 'en_camino' ? '!bg-green-600 shadow-green-500/20' : 'shadow-brand-blue/20') : 'bg-ui-muted opacity-50 shadow-none cursor-not-allowed'}`}
              >
                {!order.repartidorId ? 'Recolectar Pedido' : order.repartidorId._id !== session.id ? `En Ruta (${order.repartidorId.name})` : order.status === 'listo_para_despacho' ? 'Recolectar Pedido' : order.status === 'recolectado' ? 'Iniciar Ruta' : 'Confirmar Entrega'}
              </Button>
            )}
          </div>
        ))}
        
        {currentOrders.length === 0 && !isRefreshing && (
          <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed">
            <p className="text-ui-muted font-bold italic">No hay entregas en este estado. ¡Buen momento para descansar!</p>
          </div>
        )}
      </div>
    </PanelShell>
  );
};

export default RepartidorPage;
