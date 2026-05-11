import React from 'react'
import Logo from '../Logo.jsx'
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
  Settings,
  ChevronDown
} from 'lucide-react'

const navigation = {
  sales: [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'internal_order', label: 'Nuevo Pedido', icon: PlusCircle },
  ],
  management: [
    { id: 'staff', label: 'Personal', icon: Users },
    { id: 'clients', label: 'Clientes', icon: UserCircle },
  ],
  inventory: [
    { id: 'entries', label: 'Entradas', icon: PackagePlus },
    { id: 'inventory', label: 'Stock', icon: Box },
  ]
}

const AdminNavbar = ({ activeTab, setActiveTab, session, logout, onProfileClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-ui-border z-[70] shadow-sm flex items-center px-6 lg:px-10 justify-between">
      {/* Logo Section */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <div className="hidden sm:block">
          <Logo className="w-28 h-10 drop-shadow-sm" />
          <p className="text-[9px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-0.5">Admin</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 flex items-center justify-center px-8 gap-1 max-w-4xl overflow-x-auto no-scrollbar">
        {/* Sales */}
        <div className="flex items-center gap-1 border-r border-ui-border pr-4 mr-4">
          {navigation.sales.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider whitespace-nowrap ${
                activeTab === id 
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                  : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Management & Inventory */}
        <div className="flex items-center gap-1">
          {[...navigation.management, ...navigation.inventory].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider whitespace-nowrap ${
                activeTab === id 
                  ? 'bg-ui-bg text-brand-blue border border-brand-blue/20' 
                  : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
              }`}
            >
              <Icon size={16} />
              <span className="hidden md:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-ui-border">
          <div className="text-right">
            <p className="text-[10px] font-black text-ui-text uppercase leading-none">{session?.name || 'Admin'}</p>
            <p className="text-[8px] font-bold text-green-600 uppercase mt-1 flex items-center justify-end gap-1">
              Online
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            </p>
          </div>
          <button onClick={onProfileClick} className="w-9 h-9 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center overflow-hidden shadow-sm hover:border-brand-blue transition-all" title="Editar perfil">
            <UserCircle className="text-ui-muted" size={20} />
          </button>
        </div>

        <button 
          onClick={logout}
          className="p-2.5 rounded-xl text-brand-red hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  )
}

export default AdminNavbar
