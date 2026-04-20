import { useEffect, useState } from 'react';
import PanelShell from '../components/ui/PanelShell.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { getPendingStaff, saveInventoryItem, updateStaffStatus, getInventory, deleteInventoryItem, adjustInventoryStock } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const emptyItem = { name: '', unit: '', stock: 0, minimumStock: 0 };

const AdminPage = ({ authSession }) => {
  const { session, loading, error, loginWithGoogle, logout } = authSession;
  const [pendingUsers, setPendingUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [pendingResponse, inventoryResponse] = await Promise.all([getPendingStaff(), getInventory()]);
      setPendingUsers(pendingResponse.data);
      setInventory(inventoryResponse.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cargar la información del panel.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.role === 'ADMIN' && session?.status === 'approved') {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
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
    if (!itemForm.name || !itemForm.unit) return toast.error('Nombre y unidad son obligatorios');
    setIsSaving(true);
    try {
      await saveInventoryItem({ ...itemForm, stock: Number(itemForm.stock), minimumStock: Number(itemForm.minimumStock) });
      toast.success('Inventario guardado');
      setItemForm(emptyItem);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar inventario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (name) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${name}" del inventario?`)) return;
    try {
      await deleteInventoryItem(name);
      toast.success('Item eliminado');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const handleAdjustStock = async (name, amount) => {
    try {
      await adjustInventoryStock(name, amount);
      loadData();
    } catch (err) {
      toast.error('Error al ajustar stock');
    }
  };

  if (!session || session.role !== 'ADMIN') {
    return (
      <PanelShell title="Panel de Administración" subtitle="Workspace Seguro • Gestión de Personal e Insumos">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2">Acceso Administrativo</h3>
          <p className="text-ui-muted max-w-sm mb-8">Inicia sesión con una cuenta corporativa autorizada para gestionar la operación.</p>
          
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
      title="Dashboard Administrativo"
      subtitle="Gestiona el corazón de la operación: Staff e Inventario"
      actions={
        <div className="flex items-center space-x-4">
          <StatusBadge value={session.status} />
          <Button variant="secondary" onClick={logout}>Salir</Button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Izquierdo: Staff Management */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Solicitudes de Staff</h2>
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-black">{pendingUsers.length} PENDIENTES</span>
          </div>

          <div className="space-y-4">
            {pendingUsers.length === 0 && (
              <div className="text-center py-12 bg-ui-bg/50 rounded-[2rem] border border-dashed border-ui-border">
                <p className="text-ui-muted text-sm font-medium">No hay solicitudes nuevas en este momento.</p>
              </div>
            )}
            {pendingUsers.map((user) => (
              <div key={user._id} className="glass-card rounded-[2rem] p-6 animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-black text-lg text-ui-text leading-tight">{user.name || 'Usuario Nuevo'}</p>
                    <p className="text-xs font-bold text-ui-muted uppercase tracking-widest mt-1">{user.email || user.phone}</p>
                  </div>
                  <StatusBadge value={user.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button className="col-span-2" onClick={() => changeStatus(user._id, 'approved', user.role)}>Aprobar como {user.role}</Button>
                  <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'CHEF')}>CHEF</Button>
                  <Button variant="secondary" onClick={() => changeStatus(user._id, 'approved', 'REPARTIDOR')}>REPARTIDOR</Button>
                  <Button variant="secondary" className="col-span-2 !bg-red-500/10 !text-brand-red !border-red-500/20" onClick={() => changeStatus(user._id, 'rejected', user.role)}>Denegar Acceso</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lado Derecho: Inventory Control */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-ui-text">Control de Inventario</h2>
            <div className="flex space-x-2">
               <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-black uppercase">Stock Realtime</span>
            </div>
          </div>

          {/* Formulario Estético */}
          <form onSubmit={submitInventory} className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Nombre del Insumo / Ingrediente</label>
                <input 
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
                  placeholder="Ej: Salsa Roja, Totopos..." 
                  value={itemForm.name} 
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Unidad (kg, lt, oz...)</label>
                <input 
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
                  placeholder="kg" 
                  value={itemForm.unit} 
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Stock Inicial</label>
                <input 
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold" 
                  type="number" 
                  value={itemForm.stock} 
                  onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })} 
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-ui-muted ml-4 tracking-widest">Alerta de Stock Mínimo (Límite crítico)</label>
                <input 
                  className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg focus:ring-2 focus:ring-brand-blue outline-none transition-all font-bold text-brand-red" 
                  type="number" 
                  value={itemForm.minimumStock} 
                  onChange={(e) => setItemForm({ ...itemForm, minimumStock: e.target.value })} 
                />
              </div>
            </div>
            <Button type="submit" className="w-full !py-5 text-lg" disabled={isSaving}>
              {isSaving ? 'Registrando...' : 'Actualizar Inventario'}
            </Button>
          </form>

          {/* Listado de Inventario */}
          <div className="grid sm:grid-cols-2 gap-4">
            {inventory.map((item) => (
              <div key={item._id} className="glass-card rounded-[2rem] p-5 border-l-4 border-l-brand-blue hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-ui-text capitalize leading-none mb-1">{item.name}</h3>
                    <p className="text-[10px] font-bold text-ui-muted uppercase tracking-widest">Medida: {item.unit}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem(item.name)}
                    className="p-2 text-ui-muted hover:text-brand-red transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                
                <div className="flex items-center justify-between bg-ui-bg rounded-2xl p-4 border border-ui-border">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleAdjustStock(item.name, -1)}
                      className="w-8 h-8 rounded-full border border-ui-border flex items-center justify-center hover:bg-brand-red/10 hover:text-brand-red transition-all font-black"
                    >
                      -
                    </button>
                    <div className="text-center min-w-[3rem]">
                      <span className={`text-xl font-black ${item.stock <= item.minimumStock ? 'text-brand-red animate-pulse' : 'text-brand-blue'}`}>
                        {Number(item.stock).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAdjustStock(item.name, 1)}
                      className="w-8 h-8 rounded-full border border-ui-border flex items-center justify-center hover:bg-green-500/10 hover:text-green-600 transition-all font-black"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-ui-muted uppercase">Límite</p>
                    <p className="text-xs font-bold text-brand-red leading-none">{item.minimumStock}</p>
                  </div>
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
