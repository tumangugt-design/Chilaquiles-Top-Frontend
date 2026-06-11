import { useMemo, useState, useEffect } from 'react'
import { useAuthSession } from './shared/hooks/useAuthSession.jsx'
import Header from './components/layout/Header.jsx'
import OrderSummary from './components/layout/OrderSummary.jsx'
import Stepper from './components/ui/Stepper.jsx'
import { STEPS_ORDER, normalizePromotionForOrder, getPromoConstraint } from './shared/constants/index.jsx'
import { useOrder } from './shared/hooks/useOrder.jsx'
import { getAvailablePlates, getOperatingHours } from './shared/config/api.js'
import LocationPage from './pages/Location.jsx'
import SizePage from './pages/Size.jsx'
import SaucePage from './pages/Sauce.jsx'
import ProteinPage from './pages/Protein.jsx'
import ComplementPage from './pages/Complement.jsx'
import BaseRecipePage from './pages/BaseRecipe.jsx'
import SummaryPage from './pages/Summary.jsx'
import TemperaturePage from './pages/Temperature.jsx'
import CustomerPage from './pages/Customer.jsx'
import PlateCopyChoice from './pages/PlateCopyChoice.jsx'
import ConfirmationPage from './pages/Confirmation.jsx'
import AdminPage from './pages/Admin.jsx'
import ChefPage from './pages/Chef.jsx'
import RepartidorPage from './pages/Repartidor.jsx'
import ProfileModal from './components/ui/ProfileModal.jsx'
import LandingPage from './pages/Landing.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import DataDeletion from './pages/DataDeletion.jsx'


