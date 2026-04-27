import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)

  return (
    <div className="bg-ui-card rounded-3xl p-6 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up border border-ui-border transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-4 sm:mb-8">
        <div className="w-32 h-24 sm:w-48 sm:h-32 mx-auto mb-2 relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-blue/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <Logo className="w-full h-full drop-shadow-md" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-3 tracking-tight">
          {error ? 'Ubicación no disponible' : '¿Estás en Villa Nueva?'}
        </h2>

        <p className="text-ui-muted leading-relaxed text-sm sm:text-base px-2">
          {error
            ? 'Por el momento nuestro servicio es exclusivo para residentes y visitantes dentro de Villa Nueva.'
            : 'Arma tu orden y completa tus datos al final.'}
        </p>
      </div>

      {!error && (
        <div className="space-y-4">
          <Button fullWidth onClick={onConfirm} variant="primary" className="text-lg">
            Sí, estoy aquí
          </Button>

          <button
            onClick={() => setError(true)}
            className="block w-full py-3 text-ui-muted text-sm font-semibold hover:text-ui-text transition-colors"
          >
            No, cambiar ubicación
          </button>
        </div>
      )}

      {error && (
        <div className="space-y-4">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-medium mb-4 border border-red-500/20">
            Lo sentimos, no podemos procesar tu pedido fuera del área de cobertura.
          </div>

          <Button variant="secondary" fullWidth onClick={() => setError(false)}>
            Volver a intentar
          </Button>
        </div>
      )}

      <div className="mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-ui-border/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
          <span className="text-[10px] sm:text-xs font-semibold text-ui-muted">
            Servicio activo en zona
          </span>
        </div>
      </div>
    </div>
  )
}

export default LocationPage
