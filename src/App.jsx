import { useMemo, useState, useEffect } from 'react'
import { useAuthSession } from './shared/hooks/useAuthSession.jsx'
import Header from './components/layout/Header.jsx'
import OrderSummary from './components/layout/OrderSummary.jsx'
import Stepper from './components/ui/Stepper.jsx'
import { STEPS_ORDER } from './shared/constants/index.jsx'
import { useOrder } from './shared/hooks/useOrder.jsx'
import { getAvailablePlates } from './shared/config/api.js'
import LocationPage from './pages/Location.jsx'
import SizePage from './pages/Size.jsx'
import SaucePage from './pages/Sauce.jsx'
import ProteinPage from './pages/Protein.jsx'
import ComplementPage from './pages/Complement.jsx'
import BaseRecipePage from './pages/BaseRecipe.jsx'
import SummaryPage from './pages/Summary.jsx'
import CustomerPage from './pages/Customer.jsx'
import ConfirmationPage from './pages/Confirmation.jsx'
import AdminPage from './pages/Admin.jsx'
import ChefPage from './pages/Chef.jsx'
import RepartidorPage from './pages/Repartidor.jsx'
import ProfileModal from './components/ui/ProfileModal.jsx'
import LandingPage from './pages/Landing.jsx'

function CustomerFlow({ onToggleTheme, currentTheme }) {
  const [currentStep, setCurrentStep] = useState('LOCATION')
  const {
    order,
    availablePlates,
    setAvailablePlates,
    updateOrder,
    updateCurrentPlate,
    addCurrentPlateToCart,
    setLastOrder,
    resetOrder,
  } = useOrder()

  useEffect(() => {
    let mounted = true

    const loadAvailablePlates = async () => {
      try {
        const response = await getAvailablePlates()
        if (mounted) {
          setAvailablePlates(Number(response.data?.count || 0))
        }
      } catch {
        if (mounted) setAvailablePlates(0)
      }
    }

    loadAvailablePlates()
    const interval = setInterval(loadAvailablePlates, 15000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [setAvailablePlates])

  const nextStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep)
    if (currentIndex >= 0 && currentIndex < STEPS_ORDER.length - 1) {
      setCurrentStep(STEPS_ORDER[currentIndex + 1])
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS_ORDER[currentIndex - 1])
      window.scrollTo(0, 0)
    }
  }

  const handleResetApp = () => {
    resetOrder()
    setCurrentStep('LOCATION')
    window.scrollTo(0, 0)
  }

  const handleAddCurrentPlateToCart = () => {
    addCurrentPlateToCart()
    setCurrentStep('SAUCE')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (step) => {
    setCurrentStep(step)
    window.scrollTo(0, 0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'LOCATION':
        return (
          <LocationPage
            onConfirm={(data) => {
              if (data?.phone) {
                updateOrder({
                  customer: {
                    ...order.customer,
                    phone: data.phone,
                    phoneLocal: data.phoneLocal,
                    phoneVerified: true,
                  },
                })
              }
              nextStep()
            }}
          />
        )

      case 'SIZE':
        return <SizePage order={order} updateOrder={updateOrder} onNext={nextStep} onBack={prevStep} />
      case 'SAUCE':
        return <SaucePage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />
      case 'PROTEIN':
        return <ProteinPage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />
      case 'COMPLEMENT':
        return <ComplementPage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />
      case 'BASE_RECIPE':
        return <BaseRecipePage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} />
      case 'SUMMARY':
        return <SummaryPage order={order} onNext={nextStep} onBack={prevStep} onEdit={goToStep} onAddAnother={handleAddCurrentPlateToCart} />
      case 'CUSTOMER':
        return <CustomerPage order={order} updateOrder={updateOrder} setLastOrder={setLastOrder} onNext={nextStep} onBack={prevStep} />
      case 'CONFIRMATION':
        return <ConfirmationPage order={order} onReset={handleResetApp} />
      default:
        return <div>Vista no disponible</div>
    }
  }

  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text relative transition-colors duration-300">
      {currentStep === 'LOCATION' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 sm:pt-4">
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} availableCount={availablePlates} />
          {renderStep()}
        </div>
      ) : (
        <div className="pb-40 lg:pb-20 pt-20 sm:pt-24 lg:pt-32">
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} availableCount={availablePlates} />
          <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-8">
              <div className="flex-1 w-full max-w-3xl">
                <Stepper currentStep={currentStep} />
                <div className="bg-ui-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-10 shadow-xl border border-ui-border min-h-[400px] sm:min-h-[500px] animate-fade-in transition-all">
                  {renderStep()}
                </div>
                <div className="mt-8 text-center text-xs text-ui-muted font-medium space-y-1 mb-8">
                  <p>© 2026 Chilaquiles TOP.</p>
                  <p className="opacity-75">Hecho al momento.</p>
                </div>
              </div>
              <OrderSummary order={order} currentStep={currentStep} onEdit={goToStep} onNext={nextStep} onAddAnother={handleAddCurrentPlateToCart} />
            </div>
          </main>
        </div>
      )}
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const host = window.location.hostname.replace(/^www\./, '')
    const currentPath = window.location.pathname

    let nextPath = currentPath

    if (currentPath === '/') {
      if (host === 'admin.chilaquilestop.com') nextPath = '/admin'
      else if (host === 'chef.chilaquilestop.com') nextPath = '/chef'
      else if (host === 'repartidor.chilaquilestop.com') nextPath = '/repartidor'
      else if (host === 'pedidos.chilaquilestop.com') nextPath = '/clientes'
      else if (host === 'chilaquilestop.com') nextPath = '/'
    }

    if (nextPath !== currentPath) {
      window.history.replaceState({}, '', nextPath)
    }

    setPath(nextPath)
  }, [])

  const panelRole =
    path === '/admin'
      ? 'ADMIN'
      : path === '/chef'
        ? 'CHEF'
        : path === '/repartidor'
          ? 'REPARTIDOR'
          : null

  const authSession = useAuthSession(panelRole)


  useEffect(() => {
    let alive = true

    const checkAppVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
        const data = await response.json()
        const buildId = data?.buildId
        const storedBuildId = localStorage.getItem('chila_app_build_id')

        if (buildId && storedBuildId && storedBuildId !== buildId && alive) {
          localStorage.setItem('chila_app_build_id', buildId)
          window.location.reload()
          return
        }

        if (buildId && !storedBuildId) {
          localStorage.setItem('chila_app_build_id', buildId)
        }
      } catch {
        // No bloquear la app si no se puede leer la versión.
      }
    }

    checkAppVersion()
    const interval = setInterval(checkAppVersion, 60000)
    window.addEventListener('focus', checkAppVersion)

    return () => {
      alive = false
      clearInterval(interval)
      window.removeEventListener('focus', checkAppVersion)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const renderPanel = (Component) => (
    <div className="min-h-screen bg-ui-bg transition-colors duration-300">
      <Component authSession={authSession} onProfileClick={() => setIsProfileOpen(true)} />

      {authSession.session && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={authSession.session}
          onUpdate={authSession.refreshSession}
        />
      )}
    </div>
  )

  if (path === '/admin') return renderPanel(AdminPage)
  if (path === '/chef') return renderPanel(ChefPage)
  if (path === '/repartidor') return renderPanel(RepartidorPage)
  if (path === '/clientes') return <CustomerFlow onToggleTheme={toggleTheme} currentTheme={theme} />
  if (path === '/') return <LandingPage />

  return <LandingPage />

  return <CustomerFlow onToggleTheme={toggleTheme} currentTheme={theme} />
}

export default App