function CustomerFlow({ onToggleTheme, currentTheme }) {
  const [currentStep, setCurrentStep] = useState('LOCATION')
  const [isClosed, setIsClosed] = useState(true)
  const {
    order,
    availablePlates,
    setAvailablePlates,
    updateOrder,
    updateCurrentPlate,
    addCurrentPlateToCart,
    restoreLastCartPlate,
    setLastOrder,
    resetOrder,
  } = useOrder()

  useEffect(() => {
    let mounted = true

    const loadAvailablePlates = async () => {
      try {
        const [platesResponse, hoursResponse] = await Promise.all([
          getAvailablePlates(),
          getOperatingHours()
        ])
        if (mounted) {
          setAvailablePlates(Number(platesResponse.data?.count || 0))
          setIsClosed(!hoursResponse.data?.isCurrentlyOpen)
        }
      } catch {
        if (mounted) {
          setAvailablePlates(0)
          setIsClosed(false)
        }
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
      let nextIndex = currentIndex + 1
      if (order.isPromo && currentStep === 'SIZE') {
        nextIndex = STEPS_ORDER.indexOf('BASE_RECIPE')
      } else if (order.isPromo && currentStep === 'BASE_RECIPE') {
        nextIndex = STEPS_ORDER.indexOf('SUMMARY')
      } else if (order.isPromo && currentStep === 'SUMMARY') {
        nextIndex = STEPS_ORDER.indexOf('TEMPERATURE')
      }
      const nextStepName = STEPS_ORDER[nextIndex]

      if (nextStepName === 'BASE_RECIPE') {
        const updatedCurrentPlate = {
          ...order.currentPlate,
          baseRecipe: {
            onion: true,
            cilantro: true,
            cream: true,
          },
        }
        if (order.isPromo) {
          const updatedCart = order.cart.map((plate) => ({
            ...plate,
            baseRecipe: {
              onion: true,
              cilantro: true,
              cream: true,
            },
          }))
          updateOrder({ cart: updatedCart, currentPlate: updatedCurrentPlate })
        } else {
          updateOrder({ currentPlate: updatedCurrentPlate })
        }
      }

      setCurrentStep(nextStepName)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep)
    if (currentIndex > 0) {
      let prevIndex = currentIndex - 1
      if (order.isPromo && currentStep === 'TEMPERATURE') {
        prevIndex = STEPS_ORDER.indexOf('SUMMARY')
      } else if (order.isPromo && currentStep === 'SUMMARY') {
        prevIndex = STEPS_ORDER.indexOf('BASE_RECIPE')
      } else if (order.isPromo && currentStep === 'BASE_RECIPE') {
        prevIndex = STEPS_ORDER.indexOf('SIZE')
      }
      setCurrentStep(STEPS_ORDER[prevIndex])
      window.scrollTo(0, 0)
    }
  }

  const handleResetApp = () => {
    resetOrder()
    setCurrentStep('LOCATION')
    window.scrollTo(0, 0)
  }

  const handleApplyPromotion = (promo) => {
    const appliedPromo = normalizePromotionForOrder(promo)
    const forcedPlate = {}
    const forcedSauce = getPromoConstraint(appliedPromo, 'sauce')
    const forcedProtein = getPromoConstraint(appliedPromo, 'protein')
    const forcedComplement = getPromoConstraint(appliedPromo, 'complement')

    if (forcedSauce !== 'ALL') forcedPlate.sauce = forcedSauce
    if (forcedProtein !== 'ALL') forcedPlate.protein = forcedProtein
    if (forcedComplement !== 'ALL') forcedPlate.complement = forcedComplement
    if (appliedPromo.recipe?.baseRecipe) forcedPlate.baseRecipe = appliedPromo.recipe.baseRecipe

    updateOrder({ appliedPromo, requestedCount: appliedPromo.requestedCount })
    if (Object.keys(forcedPlate).length > 0) updateCurrentPlate(forcedPlate)
  }

  const buildPromoDefaults = () => {
    if (!order.appliedPromo) return {}
    const nextPlate = {}
    const forcedSauce = getPromoConstraint(order.appliedPromo, 'sauce')
    const forcedProtein = getPromoConstraint(order.appliedPromo, 'protein')
    const forcedComplement = getPromoConstraint(order.appliedPromo, 'complement')
    if (forcedSauce !== 'ALL') nextPlate.sauce = forcedSauce
    if (forcedProtein !== 'ALL') nextPlate.protein = forcedProtein
    if (forcedComplement !== 'ALL') nextPlate.complement = forcedComplement
    if (order.appliedPromo.recipe?.baseRecipe) {
      nextPlate.baseRecipe = { ...order.appliedPromo.recipe.baseRecipe }
    }
    return nextPlate
  }

  const clonePlate = (plate = {}) => ({
    sauce: plate.sauce,
    protein: plate.protein,
    complement: plate.complement,
    baseRecipe: {
      onion: plate.baseRecipe?.onion !== false,
      cilantro: plate.baseRecipe?.cilantro !== false,
      cream: plate.baseRecipe?.cream !== false,
    },
  })

  const handleAddCurrentPlateToCart = () => {
    addCurrentPlateToCart()
    const promoDefaults = buildPromoDefaults()
    if (Object.keys(promoDefaults).length > 0) updateCurrentPlate(promoDefaults)
    setCurrentStep('COPY_PLATE')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopyPlate = (sourcePlate) => {
    updateCurrentPlate(clonePlate(sourcePlate))
    setCurrentStep('SUMMARY')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCustomizePlate = () => {
    setCurrentStep('SAUCE')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromCopyChoice = () => {
    restoreLastCartPlate()
    setCurrentStep('SUMMARY')
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
                const savedCustomer = data.customer || {}
                updateOrder({
                  customer: {
                    ...order.customer,
                    name: savedCustomer.name || order.customer.name || '',
                    address: savedCustomer.address || order.customer.address || '',
                    accessCode: savedCustomer.accessCode || order.customer.accessCode || '',
                    location: null,
                    phone: data.phone,
                    phoneLocal: data.phoneLocal,
                    phoneVerified: true,
                  },
                })
              }
              if (order.appliedPromo?.requestedCount) {
                setCurrentStep('SAUCE')
                window.scrollTo(0, 0)
              } else {
                nextStep()
              }
            }}
            onApplyPromo={handleApplyPromotion}
          />
        )

      case 'SIZE':
        return <SizePage order={order} updateOrder={updateOrder} onNext={nextStep} onBack={prevStep} />
      case 'SAUCE':
        return <SaucePage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} appliedPromo={order.appliedPromo} />
      case 'PROTEIN':
        return <ProteinPage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} appliedPromo={order.appliedPromo} />
      case 'COMPLEMENT':
        return <ComplementPage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} appliedPromo={order.appliedPromo} />
      case 'BASE_RECIPE':
        return <BaseRecipePage plate={order.currentPlate} plateNumber={order.cart.length + 1} updatePlate={updateCurrentPlate} onNext={nextStep} onBack={prevStep} order={order} updateOrder={updateOrder} />
      case 'SUMMARY':
        return <SummaryPage order={order} updateOrder={updateOrder} onNext={nextStep} onBack={prevStep} onEdit={goToStep} onAddAnother={handleAddCurrentPlateToCart} />
      case 'COPY_PLATE':
        return (
          <PlateCopyChoice
            sourcePlates={order.cart}
            nextPlateNumber={order.cart.length + 1}
            onCopyPlate={handleCopyPlate}
            onCustomize={handleCustomizePlate}
            onBack={handleBackFromCopyChoice}
          />
        )
      case 'TEMPERATURE':
        return <TemperaturePage order={order} updateOrder={updateOrder} onNext={nextStep} onBack={prevStep} />
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
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} availableCount={availablePlates} isClosed={isClosed} />
          {renderStep()}
        </div>
      ) : (
        <div className="pb-40 lg:pb-20 pt-20 sm:pt-24 lg:pt-32">
          <Header onToggleTheme={onToggleTheme} currentTheme={currentTheme} availableCount={availablePlates} isClosed={isClosed} />
          <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-8">
              <div className="flex-1 w-full max-w-3xl">
                <Stepper currentStep={currentStep} isPromo={order.isPromo} />
                <div className="bg-ui-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-10 shadow-xl border border-ui-border min-h-[400px] sm:min-h-[500px] animate-fade-in transition-all">
                  {renderStep()}
                </div>
                <div className="mt-8 text-center text-xs text-ui-muted font-medium space-y-2 mb-8">
                  <p>© 2026 Chilaquiles TOP. <span className="opacity-75">Hecho al momento.</span></p>
                  <div className="flex justify-center gap-4 text-[10px] opacity-75">
                    <a href="/privacidad" className="hover:text-brand-blue transition-colors">Privacidad</a>
                    <span>•</span>
                    <a href="/terminos" className="hover:text-brand-blue transition-colors">Condiciones</a>
                    <span>•</span>
                    <a href="/eliminacion-datos" className="hover:text-brand-blue transition-colors">Eliminación de datos</a>
                  </div>
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
          // Forzar la recarga ignorando la caché (si hay SW o caché agresiva)
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map(key => caches.delete(key)));
            } catch (e) {
              // Ignore
            }
          }
          window.location.href = window.location.pathname + '?v=' + buildId;
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
  if (path === '/privacidad') return <PrivacyPolicy />
  if (path === '/terminos') return <TermsOfService />
  if (path === '/eliminacion-datos') return <DataDeletion />
  if (path === '/') return <LandingPage />

  return <LandingPage />

  return <CustomerFlow onToggleTheme={toggleTheme} currentTheme={theme} />
}

export default App
