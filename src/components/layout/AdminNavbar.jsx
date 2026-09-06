import React, { useState, useEffect } from 'react'
import Logo from '../Logo.jsx'
import {
  Users,
  UserCircle,
  PackagePlus,
  Box,
  ClipboardList,
  PlusCircle,
  LogOut,
  LayoutDashboard,
  Clock,
  Menu,
  X,
  TrendingUp,
  Gift,
  ChevronRight,
  ChefHat,
  Truck,
  Building2
} from 'lucide-react'

const navigationSections = [
  {
    title: 'Distribución',
    items: [
      { id: 'internal_order', label: 'Nuevo Pedido', icon: PlusCircle },
      { id: 'orders', label: 'Pedidos', icon: ClipboardList },
      { id: 'chefs', label: 'Cocineros', icon: ChefHat },
      { id: 'drivers', label: 'Repartidores', icon: Truck },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { id: 'clients', label: 'Clientes', icon: UserCircle },
      { id: 'promotions', label: 'Promociones', icon: Gift },
      { id: 'campaigns', label: 'Campañas', icon: Gift },
      { id: 'content_studio', label: 'Estudio Contenido', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { id: 'entries', label: 'Entradas', icon: PackagePlus },
      { id: 'inventory', label: 'Stock', icon: Box },
      { id: 'recipe_book', label: 'Recetario', icon: ClipboardList },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'staff', label: 'Personal', icon: Users },
      { id: 'schedule', label: 'Horario', icon: Clock },
      { id: 'finances', label: 'Finanzas', icon: TrendingUp },
      { id: 'suppliers', label: 'Proveedores', icon: Building2 },
    ],
  },
]

const AdminNavbar = ({ activeTab, setActiveTab, session, logout, onProfileClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const adminName = session?.name || 'Admin'

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* 1. MOBILE TOP HEADER (<768px) */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ui-border bg-white/95 px-4 shadow-sm backdrop-blur-xl md:hidden">
        <Logo className="h-auto w-24 shrink-0 drop-shadow-sm" />
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onProfileClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ui-border bg-ui-bg text-ui-muted shadow-sm"
            title="Editar perfil"
          >
            <UserCircle size={18} strokeWidth={2.3} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </nav>

      {/* 2. MOBILE DRAWER OVERLAY & MENU (<768px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-ui-border pb-4">
                <Logo className="h-auto w-24 shrink-0" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-ui-bg text-ui-muted"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* User profile section */}
              <div className="rounded-2xl bg-ui-bg p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-ui-border flex items-center justify-center text-ui-muted shadow-sm">
                  <UserCircle size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black uppercase tracking-wider text-ui-text leading-none">{adminName}</p>
                  <p className="mt-1 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-green-600 leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Online
                  </p>
                </div>
              </div>

              {/* List of tabs grouped */}
              <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 no-scrollbar">
                {navigationSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="px-2 text-[9px] font-black uppercase tracking-[0.2em] text-ui-muted mb-1.5">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectTab(item.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-black uppercase tracking-wider transition-all ${
                            isActive
                              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                              : 'text-ui-text hover:bg-ui-bg'
                          }`}
                        >
                          <Icon size={16} strokeWidth={2.5} />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Logout button at bottom of drawer */}
            <div className="border-t border-ui-border pt-4 mt-auto">
              <button
                type="button"
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-black uppercase tracking-wider text-brand-red transition-all hover:bg-red-50"
              >
                <LogOut size={16} strokeWidth={2.5} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLET PORTRAIT SIDEBAR (md, 768px - 1024px) */}
      <aside className="fixed top-0 left-0 bottom-0 w-20 bg-white border-r border-ui-border flex-col items-center py-6 z-50 shadow-md hidden md:flex lg:hidden">
        {/* Logo Icon */}
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 mb-8 shrink-0">
          <LayoutDashboard className="text-white" size={20} strokeWidth={2.5} />
        </div>

        {/* Scrollable menu stack */}
        <div className="flex-1 w-full overflow-y-auto space-y-4 px-1.5 no-scrollbar py-2">
          {navigationSections.map((section) => (
            <div key={section.title} className="flex flex-col items-center gap-2">
              <div className="w-6 h-px bg-ui-border/60 my-0.5" />
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 relative group shrink-0 ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                        : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
                    }`}
                    title={item.label}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    <span className={`text-[8px] font-black uppercase text-center mt-1 tracking-tight truncate w-full px-0.5 ${isActive ? 'text-white' : 'text-ui-muted'}`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Profile and Logout at bottom */}
        <div className="mt-auto flex flex-col items-center gap-4 pt-4 border-t border-ui-border/80 w-full px-2">
          <button
            type="button"
            onClick={onProfileClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ui-border bg-ui-bg text-ui-muted shadow-sm transition-all hover:border-brand-blue hover:text-brand-blue"
            title="Editar perfil"
          >
            <UserCircle size={18} strokeWidth={2.3} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-red transition-all hover:bg-red-50 hover:text-brand-red"
            title="Cerrar sesión"
          >
            <LogOut size={18} strokeWidth={2.3} />
          </button>
        </div>
      </aside>

      {/* 4. LAPTOP / TABLET LANDSCAPE SIDEBAR (lg, >=1024px) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-ui-border flex-col py-6 z-50 shadow-md hidden lg:flex">
        {/* Header Section */}
        <div className="px-6 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 shrink-0">
            <LayoutDashboard className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <Logo className="h-auto w-24 shrink-0 drop-shadow-sm" />
            <p className="text-[8px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Menu Navigation Grouped */}
        <div className="flex-1 overflow-y-auto space-y-6 py-2 no-scrollbar">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="text-[9px] font-black text-ui-muted uppercase tracking-[0.2em] px-6 mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-[calc(100%-1.5rem)] flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group mx-3 ${
                        isActive
                          ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                          : 'text-ui-muted hover:bg-ui-bg hover:text-ui-text'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.5} className={isActive ? 'text-white' : 'group-hover:text-brand-blue'} />
                      <span className="text-[11px] font-black uppercase tracking-wider flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight size={12} className="text-white" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Profile info and logout at bottom */}
        <div className="px-3 pt-4 mt-auto border-t border-ui-border">
          <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-xl bg-ui-bg/50 border border-ui-border/40">
            <button
              onClick={onProfileClick}
              className="w-8 h-8 rounded-lg bg-white border border-ui-border flex items-center justify-center text-ui-muted shadow-sm hover:border-brand-blue hover:text-brand-blue transition-colors shrink-0"
              title="Editar perfil"
            >
              <UserCircle size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black uppercase leading-none text-ui-text tracking-wide">{adminName}</p>
              <p className="mt-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-green-600">
                Online
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-brand-red font-black text-[10px] uppercase tracking-wider hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminNavbar
