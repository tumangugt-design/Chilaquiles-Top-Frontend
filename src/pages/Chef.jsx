import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getOrders, updateOrderStatus } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const ChefPage = ({ authSession }) => {
  const { session, loading, error, loginWithGoogle, logout } = authSession;
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'finished'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const response = await getOrders(activeTab === 'finished' ? 'finished' : null);
      setOrders(response.data);
    } catch (err) {
      toast.error('Error al cargar pedidos');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.role === 'CHEF' && session?.status === 'approved') {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [session, activeTab]);

  const advance = async (order) => {
    // If order has no chef assigned, the backend will assign it automatically on status update
    const nextStatus = order.status === 'recibido' ? 'en_proceso' : 'listo_para_despacho';
    try {
      await updateOrderStatus(order._id, nextStatus);
      toast.success(order.status === 'recibido' ? '¡Orden Tomada!' : '¡Orden Lista!');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  if (session && session.status === 'pending') {
    return (
      <PanelShell title="Acceso en Espera" subtitle="Estamos validando tu perfil">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-ui-text mb-4">Solicitud Recibida</h3>
          <p className="text-ui-muted max-w-sm mb-10 leading-relaxed font-medium">
            Tu cuenta está en proceso de revisión por el equipo administrativo. 
            Te notificaremos una vez que seas aprobado para entrar a cocina.
          </p>
          <Button variant="secondary" onClick={logout} className="!px-10">Cerrar Sesión</Button>
        </div>
      </PanelShell>
    );
  }

  if (!session || session.role !== 'CHEF') {
    return (
      <PanelShell title="Centro de Producción" subtitle="Gestión de Pedidos en Tiempo Real">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso a Cocina</h3>
          <p className="text-ui-muted max-w-sm mb-8">Valida tus credenciales para visualizar las órdenes entrantes y gestionar la producción.</p>
          
          <Button 
            onClick={loginWithGoogle} 
            className="flex items-center space-x-3 !py-4 !px-8 shadow-xl shadow-brand-orange/20 !bg-brand-orange"
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
      title="Centro de Producción"
      subtitle="Gestión de Pedidos en Tiempo Real"
      actions={
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full bg-brand-blue ${isRefreshing ? 'animate-ping' : ''}`} />
          <StatusBadge value={session.status} />
          <Button variant="secondary" onClick={logout}>Salir</Button>
        </div>
      }
    >
      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-8 p-1 bg-ui-bg/50 rounded-2xl border border-ui-border w-fit mx-auto">
        <button 
          onClick={() => {
            setOrders([]);
            setActiveTab('active');
          }}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-brand-blue text-white shadow-lg' : 'text-ui-muted hover:text-ui-text'}`}
        >
          En Cocina
        </button>
        <button 
          onClick={() => {
            setOrders([]);
            setActiveTab('finished');
          }}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'finished' ? 'bg-brand-blue text-white shadow-lg' : 'text-ui-muted hover:text-ui-text'}`}
        >
          Terminadas
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
        {orders.map((order) => (
          <div key={order._id} className={`glass-card rounded-[2.5rem] p-8 border-t-8 transition-all ${order.chefId ? 'border-brand-blue' : 'border-ui-border opacity-70'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Orden #{order._id.slice(-4)}</p>
                <h3 className="text-xl font-black text-ui-text">{order.name}</h3>
              </div>
              <StatusBadge value={order.status} />
            </div>

            <div className="space-y-4 mb-8">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-ui-bg rounded-2xl border border-ui-border">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black text-xs">
                    {item.quantity}
                  </div>
                  <span className="font-bold text-sm text-ui-text">{item.name}</span>
                </div>
              ))}
            </div>

            {activeTab === 'active' && (
              <Button 
                className={`w-full !py-4 font-black shadow-lg ${order.chefId ? 'shadow-brand-blue/20' : 'bg-ui-muted shadow-none'}`}
                onClick={() => advance(order)}
              >
                {!order.chefId ? 'Tomar Pedido' : order.status === 'RECIBIDO' ? 'Empezar Preparación' : 'Marcar como Listo'}
              </Button>
            )}
            
            {order.status === 'listo_para_despacho' && (
              <div className="text-center py-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                <span className="text-xs font-black text-green-600 uppercase">Esperando Repartidor</span>
              </div>
            )}
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed">
            <p className="text-ui-muted font-bold">¡Buen trabajo! No hay pedidos pendientes en cocina.</p>
          </div>
        )}
      </div>
    </PanelShell>
  );
};

export default ChefPage;
