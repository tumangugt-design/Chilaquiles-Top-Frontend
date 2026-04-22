import Logo from '../Logo.jsx'

const Header = ({ isPanel = false, panelRole = null, userPhoto = null, onProfileClick, onToggleTheme, currentTheme, availableCount = null }) => {
  return (
    <header className={`fixed top-0 inset-x-0 z-50 ${isPanel ? 'backdrop-blur-xl bg-ui-bg/80 border-b border-ui-border/50' : 'bg-gradient-to-b from-ui-bg via-ui-bg/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Logo className="w-15 h-15 sm:w-14 sm:h-14 drop-shadow-lg transition-transform hover:scale-105" />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full border border-ui-border bg-ui-card hover:bg-ui-bg transition-all flex items-center justify-center text-ui-text"
              aria-label="Cambiar tema"
            >
              {currentTheme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3c0 .34.02.67.05 1A7 7 0 0020 12c0 .27-.01.53-.04.79z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>
          )}

          {isPanel && (
            <button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-full border-2 border-brand-blue/30 overflow-hidden hover:border-brand-blue transition-all"
            >
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </button>
          )}

          {!isPanel && (
            <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                {typeof availableCount === 'number' ? ` · ${availableCount} plato${availableCount === 1 ? '' : 's'} disponible${availableCount === 1 ? '' : 's'}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
