import React from 'react'
import { 
  Users, 
  UserCircle, 
  ChefHat, 
  Truck, 
  PackagePlus, 
  Box, 
  ClipboardList, 
  PlusCircle, 
  LogOut,
  Bell,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react'

const navigation = {
  management: [
    { id: 'staff', label: 'Accesos', icon: Users },
    { id: 'clients', label: 'Clientes', icon: UserCircle },
    { id: 'chefs', label: 'Cocineros', icon: ChefHat },
    { id: 'drivers', label: 'Repartidores', icon: Truck },
  ],
  inventory: [
    { id: 'entries', label: 'Entradas', icon: PackagePlus },
    { id: 'inventory', label: 'Stock', icon: Box },
  ],
  sales: [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'internal_order', label: 'Nuevo Pedido', icon: PlusCircle },
  ]
}

const AdminSidebar = ({ activeTab, setActiveTab, session, logout }) => {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-ui-border flex flex-col z-[60] shadow-xl">
      {/* Logo Section */}
      <div className="p-8 border-b border-ui-border bg-ui-bg/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-xl shadow-brand-blue/20">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <div>
            <h1 className="font-black text-xl text-ui-text leading-none uppercase tracking-tighter italic">
              Chila<span className="text-brand-blue">Quiles</span>
            </h1>
            <p className="text-[10px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-1">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-hide">
        {/* Sales Group */}
        <div>
          <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest px-4 mb-4">Ventas y Pedidos</p>
          <div className="space-y-1">
            {navigation.sales.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === id 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
                }`}
              >
                <Icon size={20} className={activeTab === id ? 'text-white' : 'group-hover:text-brand-blue'} />
                <span className="text-[13px] font-black uppercase tracking-wider flex-1 text-left">{label}</span>
                {activeTab === id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Management Group */}
        <div>
          <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest px-4 mb-4">Gestión de Usuarios</p>
          <div className="space-y-1">
            {navigation.management.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === id 
                    ? 'bg-ui-bg text-brand-blue border border-brand-blue/20 shadow-sm' 
                    : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
                }`}
              >
                <Icon size={20} className={activeTab === id ? 'text-brand-blue' : 'group-hover:text-brand-blue'} />
                <span className="text-[13px] font-black uppercase tracking-wider flex-1 text-left">{label}</span>
                {activeTab === id && <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Group */}
        <div>
          <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest px-4 mb-4">Inventario</p>
          <div className="space-y-1">
            {navigation.inventory.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === id 
                    ? 'bg-ui-bg text-brand-blue border border-brand-blue/20 shadow-sm' 
                    : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
                }`}
              >
                <Icon size={20} className={activeTab === id ? 'text-brand-blue' : 'group-hover:text-brand-blue'} />
                <span className="text-[13px] font-black uppercase tracking-wider flex-1 text-left">{label}</span>
                {activeTab === id && <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-6 border-t border-ui-border bg-ui-bg/30">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-ui-border flex items-center justify-center overflow-hidden shadow-sm">
            <UserCircle className="text-ui-muted" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-ui-text uppercase leading-none truncate">{session?.name || 'Admin'}</p>
            <p className="text-[8px] font-bold text-green-600 uppercase mt-1 tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
          <button className="text-ui-muted hover:text-brand-blue transition-colors">
            <Bell size={18} />
          </button>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-brand-red font-black text-[11px] uppercase tracking-wider hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
