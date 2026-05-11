import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header.jsx'
import OrderSummary from '../components/layout/OrderSummary.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Button from '../components/ui/Button.jsx'
import { useOrder } from '../shared/hooks/useOrder.jsx'
import { STEPS_ORDER } from '../shared/constants/index.jsx'
import { getAvailablePlates } from '../shared/config/api.js'
import SizePage from './Size.jsx'
import SaucePage from './Sauce.jsx'
import ProteinPage from './Protein.jsx'
import ComplementPage from './Complement.jsx'
import BaseRecipePage from './BaseRecipe.jsx'
import SummaryPage from './Summary.jsx'
import CustomerPage from './Customer.jsx'
import ConfirmationPage from './Confirmation.jsx'
import toast from 'react-hot-toast'

const normalizeGtPhone = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('502')) digits = digits.slice(3)
  return digits.slice(0, 8)
}

const toFullGtPhone = (raw = '') => {
  const digits = normalizeGtPhone(raw)
  return digits ? `+502${digits}` : ''
}

const InternalPhoneStart = ({ order, updateOrder, availablePlates, onNext }) => {
  const [phone, setPhone] = useState(normalizeGtPhone(order.customer?.phone || ''))

  const canContinue = phone.length === 8 && Number(availablePlates || 0) > 0

  const handleContinue = () => {
    if (Number(availablePlates || 0) <= 0) {
      toast.error('No hay platos disponibles por el momento. Vuelve en otro momento.')
      return
    }

    if (phone.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos.')
      return
    }

    updateOrder({
      customer: {
        ...order.customer,
        phone: toFullGtPhone(phone),
        phoneLocal: phone,
        phoneVerified: true,
      },
    })
    onNext()
  }

  return (
    <div className="bg-ui-card rounded-3xl p-6 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up border border-ui-border transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-3 tracking-tight">
          Nuevo pedido interno
        </h2>
        {Number(availablePlates || 0) <= 0 && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">
            No hay platos disponibles por el momento. Vuelve en otro momento.
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="text-left">
          <label className="block text-sm font-bold text-ui-text mb-2 ml-1">Número de teléfono</label>
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center whitespace-nowrap bg-ui-bg px-3 py-3.5 rounded-xl border border-ui-border">
              <span className="text-sm font-bold text-ui-muted whitespace-nowrap">🇬🇹 +502</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(normalizeGtPhone(event.target.value))}
              placeholder="33662977"
              maxLength={8}
              inputMode="numeric"
              autoFocus
              className="min-w-0 flex-1 p-3.5 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-lg font-bold tracking-wider"
            />
          </div>
        </div>

        <Button fullWidth onClick={handleContinue} disabled={!canContinue} className="text-base sm:text-lg">
          Continuar pedido →
        </Button>
      </div>
    </div>
  )
}

const InternalOrder = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState('PHONE')
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
        if (mounted) setAvailablePlates(Number(response.data?.count || 0))
      } catch {
        if (mounted) setAvailablePlates(0)
      }
    }

    loadAvailablePlates()
    const interval = setInterval(loadAvailablePlates, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [setAvailablePlates])

  const flowSteps = useMemo(() => ['PHONE', ...STEPS_ORDER.filter((step) => step !== 'LOCATION')], [])

  const nextStep = () => {
    const currentIndex = flowSteps.indexOf(currentStep)
    if (currentIndex >= 0 && currentIndex < flowSteps.length - 1) {
      setCurrentStep(flowSteps[currentIndex + 1])
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    const currentIndex = flowSteps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(flowSteps[currentIndex - 1])
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step) => {
    setCurrentStep(step)
    window.scrollTo(0, 0)
  }

  const handleAddCurrentPlateToCart = () => {
    addCurrentPlateToCart()
    setCurrentStep('SAUCE')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetApp = () => {
    resetOrder()
    setCurrentStep('PHONE')
    onSuccess?.()
    window.scrollTo(0, 0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'PHONE':
        return <InternalPhoneStart order={order} updateOrder={updateOrder} availablePlates={availablePlates} onNext={nextStep} />
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
        return <CustomerPage order={order} updateOrder={updateOrder} setLastOrder={setLastOrder} onNext={nextStep} onBack={prevStep} isInternal />
      case 'CONFIRMATION':
        return <ConfirmationPage order={order} onReset={handleResetApp} />
      default:
        return null
    }
  }

  if (currentStep === 'PHONE') {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4 pt-8">
        {renderStep()}
      </div>
    )
  }

  return (
    <div className="pb-32 lg:pb-16 pt-4">
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-8">
          <div className="flex-1 w-full max-w-3xl">
            <Stepper currentStep={currentStep} />
            <div className="bg-ui-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-10 shadow-xl border border-ui-border min-h-[400px] sm:min-h-[500px] animate-fade-in transition-all">
              {renderStep()}
            </div>
          </div>
          <OrderSummary order={order} currentStep={currentStep} onEdit={goToStep} onNext={nextStep} onAddAnother={handleAddCurrentPlateToCart} />
        </div>
      </main>
    </div>
  )
}

export default InternalOrder
