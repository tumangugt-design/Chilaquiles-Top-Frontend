import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const LocationPage = ({ onConfirm }) => {
  return (
    <div className="bg-ui-card rounded-3xl p-6 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up border border-ui-border transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />
      <div className="mb-6 sm:mb-8">
        <div className="w-32 h-24 sm:w-48 sm:h-32 mx-auto mb-2 relative flex items-center justify-center">
          <Logo className="w-full h-full drop-shadow-md" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-3 tracking-tight">
          Chilaquiles TOP
        </h2>
        <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
          Arma tu orden y completa tus datos al final.
        </p>
      </div>
      <div className="space-y-4">
        <Button fullWidth onClick={onConfirm} variant="primary" className="text-lg">
          Empezar
        </Button>
      </div>
    </div>
  )
}

export default LocationPage
