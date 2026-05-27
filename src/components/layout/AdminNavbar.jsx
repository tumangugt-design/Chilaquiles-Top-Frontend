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
  Clock,
  ChevronDown,
  Menu,
  TrendingUp,
  Gift
} from 'lucide-react'

const navigation = {
  sales: [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'internal_order', label: 'Nuevo Pedido', icon: PlusCircle },
  ],
  management: [
    { id: 'staff', label: 'Personal', icon: Users },
    { id: 'clients', label: 'Clientes', icon: UserCircle },
    { id: 'promotions', label: 'Promociones', icon: Gift },
    { id: 'finances', label: 'Finanzas', icon: TrendingUp },
  ],
  inventory: [
    { id: 'entries', label: 'Entradas', icon: PackagePlus },
    { id: 'inventory', label: 'Stock', icon: Box },
    { id: 'schedule', label: 'Horario', icon: Clock },
  ]
}

const AdminNavbar = ({ activeTab, setActiveTab, session, logout, onProfileClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-ui-border z-[70] shadow-sm flex items-center px-4 sm:px-6 lg:px-10 justify-between">
      {/* Logo Section */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="hidden sm:flex w-10 h-10 bg-brand-blue rounded-xl items-center justify-center shadow-lg shadow-brand-blue/20">
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <div>
          <Logo className="w-24 h-10 sm:w-32 sm:h-14 drop-shadow-sm" />
        </div>
      </div>

      {/* Navigation Tabs (Desktop) */}
      <div className="hidden lg:flex flex-1 items-center justify-center px-8 gap-1 max-w-4xl">
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
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Actions & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 sm:gap-3 pr-3 sm:pr-4 border-r border-ui-border">
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
          className="hidden lg:block p-2.5 rounded-xl text-brand-red hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-ui-muted hover:text-ui-text hover:bg-ui-bg rounded-xl transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-ui-border shadow-xl lg:hidden flex flex-col p-4 max-h-[calc(100vh-5rem)] overflow-y-auto z-[80]">
          <div className="mb-4 pb-2 border-b border-ui-border">
            <p className="text-xs font-black text-ui-muted uppercase tracking-wider mb-2">Ventas</p>
            <div className="flex flex-col gap-1">
              {navigation.sales.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm ${
                    activeTab === id 
                      ? 'bg-brand-blue text-white shadow-md' 
                      : 'text-ui-text hover:bg-ui-bg'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 pb-2 border-b border-ui-border">
            <p className="text-xs font-black text-ui-muted uppercase tracking-wider mb-2">Gestión</p>
            <div className="flex flex-col gap-1">
              {navigation.management.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm ${
                    activeTab === id 
                      ? 'bg-ui-bg text-brand-blue border border-brand-blue/20' 
                      : 'text-ui-text hover:bg-ui-bg'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 pb-2 border-b border-ui-border">
            <p className="text-xs font-black text-ui-muted uppercase tracking-wider mb-2">Inventario</p>
            <div className="flex flex-col gap-1">
              {navigation.inventory.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm ${
                    activeTab === id 
                      ? 'bg-ui-bg text-brand-blue border border-brand-blue/20' 
                      : 'text-ui-text hover:bg-ui-bg'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-ui-muted uppercase tracking-wider mb-2">Cuenta</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { onProfileClick(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm text-ui-text hover:bg-ui-bg"
              >
                <UserCircle size={18} />
                <span>Mi Perfil</span>
              </button>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm text-brand-red hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default AdminNavbar
