import Logo from '../Logo.jsx';

const Header = ({ availableCount, onToggleTheme, currentTheme, isPanel = false, panelRole = null, userPhoto = null, onProfileClick }) => {
  const roleLabel = {
    ADMIN: 'ADMIN MODE',
    CHEF: 'CHEF MODE',
    REPARTIDOR: 'DEALER MODE'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-24 sm:h-12 sm:w-32 flex items-center overflow-hidden">
            <Logo className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
          </div>
          {isPanel && (
            <div className="hidden sm:block border-l pl-4 border-ui-border">
              <span className="text-sm font-bold text-brand-blue uppercase tracking-widest">Workspace</span>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {isPanel && panelRole && (
            <div className="flex items-center space-x-2 bg-ui-bg/50 px-3 py-1.5 rounded-full border border-ui-border">
              <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[10px] font-black text-ui-text uppercase tracking-tighter">{roleLabel[panelRole] || 'MODE'}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-ui-bg border border-ui-border hover:border-brand-blue transition-all group"
            title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {currentTheme === 'light' ? (
              <svg className="w-5 h-5 text-gray-700 group-hover:text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Live</span>
              </div>

              <div className="flex items-center bg-brand-blue/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-brand-blue/20">
                <span className="hidden xs:inline text-[10px] font-bold text-brand-blue uppercase mr-1.5 leading-none">
                  Platos:
                </span>
                <span className="text-sm font-extrabold text-brand-blue leading-none">{availableCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
