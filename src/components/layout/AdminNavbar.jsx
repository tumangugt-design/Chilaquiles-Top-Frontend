import React from 'react'
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
  Gift
} from 'lucide-react'

const navigationSections = [
  {
    title: 'Ventas',
    items: [
      { id: 'orders', label: 'Pedidos', icon: ClipboardList },
      { id: 'internal_order', label: 'Nuevo Pedido', icon: PlusCircle },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'staff', label: 'Personal', icon: Users },
      { id: 'clients', label: 'Clientes', icon: UserCircle },
      { id: 'promotions', label: 'Promociones', icon: Gift },
      { id: 'finances', label: 'Finanzas', icon: TrendingUp },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { id: 'entries', label: 'Entradas', icon: PackagePlus },
      { id: 'inventory', label: 'Stock', icon: Box },
      { id: 'recipe_book', label: 'Recetario', icon: ClipboardList },
      { id: 'schedule', label: 'Horario', icon: Clock },
    ],
  },
]

const DesktopNavButton = ({ item, activeTab, setActiveTab }) => {
  const Icon = item.icon
  const isActive = activeTab === item.id

  return (
    <button
      type="button"
      onClick={() => setActiveTab(item.id)}
      className={`group flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all xl:px-3 2xl:h-11 2xl:px-4 ${
        isActive
          ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
          : 'text-ui-muted hover:bg-white hover:text-brand-blue hover:shadow-sm'
      }`}
      title={item.label}
    >
      <Icon size={16} strokeWidth={2.5} />
      <span className="hidden xl:inline">{item.label}</span>
    </button>
  )
}

const MobileNavButton = ({ item, activeTab, onSelect }) => {
  const Icon = item.icon
  const isActive = activeTab === item.id

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
        isActive
          ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
          : 'text-ui-text hover:bg-ui-bg'
      }`}
    >
      <Icon size={19} strokeWidth={2.5} />
      <span>{item.label}</span>
    </button>
  )
}

const AdminNavbar = ({ activeTab, setActiveTab, session, logout, onProfileClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const adminName = session?.name || 'Admin'

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav className="fixed left-0 right-0 top-0 z-[70] h-16 border-b border-ui-border bg-white/95 px-3 shadow-sm backdrop-blur-xl md:h-[72px] sm:px-5 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-[1920px] items-center gap-2 lg:gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2 lg:gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-blue shadow-lg shadow-brand-blue/20 sm:flex lg:h-11 lg:w-11">
            <LayoutDashboard className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <Logo className="h-auto w-24 shrink-0 drop-shadow-sm sm:w-28 lg:w-[118px] 2xl:w-[132px]" />
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-[1.35rem] border border-ui-border/70 bg-ui-bg/70 px-1.5 py-1">
            {navigationSections.map((section, sectionIndex) => (
              <React.Fragment key={section.title}>
                {sectionIndex > 0 && <div className="mx-1 hidden h-7 w-px shrink-0 bg-ui-border 2xl:block" />}
                {section.items.map((item) => (
                  <DesktopNavButton
                    key={item.id}
                    item={item}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 border-l border-ui-border pl-3 lg:flex">
            <button
              type="button"
              onClick={onProfileClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-ui-border bg-ui-bg text-ui-muted shadow-sm transition-all hover:border-brand-blue hover:text-brand-blue lg:h-11 lg:w-11"
              title="Editar perfil"
            >
              <UserCircle size={22} strokeWidth={2.3} />
            </button>

            <div className="hidden max-w-[150px] text-right xl:block 2xl:max-w-[190px]">
              <p className="truncate text-[10px] font-black uppercase leading-none tracking-[0.08em] text-ui-text 2xl:text-[11px]">
                {adminName}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-[8px] font-black uppercase tracking-wider text-green-600">
                Online
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-brand-red transition-all hover:bg-red-50 lg:h-11 lg:w-11"
              title="Cerrar sesión"
            >
              <LogOut size={21} strokeWidth={2.3} />
            </button>
          </div>

          <button
            type="button"
            onClick={onProfileClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-ui-border bg-ui-bg text-ui-muted shadow-sm lg:hidden"
            title="Editar perfil"
          >
            <UserCircle size={21} strokeWidth={2.3} />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20 transition-all lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-3 top-[72px] z-[80] max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-[2rem] border border-ui-border bg-white p-4 shadow-2xl shadow-slate-900/15 lg:hidden">
          <div className="mb-4 rounded-3xl bg-ui-bg p-4">
            <p className="truncate text-sm font-black uppercase text-ui-text">{adminName}</p>
            <p className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </p>
          </div>

          <div className="space-y-4">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.22em] text-ui-muted">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <MobileNavButton
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                      onSelect={handleSelectTab}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-ui-border pt-4">
            <button
              type="button"
              onClick={() => {
                logout()
                setIsMobileMenuOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-brand-red transition-all hover:bg-red-50"
            >
              <LogOut size={19} strokeWidth={2.5} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default AdminNavbar
