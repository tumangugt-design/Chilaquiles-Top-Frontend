import Logo from '../Logo.jsx';

const PanelShell = ({ title, subtitle, actions, children }) => {
  return (
    <div className="min-h-screen bg-brand-gray font-sans text-gray-900">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="h-16 w-32 sm:w-40 flex items-center overflow-hidden">
            <Logo className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PanelShell;
