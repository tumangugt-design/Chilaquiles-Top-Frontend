// ============================================
// COMPONENTE: Header
// Barra de navegación superior fija
// ============================================

import Logo from '../Logo.jsx'

const Header = ({ availableCount }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center">
          <div className="h-16 w-32 sm:w-40 flex items-center overflow-hidden">
            <Logo className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
          </div>
        </div>

        {/* Status & Counter */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Cocina Abierta</span>
          </div>

          <div className="flex items-center bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
            <span className="text-[10px] sm:text-xs font-bold text-brand-blue uppercase mr-1.5 sm:mr-2 leading-none pt-0.5">
              Disponibles:
            </span>
            <span className="text-sm font-extrabold text-brand-blue leading-none">{availableCount}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
