import { ChefHat, Truck, UserCircle, LogOut, ClipboardList } from 'lucide-react'

const roleMeta = {
  CHEF: {
    label: 'Cocina',
    title: 'Centro de Producción',
    Icon: ChefHat,
    accentClass: 'bg-brand-orange shadow-brand-orange/20',
    activeClass: 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
  },
  REPARTIDOR: {
    label: 'Repartidor',
    title: 'Logística de Entrega',
    Icon: Truck,
    accentClass: 'bg-[#4CAF50] shadow-green-600/20',
    activeClass: 'bg-[#4CAF50] text-white shadow-md shadow-green-600/20'
  }
}

const StaffNavbar = ({ role = 'CHEF', session, logout, activeLabel = 'Pedidos', count = 0, isRefreshing = false }) => {
  const meta = roleMeta[role] || roleMeta.CHEF
  const Icon = meta.Icon

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-ui-border z-[70] shadow-sm flex items-center px-6 lg:px-10 justify-between">
      <div className="flex items-center gap-4 shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${meta.accentClass}`}>
          <Icon className="text-white" size={24} />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-black text-lg text-ui-text leading-none uppercase tracking-tighter italic">
            Chila<span className="text-brand-blue">Quiles</span>
          </h1>
          <p className="text-[9px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-0.5">{meta.label}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 gap-2 overflow-x-auto no-scrollbar">
        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider whitespace-nowrap ${meta.activeClass}`}>
          <ClipboardList size={16} />
          <span>{activeLabel}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{count}</span>
        </button>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-ui-border">
          <div className="text-right">
            <p className="text-[10px] font-black text-ui-text uppercase leading-none">{session?.name || meta.label}</p>
            <p className="text-[8px] font-bold text-green-600 uppercase mt-1 flex items-center justify-end gap-1">
              Online
              <span className={`w-1.5 h-1.5 bg-green-500 rounded-full ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`} />
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center overflow-hidden shadow-sm">
            <UserCircle className="text-ui-muted" size={20} />
          </div>
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

export default StaffNavbar
