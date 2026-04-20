import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAuthSession } from '../shared/hooks/useAuthSession.jsx';
import { getOrders, updateOrderStatus } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const ChefPage = () => {
  const { session, loading, error, loginWithGoogle, logout } = useAuthSession('CHEF');
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
    if (session?.role === 'CHEF' && session?.status === 'approved') {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const advance = async (order) => {
    const nextStatus = order.status === 'recibido' ? 'en_proceso' : 'listo_para_despacho';
    try {
      await updateOrderStatus(order._id, nextStatus);
      toast.success('Estado actualizado');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  if (!session) {
    return (
      <PanelShell title="Panel Chef" subtitle="Pedidos en tiempo real para cocina" actions={<Button onClick={loginWithGoogle}>{loading ? 'Cargando...' : 'Entrar con Google'}</Button>}>
        <p className="text-gray-500">Inicia sesión con Google para registrar o validar tu acceso como CHEF.</p>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Panel Chef" subtitle="Flujo: recibido → en_proceso → listo_para_despacho" actions={<><StatusBadge value={session.status} /><Button variant="secondary" onClick={logout}>Salir</Button></>}>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-gray-900">{order.name}</p>
                <p className="text-sm text-gray-500">{order.phone}</p>
              </div>
              <StatusBadge value={order.status} />
            </div>
            <p className="text-sm text-gray-600 mb-3">{order.address}</p>
            <p className="text-sm text-gray-500 mb-4">{order.items.length} orden(es) • Total Q{order.total}</p>
            {['recibido', 'en_proceso'].includes(order.status) && <Button onClick={() => advance(order)}>Avanzar estado</Button>}
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500">No hay pedidos para cocina.</p>}
      </div>
    </PanelShell>
  );
};

export default ChefPage;
