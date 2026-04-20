import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAuthSession } from '../shared/hooks/useAuthSession.jsx';
import { getPendingStaff, saveInventoryItem, updateStaffStatus, getInventory } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const emptyItem = { name: '', unit: '', stock: 0, minimumStock: 0 };

const AdminPage = () => {
  const { session, loading, error, loginWithGoogle, logout } = useAuthSession('ADMIN');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItem);

  const loadData = async () => {
    try {
      const [pendingResponse, inventoryResponse] = await Promise.all([getPendingStaff(), getInventory()]);
      setPendingUsers(pendingResponse.data);
      setInventory(inventoryResponse.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cargar la información del panel.');
    }
  };

  useEffect(() => {
    if (session?.role === 'ADMIN' && session?.status === 'approved') {
      loadData();
    }
  }, [session]);

  const changeStatus = async (userId, status, role) => {
    try {
      await updateStaffStatus(userId, { status, role });
      toast.success('Usuario actualizado');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el usuario.');
    }
  };

  const submitInventory = async (e) => {
    e.preventDefault();
    try {
      await saveInventoryItem({ ...itemForm, stock: Number(itemForm.stock), minimumStock: Number(itemForm.minimumStock) });
      toast.success('Inventario guardado');
      setItemForm(emptyItem);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar inventario.');
    }
  };

  if (!session) {
    return (
      <PanelShell title="Panel Admin" subtitle="Aprobación de staff e inventario" actions={<Button onClick={loginWithGoogle}>{loading ? 'Cargando...' : 'Entrar con Google'}</Button>}>
        <p className="text-gray-500">Accede con la cuenta Google autorizada como ADMIN.</p>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </PanelShell>
    );
  }

  return (
    <PanelShell
      title="Panel Admin"
      subtitle="Aprobación de usuarios staff y control de inventario."
      actions={<><StatusBadge value={session.status} /><Button variant="secondary" onClick={logout}>Salir</Button></>}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Solicitudes pendientes</h2>
          <div className="space-y-4">
            {pendingUsers.length === 0 && <p className="text-sm text-gray-500">No hay usuarios pendientes.</p>}
            {pendingUsers.map((user) => (
              <div key={user._id} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{user.name || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-500">{user.email || user.phone || 'Sin contacto'}</p>
                  </div>
                  <StatusBadge value={user.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => changeStatus(user._id, 'approved', user.role)}>Aprobar</Button>
                  <Button variant="secondary" onClick={() => changeStatus(user._id, 'rejected', user.role)}>Rechazar</Button>
                  <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'CHEF')}>Aprobar como CHEF</Button>
                  <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'REPARTIDOR')}>Aprobar como REPARTIDOR</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Inventario</h2>
          <form onSubmit={submitInventory} className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
            <input className="col-span-2 p-3 rounded-xl border border-gray-200" placeholder="Nombre del insumo" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200" placeholder="Unidad" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200" placeholder="Stock" type="number" value={itemForm.stock} onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })} />
            <input className="col-span-2 p-3 rounded-xl border border-gray-200" placeholder="Stock mínimo" type="number" value={itemForm.minimumStock} onChange={(e) => setItemForm({ ...itemForm, minimumStock: e.target.value })} />
            <div className="col-span-2"><Button type="submit">Guardar insumo</Button></div>
          </form>

          <div className="space-y-3">
            {inventory.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                <div>
                  <p className="font-bold capitalize">{item.name}</p>
                  <p className="text-sm text-gray-500">Unidad: {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-blue">{item.stock}</p>
                  <p className="text-xs text-gray-400">mínimo {item.minimumStock}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PanelShell>
  );
};

export default AdminPage;
