const PanelShell = ({ title, subtitle, actions, children }) => {
  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text transition-colors duration-300">
      {/* Header is now handled globally in App.jsx */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="bg-ui-card rounded-[2.5rem] p-6 sm:p-12 shadow-xl border border-ui-border animate-fade-in transition-all">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-ui-border pb-8">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-ui-text mb-3 tracking-tighter">{title}</h1>
              <p className="text-ui-muted text-lg font-medium">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
          {children}
        </div>
        <div className="mt-12 text-center text-xs text-ui-muted font-bold opacity-50 uppercase tracking-widest">
          Chilaquiles TOP • Enterprise Management System
        </div>
      </main>
    </div>
  );
};

export default PanelShell;
