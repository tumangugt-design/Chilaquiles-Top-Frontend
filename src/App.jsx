import { useMemo, useState, useEffect } from 'react';
import { useAuthSession } from './shared/hooks/useAuthSession.jsx';
import Header from './components/layout/Header.jsx';
import OrderSummary from './components/layout/OrderSummary.jsx';
import Stepper from './components/ui/Stepper.jsx';
import Mascot from './components/Mascot.jsx';
import { STEPS_ORDER } from './shared/constants/index.jsx';
import { useOrder } from './shared/hooks/useOrder.jsx';
import LocationPage from './pages/Location.jsx';
import SaucePage from './pages/Sauce.jsx';
import ProteinPage from './pages/Protein.jsx';
import ComplementPage from './pages/Complement.jsx';
import BaseRecipePage from './pages/BaseRecipe.jsx';
import SummaryPage from './pages/Summary.jsx';
import CustomerPage from './pages/Customer.jsx';
import ConfirmationPage from './pages/Confirmation.jsx';
import AdminPage from './pages/Admin.jsx';
import ChefPage from './pages/Chef.jsx';
import RepartidorPage from './pages/Repartidor.jsx';

function CustomerFlow({ onToggleTheme, currentTheme }) {
  const [currentStep, setCurrentStep] = useState('LOCATION');
  const {
    order,
    availablePlates,
    updateOrder,
    updateCurrentPlate,
    addCurrentPlateToCart,
    setLastOrder,
    resetOrder
  } = useOrder();

  const nextStep = () => {
    if (currentStep === 'LOCATION') {
      setCurrentStep('SAUCE');
      return;
    }
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < STEPS_ORDER.length - 1) {
      setCurrentStep(STEPS_ORDER[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS_ORDER[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleResetApp = () => {
    resetOrder();
    setCurrentStep('LOCATION');
    window.scrollTo(0, 0);
  };

  const handleAddCurrentPlateToCart = () => {
    addCurrentPlateToCart();
    setCurrentStep('SAUCE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'LOCATION':
        return <LocationPage onConfirm={nextStep} />;
      case 'SAUCE':
        return <SaucePage plate={order.currentPlate} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />;
      case 'PROTEIN':
        return <ProteinPage plate={order.currentPlate} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />;
      case 'COMPLEMENT':
        return <ComplementPage plate={order.currentPlate} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />;
      case 'BASE_RECIPE':
        return <BaseRecipePage plate={order.currentPlate} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />;
      case 'SUMMARY':
        return <SummaryPage order={order} onNext={nextStep} onBack={prevStep} onEdit={goToStep} onAddAnother={handleAddCurrentPlateToCart} />;
      case 'CUSTOMER':
        return <CustomerPage order={order} updateOrder={updateOrder} setLastOrder={setLastOrder} onNext={nextStep} onBack={prevStep} />;
      case 'CONFIRMATION':
        return <ConfirmationPage order={order} onReset={handleResetApp} />;
      default:
        return <div>Paso desconocido</div>;
    }
  };

  const isSidebarVisible = !['LOCATION', 'SUMMARY', 'CONFIRMATION'].includes(currentStep);
  const globalMascotClass = isSidebarVisible ? 'lg:hidden' : '';

  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text relative transition-colors duration-300">
      {currentStep === 'LOCATION' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} />
          {renderStep()}
        </div>
      ) : (
        <div className="pb-32 lg:pb-12 pt-20 lg:pt-28">
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
              <div className="flex-1 w-full max-w-3xl">
                <Stepper currentStep={currentStep} />
                <div className="bg-ui-card rounded-[2rem] p-4 sm:p-10 shadow-xl border border-ui-border min-h-[500px] animate-fade-in transition-all">
                  {renderStep()}
                </div>
                <div className="mt-8 text-center text-xs text-ui-muted font-medium space-y-1 mb-8">
                  <p>© 2026 Chilaquiles TOP.</p>
                  <p className="opacity-75">Comida, Precios, Experiencia. Aquí todo es TOP</p>
                </div>
              </div>
              <OrderSummary order={order} currentStep={currentStep} onEdit={goToStep} onNext={currentStep === 'CUSTOMER' ? nextStep : nextStep} onAddAnother={handleAddCurrentPlateToCart} />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

import ProfileModal from './components/ui/ProfileModal.jsx';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const path = useMemo(() => window.location.pathname, []);
  
  // Determine current panel role based on path
  const panelRole = path === '/admin' ? 'ADMIN' : path === '/chef' ? 'CHEF' : path === '/repartidor' ? 'REPARTIDOR' : null;
  const authSession = useAuthSession(panelRole);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const renderPanel = (Component) => (
    <div className="min-h-screen bg-ui-bg transition-colors duration-300">
      <Header 
        isPanel 
        panelRole={panelRole}
        userPhoto={authSession.session?.photoUrl}
        onProfileClick={() => setIsProfileOpen(true)}
        onToggleTheme={toggleTheme} 
        currentTheme={theme} 
      />
      <Component authSession={authSession} />
      
      {authSession.session && (
        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={authSession.session}
          onUpdate={authSession.refreshSession}
        />
      )}
    </div>
  );

  if (path === '/admin') return renderPanel(AdminPage);
  if (path === '/chef') return renderPanel(ChefPage);
  if (path === '/repartidor') return renderPanel(RepartidorPage);

  return (
    <CustomerFlow onToggleTheme={toggleTheme} currentTheme={theme} />
  );
}

export default App;
